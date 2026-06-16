import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Patient from './pages/Patient'
import DischargeRisk from './pages/DischargeRisk'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/patient" element={<Patient />} />
          <Route path="/discharge" element={<DischargeRisk />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}