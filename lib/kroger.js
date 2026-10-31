import fs from "node:fs";
import crypto from "node:crypto";
import { KROGER_FILE } from "./paths.js";
import { HOME, STORE_CHAIN } from "./home.js";

// Everything Kroger lives behind their v1 API. We only ever hold one kind of
// token: a *customer* token from the Authorization Code flow, which carries all
// three scopes below — so the same Bearer token searches products AND writes the
// cart. No separate client-credentials token to juggle.
const API = "https://api.kroger.com/v1";
const AUTHORIZE = `${API}/connect/oauth2/authorize`;
const TOKEN = `${API}/connect/oauth2/token`;
const SCOPES = "product.compact cart.basic:write profile.compact";

// The zip the roll already uses for weather (lib/home.js). Product search needs
// a location so it returns things actually stocked near you.
const HOME_ZIP = HOME.zip;
// Every Kroger banner is on the same API. Pin product search to one of
// STORE_CHAIN's stores so it never drifts to another banner's store.
const CHAIN = new RegExp(STORE_CHAIN.trim().split(/\s+/).join("\\s*"), "i");
// The goal is delivery; flip to "PICKUP" here if that ever changes.
const MODALITY = "DELIVERY";

// --- credentials ------------------------------------------------------------

export function config() {
  const clientId = process.env.KROGER_CLIENT_ID;
  const clientSecret = process.env.KROGER_CLIENT_SECRET;
  const redirectUri = process.env.KROGER_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    const err = new Error("Kroger credentials are missing from .env.local");
    err.code = "not_configured";
    throw err;
  }
  return { clientId, clientSecret, redirectUri };
}

function basicAuth() {
  const { clientId, clientSecret } = config();
  return "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
}

// --- token + location cache (data/kroger.json, gitignored) ------------------

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(KROGER_FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeStore(patch) {
  const next = { ...readStore(), ...patch };
  fs.writeFileSync(KROGER_FILE, JSON.stringify(next, null, 2));
  return next;
}

export function isConnected() {
  return Boolean(readStore().refreshToken);
}

// --- OAuth ------------------------------------------------------------------

export function authorizeUrl() {
  const { clientId, redirectUri } = config();
  // A short-lived state we check on the way back, guarding against a stray
  // callback. Single-user and local, so stashing it in the store is enough.
  const state = crypto.randomBytes(16).toString("hex");
  writeStore({ pendingState: state });
  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SCOPES,
    state,
  });
  return `${AUTHORIZE}?${params}`;
}

async function requestToken(body) {
  const res = await fetch(TOKEN, {
    method: "POST",
    headers: {
      Authorization: basicAuth(),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(body),
  });
  if (!res.ok) {
    throw new Error(`Kroger token request failed (${res.status}): ${await res.text()}`);
  }
  const json = await res.json();
  writeStore({
    accessToken: json.access_token,
    // Refresh a minute early so an in-flight request never races the expiry.
    accessExpiresAt: Date.now() + (json.expires_in - 60) * 1000,
    // A refresh only comes back on the auth-code exchange and (rotated) on some
    // refreshes; keep the last one we were given.
    ...(json.refresh_token ? { refreshToken: json.refresh_token } : {}),
  });
  return json.access_token;
}

export async function handleCallback(code, state) {
  const { redirectUri } = config();
  if (!state || state !== readStore().pendingState) {
    const err = new Error("State mismatch on Kroger callback");
    err.code = "bad_state";
    throw err;
  }
  writeStore({ pendingState: null });
  await requestToken({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });
}

async function getAccessToken() {
  const store = readStore();
  if (store.accessToken && store.accessExpiresAt > Date.now()) return store.accessToken;
  if (!store.refreshToken) {
    const err = new Error("Not connected to Kroger");
    err.code = "not_connected";
    throw err;
  }
  return requestToken({ grant_type: "refresh_token", refresh_token: store.refreshToken });
}

// --- products + cart --------------------------------------------------------

async function ensureLocation(token) {
  // A cache from before the King Soopers pin has no locationName; look it up again.
  const { locationId: cached, locationName } = readStore();
  if (cached && locationName) return cached;
  const params = new URLSearchParams({ "filter.zipCode.near": HOME_ZIP, "filter.limit": "10" });
  const res = await fetch(`${API}/locations?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Kroger locations lookup failed (${res.status})`);
  const { data } = await res.json();
  // Results come nearest first; take the nearest King Soopers.
  const store = (data ?? []).find((l) => CHAIN.test(l.chain ?? "") || CHAIN.test(l.name ?? ""));
  if (!store) throw new Error(`No ${STORE_CHAIN} store found near ${HOME_ZIP}`);
  writeStore({ locationId: store.locationId, locationName: store.name });
  return store.locationId;
}

async function searchProduct(term, locationId, token) {
  const params = new URLSearchParams({
    "filter.term": term,
    "filter.locationId": locationId,
    "filter.limit": "5",
  });
  const res = await fetch(`${API}/products?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Kroger product search failed (${res.status})`);
  const { data } = await res.json();
  // First result that has a UPC we can actually add to a cart.
  return (data ?? []).find((p) => p.upc) ?? null;
}

async function addToCart(lines, token) {
  const res = await fetch(`${API}/cart/add`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: lines.map(({ upc, quantity }) => ({ upc, quantity, modality: MODALITY })),
    }),
  });
  // Kroger answers a successful add with 204 No Content.
  if (!res.ok) throw new Error(`Kroger cart add failed (${res.status}): ${await res.text()}`);
}

// Take the shopping list [{ term, name, quantity }] → match each line to a real
// product and add the matches to the customer's cart. Returns what landed and
// what didn't so the UI can show it rather than pretend everything matched.
export async function sendListToCart(items) {
  const token = await getAccessToken();
  const locationId = await ensureLocation(token);

  const added = [];
  const missed = [];
  for (const item of items) {
    const quantity = Math.max(1, Math.round(item.quantity || 1));
    let product = await searchProduct(item.term, locationId, token);
    // Fall back to the raw ingredient text if the cleaned term found nothing.
    if (!product && item.name && item.name !== item.term) {
      product = await searchProduct(item.name, locationId, token);
    }
    if (product) {
      added.push({ upc: product.upc, quantity, name: item.name, matched: product.description });
    } else {
      missed.push({ name: item.name });
    }
  }

  if (added.length) {
    await addToCart(added.map(({ upc, quantity }) => ({ upc, quantity })), token);
  }
  return { added, missed, locationId };
}
