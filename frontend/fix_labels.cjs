const fs = require('fs');

const navbar = `import { Activity } from 'lucide-react'
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
}`;

const home = `import { useState } from 'react'
import { analyzeNote } from '../services/api'
import ResultCard from '../components/ResultCard'
import { Loader2, FlaskConical } from 'lucide-react'

export default function Home() {
  const [patientId, setPatientId] = useState('')
  const [visitDate, setVisitDate] = useState('')
  const [clinicalText, setClinicalText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async () => {
    if (!patientId || !visitDate || !clinicalText) { setError('Please fill in all fields'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const res = await analyzeNote({ patient_id: patientId, visit_date: visitDate, clinical_text: clinicalText })
      setResult(res.data.extracted)
    } catch (err) {
      setError('Analysis failed. Please check your backend is running.')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Clinical Note Analyzer</h1>
        <p className="text-gray-500 mt-1">Paste any clinical note or lab report to extract structured indicators</p>
      </div>
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Patient ID</label>
            <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. P001" value={patientId} onChange={e => setPatientId(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Visit Date</label>
            <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={visitDate} onChange={e => setVisitDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Clinical Note</label>
          <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={6} placeholder="Paste doctor notes, lab reports, or clinical observations here..." value={clinicalText} onChange={e => setClinicalText(e.target.value)} />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button onClick={handleAnalyze} disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <FlaskConical size={18} />}
          {loading ? 'Analyzing...' : 'Analyze Clinical Note'}
        </button>
      </div>
      <ResultCard data={result} />
    </div>
  )
}`;

fs.writeFileSync('src/components/Navbar.jsx', navbar, 'utf8');
fs.writeFileSync('src/pages/Home.jsx', home, 'utf8');
console.log('Labels updated successfully!');