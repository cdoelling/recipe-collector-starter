// Recipe prose with the one bit of markdown the house voice uses: **bold**
// for the warning that ruins the dish if you skip it.
export default function Rich({ text }) {
  if (!text) return null;
  return text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : part
  );
}
