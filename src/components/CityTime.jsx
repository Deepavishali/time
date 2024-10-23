import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import TimeDifferenceTable from './TimeDifferenceTable';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const getFormattedDate = (date) => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getWeekNumber = (date) => {
  const oneJan = new Date(date.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((date - oneJan) / (24 * 60 * 60 * 1000));
  return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
};

const CityTime = () => {
  const { city } = useParams();
  const [timeData, setTimeData] = useState(null);
  const [error, setError] = useState('');
  const [location, setLocation] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: null, lon: null }); // Track lat/lon

  useEffect(() => {
    const fetchTime = async () => {
      try {
        const geocodeResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${city}&format=json&limit=1`
        );
        const geocodeData = await geocodeResponse.json();

        if (geocodeData.length > 0) {
          const { display_name, lat, lon } = geocodeData[0]; // Extract lat and lon

          const parts = display_name.split(',');
          const cityName = parts[0].trim(); 
          const countryName = parts[parts.length - 1].trim(); 

          // Set location and coordinates
          setLocation(`${cityName}, ${countryName}`);
          setCoordinates({ lat, lon });

          const timeResponse = await fetch(
            `https://timeapi.io/api/Time/current/coordinate?latitude=${lat}&longitude=${lon}`
          );
          const timeData = await timeResponse.json();

          if (timeData && timeData.dateTime) {
            const dateTime = new Date(timeData.dateTime);
            setTimeData(dateTime);
          } else {
            setError('Error fetching time data');
          }
        } else {
          setError('Location not found');
        }
      } catch (error) {
        setError('Error fetching time data');
      }
    };

    fetchTime();
    
    const interval = setInterval(() => {
      if (timeData) {
        setTimeData(prevTime => {
          const updatedTime = new Date(prevTime.getTime() + 1000); 
          return updatedTime;
        });
      }
    }, 1000);

    return () => clearInterval(interval); 
  }, [city, timeData]);

  return (
    <div>
      <Navbar />
      <div className="grid grid-cols-2 gap-8 p-4" style={{ height: '80vh' }}>
        {/* Current Time Display */}
        <div className="bg-gray-200 rounded-lg p-6 shadow-md h-full">
          <div className="text-center mt-8">
            {/* Location Display */}
            {location ? (
              <p className="mt-4">
                Time in <strong>{location}</strong>
              </p>
            ) : (
              <p className="text-red-500">{error}</p>
            )}

            {/* Time Display */}
            <div className="text-7xl">
              {timeData ? timeData.toLocaleTimeString('en-US', { timeZone: timeData.timeZone }) : 'Loading...'}
            </div>

            {/* Full Date Display */}
            <div className="mt-4 text-2xl">
              {timeData
                ? `${getFormattedDate(timeData)}, week ${getWeekNumber(timeData)}`
                : 'Loading date...'}
            </div>
          </div>
          <div className="bg-gray-200 rounded-lg shadow-md mt-8 ml-32" style={{ height: '30vh',width:"60vh" }}>
          {coordinates.lat && coordinates.lon ? (
            <MapContainer
              center={[coordinates.lat, coordinates.lon]}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }} // Ensure the map takes full height and width
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[coordinates.lat, coordinates.lon]}>
                <Popup>
                  {location}
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <h1>Loading Map...</h1>
          )}
        </div>
        </div>

        {/* Time Difference or another box */}
        <div className="bg-gray-200 rounded-lg p-6 shadow-md group overflow-hidden hover:overflow-y-scroll  h-full">
          <h2 className="text-2xl font-bold mb-4">Time Difference</h2>
          <TimeDifferenceTable searchedCity={city} cityTimeData={timeData} />
        </div>
      </div>

      {/* Second row */}
      <div className="flex justify-center items-center p-8">
        
      </div>
    </div>
  );
};

export default CityTime;
