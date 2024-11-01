import { useState, useEffect } from 'react';
// import TimeByLocation from './TimeByLocation';
import Cities from './Cities'
import { Button } from "@material-tailwind/react";
import CitiesWithTime from './CitiesWithTime';
import Navbar from './Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { getLocation, getTime, getWeather } from './redux/Slice';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';


const cities = [
  { name: "Madurai", lat: 9.9252, lon: 78.1198 },
  { name: "Los Angeles", lat: 34.0522, lon: -118.2437 },
  { name: "New York", lat: 40.7128, lon: -74.0060 },
  { name: "London", lat: 51.5074, lon: -0.1278 },
  { name: "Paris", lat: 48.8566, lon: 2.3522 },
  { name: "Beijing", lat: 39.9042, lon: 116.4074 },
  { name: "Tokyo", lat: 35.6762, lon: 139.6503 }
];

const CurrentTime = () => {
  const dispatch = useDispatch();
  const {Time, Location,Weather, isLoading} = useSelector((state)=>state.time);
  const [timeData, setTimeData] = useState(new Date());
  const [cityTimes, setCityTimes] = useState([]);
  const [position, setPosition] = useState([])
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    error: ''
  });

  const getMonthName = (monthNumber) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNumber - 1];
  };

  function getFormattedDate(date) {
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dayOfMonth = date.getDate();
    const suffix = getDaySuffix(dayOfMonth);
    const month = date.toLocaleDateString('en-US', { month: 'long' });
    const year = date.getFullYear();
  
    return `${day}, ${dayOfMonth}${suffix} ${month}, ${year}`;
  }
  
  function getDaySuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  }

  function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
  

  const formatDate = (data) => {
    const { year, month, day, hour, minute, seconds } = data;
    // Ensure month and day are two digits
    const formattedMonth = String(month).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const formattedHour = String(hour).padStart(2, '0');
    const formattedMinute = String(minute).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return new Date(`${year}-${formattedMonth}-${formattedDay}T${formattedHour}:${formattedMinute}:${formattedSeconds}`);
  };


  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude, error: '' });
        },
        (error) => {
          setLocation((prevState) => ({
            ...prevState,
            error: 'Unable to retrieve your location'
          }));
        }
      );
    } else {
      setLocation((prevState) => ({
        ...prevState,
        error: 'Geolocation is not supported by your browser'
      }));
    }
  }, []);

  useEffect(() => {
    if (location.latitude && location.longitude) {
      const data = {
        latitude: location.latitude,
        longitude: location.longitude
      };
      const positionData =[location.latitude, location.longitude]
      setPosition(positionData)
      dispatch(getLocation(data));
      dispatch(getTime(data));
      dispatch(getWeather(data));
    }
  }, [dispatch, location.latitude, location.longitude]);

  useEffect(() => {
    // Check if Time data is valid
    if (Time?.statusCode === 200 && Time?.data?.currentLocalTime) {
      const initialLocalTime = new Date(Time.data.currentLocalTime);
      setTimeData(initialLocalTime);

      // Start ticking the local time by 1 second every second
      const intervalId = setInterval(() => {
        setTimeData((prevTime) => new Date(prevTime.getTime() + 1000));
      }, 1000); // Runs every second

      return () => clearInterval(intervalId); // Cleanup on unmount
    } else {
      console.error('Invalid Time data:', Time);
    }
  }, [Time?.statusCode, Time?.data?.currentLocalTime]);
  
   
    const locationData = Location?.data?.address || {};
    const { town, state_district, state,country } = locationData;
console.log(locationData)

const WeatherData = Weather?.data?.current || {};
const {dewpoint_c,feelslike_c,heatindex_c,humidity,pressure_mb,temp_c,uv,vis_km,wind_degree,wind_dir,wind_kph} = WeatherData
console.log(WeatherData)

const weatherCondition = Weather?.data?.current.condition || {};
const {text,icon} = weatherCondition
const windDirectionsToDegrees ={
  N: 0,
  NNE: 22.5,
  NE: 45,
  ENE: 67.5,
  E: 90,
  ESE: 112.5,
  SE: 135,
  SSE: 157.5,
  S: 180,
  SSW: 202.5,
  SW: 225,
  WSW: 247.5,
  W: 270,
  WNW: 292.5,
  NW: 315,
  NNW: 337.5 
}

const windRotationAngle = windDirectionsToDegrees[wind_dir] || 0;

  return (
    <div>
      <Navbar/>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
    <div className="grid grid-cols-3 gap-4 p-8 h-screen bg-[#464a49]" style={{ height: '80vh' }}>
      {/* First box */}
      <div className="bg-[#ffffff] rounded-lg p-6 shadow-md group overflow-hidden hover:overflow-y-scroll h-full">
        <Cities />
      </div>
      {/* Second box */}
      <div className="bg-[#ffffff] rounded-lg p-6 shadow-md h-full">
  <div className="text-center mt-4">
     
     {location.latitude && location.longitude ? (
      <p className="mt-4 text-[#020202]">
        Time in <strong>{town}</strong>, <strong>{state_district}</strong>, <strong>{state}</strong>, <strong>{country}</strong>
      </p>
    ) : (
      <p className="text-red-500">
        {location.error}
      </p>
    )}
   
    <div className="text-7xl text-[#020202]">
      {isNaN(timeData.getTime()) ? 'Invalid Time' : timeData.toLocaleTimeString()}
    </div>

    
    <div className="mt-4 text-2xl text-[#020202]">
      {isNaN(timeData.getTime())
        ? 'Invalid Date'
        : `${getFormattedDate(timeData)}, week${getWeekNumber(timeData)}`}
    </div>
  </div>
  <div><CitiesWithTime /></div>
</div>


      {/* Third box */}
      <div className="bg-[#464a49] rounded-lg h-full flex flex-col gap-4">
  {/* Weather Condition Box */}
  <div className="bg-[#ffffff] rounded-lg p-6 shadow-md flex-1">
    <div className="text-center mb-4">
      <h2 className="text-md font-bold text-[#020202]">
        WEATHER in {town || ''} {state_district || 'N/A'}, {state || 'N/A'}, {country || 'N/A'}
      </h2>
      <p className="text-md font-semibold text-[#020202] mt-2">
        {temp_c}°C, Feels like {feelslike_c}°C
      </p>
    </div>

    <div className="flex items-center justify-center mb-2">
      <img src={icon} alt="Weather icon" className="w-12 h-12" />
      <span className="text-md font-bold text-[#020202] ml-3">{text}</span>
    </div>

    <div className="grid grid-cols-3 gap-4 text-center">
      <div className="bg-[#c60024] rounded-lg p-2">
        <span className="text-sm font-bold text-[#ffffff]">Humidity: {humidity}%</span>
      </div>
      <div className="bg-[#c60024] rounded-lg p-2">
        <span className="text-sm font-bold text-[#ffffff]">Pressure: {pressure_mb} mb</span>
      </div>
      <div className="bg-[#c60024] rounded-lg p-2">
        <span className="text-sm font-bold text-[#ffffff]">Visibility: {vis_km} km</span>
      </div>
      <div className="bg-[#c60024] rounded-lg p-2">
        <span className="text-sm font-bold text-[#ffffff]">Dewpoint: {dewpoint_c}°C</span>
      </div>
      <div className="bg-[#c60024] rounded-lg p-2">
        <span className="text-sm font-bold text-[#ffffff]">
          Wind: {wind_kph} km/h {wind_dir}
          <span className="ml-2 text-2xl font-bold" style={{ display: "inline-block", transform: `rotate(${windRotationAngle}deg)` }}>
            ↑
          </span>
        </span>
      </div>
      <div className="bg-[#c60024] rounded-lg p-2">
        <span className="text-sm font-bold text-[#ffffff]">UV Index: {uv}</span>
      </div>
    </div>
  </div>

  {/* Map Box */}
  <div className="bg-[#0FFCBE] rounded-lg shadow-md flex-1">
    {location.latitude && location.longitude ? (
      <MapContainer
        center={[location.latitude, location.longitude]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[location.latitude, location.longitude]}>
          <Popup>
            {location.city}, {location.state}
          </Popup>
        </Marker>
      </MapContainer>
    ) : (
      <p className="text-center text-[#106EBE]">Loading Map...</p>
    )}
  </div>
</div>

    </div>
      )}
    </div>
  );
};

export default CurrentTime;
