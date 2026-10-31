// Where you cook. The weather that steers the roll and the Kroger store search
// both start here, so this is the file to change in your own copy. Open-Meteo
// needs the coordinates; look them up once for your zip.
export const HOME = {
  zip: "80202",
  label: "Denver, CO",
  latitude: 39.7392,
  longitude: -104.9903,
  timezone: "America/Denver",
};

// The Kroger banner product search is pinned to (King Soopers, Kroger, Ralphs,
// Fred Meyer, Smith's…), so it never drifts to another banner's store.
export const STORE_CHAIN = "King Soopers";
// That banner's website, for the list's search links and the cart button.
export const STORE_SITE = "https://www.kingsoopers.com";
