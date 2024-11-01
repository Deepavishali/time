import React, { useState, useEffect } from 'react';

const cities = [
  { name: "Los Angeles" },
  { name: "Chicago" },
  { name: "New York" },
  { name: "Toronto" },
  { name: "São Paulo" },
];

const TimeDifferenceTable = ({ searchedCity }) => {
  const [searchedCityUTCOffset, setSearchedCityUTCOffset] = useState(null);
  const [cityOffsets, setCityOffsets] = useState({});

  const calculateUTCOffset = (timezone) => {
    const date = new Date();
    const targetTime = new Date(
      date.toLocaleString('en-US', { timeZone: timezone })
    );
    const utcOffsetMinutes = (targetTime.getTime() - date.getTime()) / 60000;
    const utcOffsetHours = Math.round(utcOffsetMinutes / 60);

    return utcOffsetHours;
  };

  useEffect(() => {
    if (!searchedCity) return;

    const fetchSearchedCityTime = async () => {
      try {
        const geocodeResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${searchedCity}&format=json&limit=1`
        );
        const geocodeData = await geocodeResponse.json();

        if (geocodeData.length > 0) {
          const { lat, lon } = geocodeData[0];
          const timeResponse = await fetch(
            `https://timeapi.io/api/Time/current/coordinate?latitude=${lat}&longitude=${lon}`
          );
          const timeData = await timeResponse.json();

          const timezone = timeData.timeZone;
          const utcOffset = calculateUTCOffset(timezone);

          setSearchedCityUTCOffset(utcOffset);
        }
      } catch (error) {
        console.error("Error fetching city time", error);
      }
    };

    fetchSearchedCityTime();
  }, [searchedCity]);

  useEffect(() => {
    const fetchCityOffsets = async () => {
      const offsets = {};

      for (let city of cities) {
        try {
          const geocodeResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${city.name}&format=json&limit=1`
          );
          const geocodeData = await geocodeResponse.json();

          if (geocodeData.length > 0) {
            const { lat, lon } = geocodeData[0];
            const timeResponse = await fetch(
              `https://timeapi.io/api/Time/current/coordinate?latitude=${lat}&longitude=${lon}`
            );
            const timeData = await timeResponse.json();

            const timezone = timeData.timeZone;
            const utcOffset = calculateUTCOffset(timezone);

            offsets[city.name] = utcOffset;
          }
        } catch (error) {
          console.error("Error fetching city time for", city.name, error);
        }
      }

      setCityOffsets(offsets);
    };

    fetchCityOffsets();
  }, []);

  if (searchedCityUTCOffset === null || Object.keys(cityOffsets).length === 0) {
    return <p>Loading time differences...</p>;
  }

  return (
    <div className="my-6 p-4">
      <h2 className="text-2xl font-bold mb-4" style={{ color: "#106EBE" }}>
        Time Difference from {searchedCity}
      </h2>
      <table className="w-full text-left border-collapse">
        <tbody>
          {cities.map((city, index) => {
            const cityUTCOffset = cityOffsets[city.name];

            if (cityUTCOffset === undefined) {
              return (
                <tr key={index}>
                  <td className="p-2 font-medium" style={{ color: "#106EBE" }}>{city.name}</td>
                  <td className="p-2" style={{ color: "#106EBE" }}>Unavailable</td>
                  <td className="p-2 text-[#106EBE]">N/A</td>
                </tr>
              );
            }

            const timeDifference = cityUTCOffset - searchedCityUTCOffset;

            return (
              <tr key={index}>
                <td className="p-2 font-medium" style={{ color: "#106EBE" }}>{city.name}</td>
                <td className="p-2">
                  <div className="relative w-full h-4">
                    <div
                      className="absolute top-0 h-full"
                      style={{
                        width: `calc(100% / 18 * ${Math.abs(timeDifference)})`,
                        backgroundColor: "#106EBE",
                      }}
                    ></div>
                  </div>
                </td>
                <td className="p-2" style={{ color: "#106EBE" }}>
                  {timeDifference >= 0 ? `+${timeDifference}` : timeDifference} hours
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TimeDifferenceTable;
