import WeatherIcon from "@/components/WeatherIcon";

// The week's high/low, food mood and five-day strip. `children` lands under the
// summary line — the share site puts its zip picker there.
export default function WeatherPanel({ weather, children }) {
  return (
    <>
      <div className="weather">
        <span className="range">
          <b>{weather.high != null ? `${weather.high}°` : "—"}</b>
          <i>/</i>
          <em>{weather.low != null ? `${weather.low}°` : "—"}</em>
        </span>
        <span className="mode" data-mode={weather.mode}>
          {weather.mode === "cozy" ? "cozy food" : "cool food"}
        </span>
        <p>
          {weather.ok
            ? `${weather.label} · the next ${weather.days} days run ${weather.low}° to ${weather.high}°, averaging ${weather.mean}°.`
            : `Couldn't reach the weather service, so this is a guess from the calendar.`}
        </p>
        {children}
      </div>

      {weather.forecast.length > 0 && (
        <div className="forecast">
          {weather.forecast.map((day) => (
            <div className="fday" key={day.date}>
              <span className="fday-label">{day.label}</span>
              <WeatherIcon condition={day.condition} />
              <span className="fday-high">{day.high != null ? `${day.high}°` : "—"}</span>
              {day.precip && (
                <span className="fday-precip" data-kind={day.condition === "snow" ? "snow" : "rain"}>
                  {day.condition === "snow" ? "Snow" : "Rain"}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
