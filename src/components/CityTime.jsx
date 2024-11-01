import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import TimeDifferenceTable from './TimeDifferenceTable';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { getCoordinates, getTime, getWeather } from './redux/Slice';


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

  const cities = [
    { name: "Tokyo", timeZone: "Asia/Tokyo" },
    { name: "Sydney", timeZone: "Australia/Sydney" },
    { name: "London", timeZone: "Europe/London" },
    { name: "Toronto",timeZone: "America/Toronto"},
    { name: "Lagos", timeZone: "Africa/Lagos" },
    { name: "Singapore", timeZone: "Asia/Singapore" },
    { name: "Mumbai", timeZone: "Asia/Kolkata" },
    { name: "Dubai", timeZone: "Asia/Dubai" },
  ];
  const calculateTimeDifference = (cityTimeZone) => {
    const cityTime = new Date().toLocaleString("en-US", { timeZone: cityTimeZone });
    const cityTimeObj = new Date(cityTime);
    const difference = (cityTimeObj - currentLocalTime) / (1000 * 60 * 60);
    return {
      value: Math.abs(difference.toFixed(1)),
      direction: difference >= 0 ? 'ahead' : 'behind'
    };
  };

  const dispatch = useDispatch();
  const { city } = useParams();
  const [position, setPosition] = useState([]);
  const [currentLocalTime, setCurrentLocalTime] = useState('');
  
  const { Time, Location,Weather, isLoading, error: reduxError } = useSelector((state) => state.time);

  useEffect(() => {
    if (city) {
      // Dispatch the action to fetch coordinates for the city
      dispatch(getCoordinates(city));
    }
  }, [city, dispatch]);

  useEffect(() => {
    if (Location?.data?.length > 0) {
      const coordinates = {
        latitude: Location.data[0].lat,
        longitude: Location.data[0].lon,
      };
      const positionData = [Location.data[0].lat, Location.data[0].lon];
      setPosition(positionData);
      
      // Now dispatch the action to fetch the time based on coordinates
      dispatch(getTime(coordinates));
      dispatch(getWeather(coordinates));
    }
  }, [Location, dispatch]);

  useEffect(() => {
    if (Time?.data?.currentLocalTime) {
      const initialTime = new Date(Time.data.currentLocalTime);
      setCurrentLocalTime(initialTime);

      const intervalId = setInterval(() => {
        setCurrentLocalTime((prevTime) => {
          const updatedTime = new Date(prevTime.getTime() + 1000);
          return updatedTime;
        });
      }, 1000);

      return () => clearInterval(intervalId); // Clean up interval on unmount
    }
  }, [Time]);

const WeatherData = Weather?.data?.current || {};
const {feelslike_c,temp_c} = WeatherData;
console.log(WeatherData);

const weatherCondition = Weather?.data.current.condition || {};
const {text,icon} = weatherCondition;

  return (
    <div>
      <Navbar />
      {isLoading ? (
        <p>Loading...</p>
      ) : reduxError ? (
        <p className="text-red-500">Error: {reduxError}</p>
      ) : (
        
          <div className="grid grid-cols-2 gap-8 p-4" style={{ height: '80vh' }}>
            {/* Current Time Display */}
            <div className="bg-[#ffffff] rounded-lg p-6 shadow-md h-full">
            <div className="text-center mt-8">
  {/* Location Display */}
  <p className="mt-4 text-[#020202]">
    Time in <strong>{city}</strong>
  </p>

  {/* Time Display */}
  <div className="text-7xl text-[#020202]">
    {new Date(currentLocalTime).toLocaleTimeString()}
  </div>

  {/* Full Date Display */}
  <div className="mt-4 text-2xl text-[#020202]">
    {currentLocalTime
      ? `${getFormattedDate(currentLocalTime)}, week ${getWeekNumber(currentLocalTime)}`
      : 'Loading date...'}
  </div>
</div>
{/* weather display */}

<div className="text-center mb-4">
      <h2 className="text-md font-bold text-[#020202]">
        WEATHER in {city}
      </h2>
      <p className="text-md font-semibold text-[#020202] mt-2">
        {temp_c}°C, Feels like {feelslike_c}°C
      </p>
    </div>

    <div className="flex items-center justify-center mb-2">
      <img src={icon} alt="Weather icon" className="w-12 h-12" />
      <span className="text-md font-bold text-[#020202] ml-3">{text}</span>
    </div>

              {/* Map Display */}
              <div className="bg-gray-200 rounded-lg shadow-md mt-8 ml-32" style={{ height: '30vh', width: '60vh' }}>
              {(position && position.length === 2 && position[0] !== null && position[1] !== null) ? (
                <MapContainer
                  center={position}
                  zoom={13}
                  scrollWheelZoom={true}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={position}>
                    <Popup>{city}</Popup>
                  </Marker>
                </MapContainer>
              ) : (
  <div>Loading...</div>
)}
                
              </div>
            </div>

            {/* Time Difference Box */}
            <div className="bg-[#ffffff] rounded-lg p-6 shadow-md group overflow-hidden h-full">
            <h2 className="text-2xl font-bold mb-4" style={{ color: "#020202" }}>
              Time Difference from {city}
            </h2>
            <table className="w-full text-left border-collapse">
              <tbody>
                {cities.map(({ name, timeZone }, index) => {
                  const { value, direction } = calculateTimeDifference(timeZone);
                  return (
                    <tr key={index}>
                      <td className="p-2 font-bold" style={{ color: "#020202" }}>{name}</td>
                      <td className="p-2">
                        <div className="relative w-full h-4 flex justify-center">
                          <div
                            className={`h-full ${direction === 'behind' ? 'mr-auto' : 'ml-auto'}`}
                            style={{
                              width: `calc(100% / 10 * ${value})`,
                              backgroundColor: "#c60024",
                            }}
                          ></div>
                        </div>
                      </td>
                      <td className="p-2 font-bold" style={{ color: "#020202" }}>
                        {direction === 'ahead' ? `+${value} hours` : `-${value} hours`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </div>
        
      )}
    </div>
  );
};

export default CityTime;
