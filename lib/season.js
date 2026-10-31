// The month's theme, shown above the roll on the share site. `mode` is the
// food mood to fall back on when there's no forecast to go by (no zip yet, or
// the weather service is down) — the same cozy/cool split recipes declare.
export const SEASONS = [
  { name: "Deep winter comfort", mode: "cozy" },
  { name: "Slow braises", mode: "cozy" },
  { name: "Late-winter greens", mode: "cozy" },
  { name: "Spring thaw", mode: "cozy" },
  { name: "Spring market", mode: "cool" },
  { name: "Early summer grill", mode: "cool" },
  { name: "High summer", mode: "cool" },
  { name: "Peak tomato", mode: "cool" },
  { name: "Late-summer harvest", mode: "cool" },
  { name: "Cozy harvest", mode: "cozy" },
  { name: "Gathering season", mode: "cozy" },
  { name: "Holiday hearth", mode: "cozy" },
];

export function seasonFor(date = new Date()) {
  const month = date.getMonth();
  return {
    ...SEASONS[month],
    month: date.toLocaleString("en-US", { month: "long" }),
  };
}
