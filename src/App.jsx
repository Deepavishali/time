import { Routes,Route } from 'react-router-dom';
import CurrentTime from './components/CurrentTime.jsx';
import CityTime from './components/CityTime.jsx';
import 'leaflet/dist/leaflet.css';

function App() {
  return(
<>
<Routes>
<Route path="/" element={<CurrentTime/>}/>
<Route path="/:city" element={<CityTime/>}/>
</Routes>
 </>
  )
};

export default App;

