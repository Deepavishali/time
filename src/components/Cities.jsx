
import { useNavigate } from 'react-router-dom';

const cities = [
  "Abu Dhabi", "Addis Ababa", "Amman", "Amsterdam", "Antananarivo", 
  "Athens", "Auckland", "Baghdad", "Bangkok", "Barcelona", 
  "Beijing", "Beirut", "Berlin", "Bogotá", "Boston", 
  "Brussels", "Buenos Aires", "Cairo", "Cape Town", "Caracas", 
  "Chicago", "Damascus", "Delhi", "Dhaka", "Dubai", 
  "Dublin", "Frankfurt", "Guangzhou", "Hanoi", "Havana", 
  "Helsinki", "Hong Kong", "Honolulu", "Istanbul", "Jakarta", 
  "Karachi", "Kathmandu", "Kinshasa", "Kuala Lumpur", "Kyiv", 
  "Lagos", "Las Vegas", "Lima", "London", "Los Angeles", 
  "Luanda", "Madrid", "Manila", "Mecca", "Mexico City", 
  "Miami", "Milan", "Moscow", "Mumbai", "New Delhi", 
  "New York", "Nuuk", "Osaka", "Oslo", "Paris", 
  "Prague", "Reykjavik", "Rio de Janeiro", "Riyadh", "Rome", 
  "Saint Petersburg", "San Francisco", "Santiago", "Seoul", "Shanghai", 
  "Shenzhen", "Singapore", "Stockholm", "Sydney", "São Paulo", 
  "Taipei", "Tehran", "Tel Aviv", "Tokyo", "Toronto", 
  "Vancouver", "Vienna", "Warsaw", "Washington, D.C.", "Yangon"
];

const Cities = () => {
  const navigate = useNavigate()
  
  const handleCityClick = (city) => {
    const cityRoute = city.toLowerCase().replace(/\s+/g, '-');
    navigate(`/${cityRoute}`);
  };

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
      {cities.map((city, index) => (
        <div
          key={index}
          onClick={() => handleCityClick(city)}
          className="p-4 cursor-pointer font-serif text-xl text-[#020202] hover:font-bold hover:text-2xl transition-colors"
        >
          {city}
        </div>
      ))}
    </div>
  );
};

export default Cities;


