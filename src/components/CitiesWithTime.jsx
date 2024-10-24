import { useState, useEffect } from 'react';

const CitiesWithTime = () => {
  const [cityTimes, setCityTimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cities = ['New York', 'London', 'Paris', 'Tokyo', 'Sydney', 'Berlin'];


  // Fetch city times from the API based on city geocode
  const fetchCityTimes = async () => {
    try {
      const updatedCityTimes = await Promise.all(
        cities.map(async (city) => {
          try {
            // Fetch geocode data
            const geocodeResponse = await fetch(
              `https://nominatim.openstreetmap.org/search?q=${city}&format=json&limit=1`
            );
            const geocodeData = await geocodeResponse.json();

            if (geocodeData.length > 0) {
              const { lat, lon } = geocodeData[0];

              // Fetch time data using latitude and longitude
              const timeResponse = await fetch(
                `https://timeapi.io/api/Time/current/coordinate?latitude=${lat}&longitude=${lon}`
              );
              const timeData = await timeResponse.json();

              // Return updated city object with time and UTC dateTime
              return { city, dateTime: new Date(timeData.dateTime).getTime() }; // Store time as UTC in ms
            } else {
              console.error(`Geocode data not found for ${city}`);
              return { city, dateTime: null };
            }
          } catch (error) {
            console.error(`Error fetching time for ${city}:`, error);
            return { city, dateTime: null };
          }
        })
      );

      setCityTimes(updatedCityTimes);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching city times:', err);
      setError('Failed to fetch city times');
      setLoading(false);
    }
  };

  // Update time every second
  useEffect(() => {
    fetchCityTimes();

    const intervalId = setInterval(() => {
      setCityTimes((prevCityTimes) =>
        prevCityTimes.map((cityObj) => {
          if (cityObj.dateTime) {
            return {
              ...cityObj,
              dateTime: cityObj.dateTime + 1000, // Increment time by 1000ms (1 second)
            };
          }
          return cityObj;
        })
      );
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  // Format time into readable string
  const formatTime = (time) => {
    return new Date(time).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true, // Ensures AM/PM format
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div> 
  <div className="grid grid-cols-3 gap-4 mt-8">
    {cityTimes.map((cityTime, index) => (
      <div
        key={index}
        className="flex flex-col justify-center items-center p-2 bg-gray-400 text-black rounded-md hover:bg-gray-600 hover:text-white transition-colors h-32 w-full"
      >
        <strong>{cityTime.city}</strong>
        <div>
          {cityTime.dateTime ? formatTime(cityTime.dateTime) : 'No data available'}
        </div>
      </div>
    ))}
  </div>
</div>
  );
};

export default CitiesWithTime;
