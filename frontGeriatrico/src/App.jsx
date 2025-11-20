import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Pacient from './pages/pacient';
import Habitaciones from './pages/Habitaciones';
import Camas from './pages/Camas';
import Medicaciones from './pages/Medicaciones';
import HistorialMedico from './pages/HistorialMedico';
import Archivos from './pages/Archivos';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Pacient />} />
          <Route path="pacientes" element={<Pacient />} />
          <Route path="habitaciones" element={<Habitaciones />} />
          <Route path="camas" element={<Camas />} />
          <Route path="medicaciones" element={<Medicaciones />} />
          <Route path="historial" element={<HistorialMedico />} />
          <Route path="archivos" element={<Archivos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
