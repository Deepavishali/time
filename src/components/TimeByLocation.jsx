// import { useState } from 'react';

// const TimeByLocation = () => {
//   const [location, setLocation] = useState('');
//   const [timeData, setTimeData] = useState(null);
//   const [error, setError] = useState('');

//   // Function to get latitude and longitude using Nominatim Geocoding API
//   const getCoordinates = async (location) => {
//     try {
//       const response = await fetch(
//         `https://nominatim.openstreetmap.org/search?q=${location}&format=json`
//       );
//       const data = await response.json();
      
//       if (data && data.length > 0) {
//         const { lat, lon } = data[0];  // Get the first matching result
//         return { latitude: lat, longitude: lon };
//       } else {
//         throw new Error('Location not found');
//       }
//     } catch (error) {
//       throw new Error('Error fetching coordinates',error);
//     }
//   };

//   // Function to get time by coordinates using TimeAPI
//   const getTimeByCoordinates = async (latitude, longitude) => {
//     try {
//       const response = await fetch(
//         `https://timeapi.io/api/Time/current/coordinate?latitude=${latitude}&longitude=${longitude}`
//       );
//       const data = await response.json();
//       console.log(data);
//       return data;
//     } catch (error) {
//       throw new Error('Error fetching time data',error);
//     }
//   };

//   // Handler for form submission
//   const handleSearch = async (e) => {
//     e.preventDefault();
//     setError('');
//     setTimeData(null);
    
//     try {
//       // Step 1: Get coordinates from location
//       const { latitude, longitude } = await getCoordinates(location);

//       // Step 2: Get time using latitude and longitude
//       const time = await getTimeByCoordinates(latitude, longitude);
//       setTimeData(time);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div style={{ textAlign: 'center', marginTop: '50px' }}>
//       <h1>Search Time by Location</h1>
//       <form onSubmit={handleSearch}>
//         <input 
//           type="text" 
//           value={location} 
//           onChange={(e) => setLocation(e.target.value)} 
//           placeholder="Enter location"
//           required
//         />
//         <button type="submit">Get Time</button>
//       </form>

//       {error && <p style={{ color: 'red' }}>{error}</p>}
//       {timeData && (
//         <div>
//           <p><strong>Date:</strong> {timeData.date}</p>
//           <p><strong>Time:</strong> {timeData.time}</p>
//           <p><strong>Timezone:</strong> {timeData.timeZone}</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TimeByLocation;
