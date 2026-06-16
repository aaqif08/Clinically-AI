import { Activity } from 'lucide-react'
import { Link } from 'react-router-dom'
export default function Navbar() {
  return (
    <nav className="bg-blue-900 text-white px-6 py-4 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <Activity className="text-blue-300" size={24} />
        <span className="text-xl font-bold tracking-tight">ClinicallyAI</span>
        <span className="text-blue-400 text-sm ml-1">Clinical Intelligence</span>
      </div>
      <div className="flex gap-6 text-sm">
        <Link to="/" className="hover:text-blue-300 transition-colors">Analyze</Link>
        <Link to="/patient" className="hover:text-blue-300 transition-colors">Patient Records</Link>
        <Link to="/discharge" className="hover:text-blue-300 transition-colors">Discharge Risk</Link>
      </div>
    </nav>
  )
}