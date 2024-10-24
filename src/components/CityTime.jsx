import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';
import TimeDifferenceTable from './TimeDifferenceTable';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { getCoordinates, getTime } from './redux/Slice';

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
  const dispatch = useDispatch();
  const { city } = useParams();
  const [position, setPosition] = useState([]);
  const [currentLocalTime, setCurrentLocalTime] = useState('');
  
  const { Time, Location, isLoading, error: reduxError } = useSelector((state) => state.time);

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
            <div className="bg-gray-200 rounded-lg p-6 shadow-md h-full">
              <div className="text-center mt-8">
                {/* Location Display */}
                <p className="mt-4">
                  Time in <strong>{city}</strong>
                </p>

                {/* Time Display */}
                <div className="text-7xl">
                  {new Date(currentLocalTime).toLocaleTimeString()}
                </div>

                {/* Full Date Display */}
                <div className="mt-4 text-2xl">
                  {currentLocalTime
                    ? `${getFormattedDate(currentLocalTime)}, week ${getWeekNumber(currentLocalTime)}`
                    : 'Loading date...'}
                </div>
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
            <div className="bg-gray-200 rounded-lg p-6 shadow-md group overflow-hidden hover:overflow-y-scroll h-full">
              <h2 className="text-2xl font-bold mb-4">Time Difference</h2>
              <TimeDifferenceTable searchedCity={city} cityTimeData={currentLocalTime} />
            </div>
          </div>
        
      )}
    </div>
  );
};

export default CityTime;
