import os from "node:os";

// This machine's LAN addresses, read fresh each time the dev server starts, so
// a new IP from the router needs no edit here.
const lanAddresses = Object.values(os.networkInterfaces())
  .flat()
  .filter((a) => a && a.family === "IPv4" && !a.internal)
  .map((a) => a.address);

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dev-only: without this, Next blocks HMR/dev resources from any origin
  // that isn't exactly "localhost", which silently breaks React hydration
  // (buttons render but do nothing) when opened via 127.0.0.1 or the LAN IP
  // — i.e. the iPad/phone.
  allowedDevOrigins: ["127.0.0.1", ...lanAddresses],
};

// `npm run build:share` → the read-only share site in out/, for GitHub Pages.
// Only *.share.js files count as pages/layouts there, so the app's API routes
// and server-only pages drop out; the app's own build ignores them in turn.
const shareConfig = {
  output: "export",
  distDir: "out",
  pageExtensions: ["share.js"],
  // /recipe/slug/index.html, which static hosts serve without rewrites.
  trailingSlash: true,
};

export default process.env.SHARE_BUILD === "1" ? shareConfig : nextConfig;
