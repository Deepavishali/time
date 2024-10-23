import { useState, useEffect } from 'react';
// import TimeByLocation from './TimeByLocation';
import Cities from './Cities'
import { Button } from "@material-tailwind/react";
import CitiesWithTime from './CitiesWithTime';
import Navbar from './Navbar';
import { useDispatch, useSelector } from 'react-redux';
import { getLocation, getTime } from './redux/Slice';


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
  const {Time, Location, isLoading} = useSelector((state)=>state.time);
  const [timeData, setTimeData] = useState(new Date());
  const [cityTimes, setCityTimes] = useState([]);
  const [position, setPosition] = useState([])
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    city: '',
    state: '',
    country: '',
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
    }
  }, [dispatch, location.latitude, location.longitude]);



  useEffect(() => {
    const updateTime = async (latitude, longitude) => {
      try {
        const response = await fetch(
          `https://timeapi.io/api/time/current/coordinate?latitude=${latitude}&longitude=${longitude}`
        );
        const data = await response.json();
        const now = formatDate(data); 
        if (!isNaN(now.getTime())) {
          setTimeData(now); 
        }
      } catch (error) {
        console.error('Error fetching time data:', error);
      }
    };

    const fetchCityTimes = async () => {
      const fetchedTimes = await Promise.all(
        cities.map(async (city) => {
          try {
            const timeResponse = await fetch(
              `https://timeapi.io/api/time/current/coordinate?latitude=${city.lat}&longitude=${city.lon}`
            );
            const timeData = await timeResponse.json();
            const cityTime = formatDate(timeData);  // Use formatted date for city times
            return {
              city: city.name,
              time: !isNaN(cityTime.getTime()) ? cityTime : 'Invalid Date',  // Validate date
            };
          } catch (error) {
            return { city: city.name, time: 'Error fetching time', error };
          }
        })
      );
      setCityTimes(fetchedTimes);  
    };

    const syncTimes = () => {
      // Increment both current location and city times every second
      setTimeData((prevTimeData) => new Date(prevTimeData.getTime() + 1000));
      setCityTimes((prevCityTimes) =>
        prevCityTimes.map((cityTime) => {
          if (cityTime.time instanceof Date && !isNaN(cityTime.time.getTime())) {
            const updatedTime = new Date(cityTime.time.getTime() + 1000);  
            return {
              ...cityTime,
              time: updatedTime
            };
          }
          return cityTime;
        })
      );
    };

    const fetchLocation = async (latitude, longitude) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await response.json();
        const { city, state, country } = data.address || {};
        setLocation({
          latitude,
          longitude,
          city: city || '',
          state: state || '',
          country: country || '',
          error: ''
        });
      } catch (error) {
        setLocation(prev => ({
          ...prev,
          error: 'Unable to fetch location information'
        }));
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          updateTime(latitude, longitude);  
          fetchCityTimes();  
          fetchLocation(latitude, longitude);  // Fetch the location info

          const interval = setInterval(syncTimes, 1000);

          return () => clearInterval(interval);  
        },
        (error) => {
          console.error('Error getting geolocation:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by your browser.');
    }
  }, []);

  return (
    <div>
      <Navbar/>
    <div className="grid grid-cols-3 gap-4 p-8 h-screen" style={{ height: '80vh' }}>
      {/* First box */}
      <div className="bg-gray-200 rounded-lg p-6 shadow-md group overflow-hidden hover:overflow-y-scroll h-full">
        <Cities />
      </div>
      {/* Second box */}
      {/* <div className="bg-gray-200 rounded-lg p-6 shadow-md h-full">
        <div className="text-center mt-4">
           
           {location.latitude && location.longitude ? (
            <p className='mt-4'>
            Time in <strong>{location.city} </strong> , {location.state}, {location.country}
            </p>
          ) : (
            <p className='text-red-500'>
              {location.error}
            </p>
          )}
         
          <div className='text-7xl'>
            {isNaN(timeData.getTime()) ? 'Invalid Time' : timeData.toLocaleTimeString()}
          </div>

          
          <div className='mt-4 text-2xl'>
            {isNaN(timeData.getTime())
              ? 'Invalid Date'
              : `${getFormattedDate(timeData)}, week${getWeekNumber(timeData)}`}
          </div>
        </div>
        <div><CitiesWithTime /></div>
      </div> */}

      {/* Third box */}
      {/* <div className="bg-gray-200 rounded-lg shadow-md w-full h-full">
      {location.latitude && location.longitude ? (
      <MapContainer
        center={[location.latitude, location.longitude]}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }} // Ensure the map takes full height and width
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
      <h1>Loading Map...</h1>
    )}
      </div> */}
    </div>

    </div>
  );
};

export default CurrentTime;
