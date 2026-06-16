const fs = require('fs');

const api = `import axios from 'axios'
const API = axios.create({ baseURL: 'http://127.0.0.1:8000/api/v1' })
export const analyzeNote = (data) => API.post('/analyze-sync', data)
export const getPatientHistory = (patientId) => API.get('/patient/' + patientId + '/history')
export const getRiskTrend = (patientId) => API.get('/patient/' + patientId + '/risk-trend')
export const assessDischargeRisk = (data) => API.post('/discharge-risk', data)`;

const resultCard = `export default function ResultCard({ data }) {
  if (!data) return null
  const getRiskColor = (level) => {
    if (level === 'CRITICAL') return 'bg-red-100 text-red-700 border-red-200'
    if (level === 'HIGH') return 'bg-orange-100 text-orange-700 border-orange-200'
    if (level === 'MODERATE') return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-green-100 text-green-700 border-green-200'
  }
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Extracted Clinical Indicators</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs text-blue-500 uppercase tracking-wide mb-1">Primary Diagnosis</p>
          <p className="text-lg font-bold text-blue-800">{data.primary_diagnosis || 'N/A'}</p>
          {data.department && <p className="text-xs text-blue-400 mt-1">{data.department}</p>}
        </div>
        <div className={"rounded-xl p-4 border " + getRiskColor(data.risk_level)}>
          <p className="text-xs uppercase tracking-wide mb-1 opacity-70">Risk Level</p>
          <p className="text-lg font-bold">{data.risk_level || 'N/A'}</p>
          {data.risk_score && <p className="text-xs mt-1 opacity-70">Score: {data.risk_score}/100</p>}
        </div>
      </div>
      <div className="space-y-3">
        {data.vital_signs && Object.keys(data.vital_signs).filter(k => data.vital_signs[k]).length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Vital Signs</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.vital_signs).map(([k, v], i) => v && (
                <span key={i} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">{k}: {v}</span>
              ))}
            </div>
          </div>
        )}
        {data.symptoms?.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Symptoms</p>
            <div className="flex flex-wrap gap-2">
              {data.symptoms.map((s, i) => <span key={i} className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">{s}</span>)}
            </div>
          </div>
        )}
        {data.medications?.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Medications</p>
            <div className="flex flex-wrap gap-2">
              {data.medications.map((m, i) => <span key={i} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">{m}</span>)}
            </div>
          </div>
        )}
        {data.lab_results && Object.keys(data.lab_results).filter(k => data.lab_results[k]).length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Lab Results</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.lab_results).map(([k, v], i) => v && (
                <span key={i} className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full">{k}: {v}</span>
              ))}
            </div>
          </div>
        )}
        {data.comorbidities?.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Comorbidities</p>
            <div className="flex flex-wrap gap-2">
              {data.comorbidities.map((c, i) => <span key={i} className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">{c}</span>)}
            </div>
          </div>
        )}
        {data.risk_flags?.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Risk Flags</p>
            <div className="flex flex-wrap gap-2">
              {data.risk_flags.map((f, i) => <span key={i} className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full">{f}</span>)}
            </div>
          </div>
        )}
        {data.doctor_recommendations?.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Recommendations</p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {data.doctor_recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}`;

const riskChart = `import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
export default function RiskTrendChart({ data }) {
  if (!data || data.length === 0) return null
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Risk Score Trend</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="visit_date" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value, name, props) => [value + '/100 - ' + props.payload.risk_level, 'Risk Score']} contentStyle={{ borderRadius: '8px' }} />
          <ReferenceLine y={25} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Low', fontSize: 11 }} />
          <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Moderate', fontSize: 11 }} />
          <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'High', fontSize: 11 }} />
          <Line type="monotone" dataKey="risk_score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 5, fill: '#3b82f6' }} activeDot={{ r: 7 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>Low</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>Moderate</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>High</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>Critical</span>
      </div>
    </div>
  )
}`;

const patient = `import { useState } from 'react'
import { getPatientHistory, getRiskTrend } from '../services/api'
import RiskTrendChart from '../components/RiskTrendChart'
import { Search, Loader2, Calendar, Pill, AlertTriangle, Building2 } from 'lucide-react'

export default function Patient() {
  const [patientId, setPatientId] = useState('')
  const [history, setHistory] = useState(null)
  const [trend, setTrend] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getRiskBadge = (level) => {
    if (level === 'CRITICAL') return 'bg-red-100 text-red-700'
    if (level === 'HIGH') return 'bg-orange-100 text-orange-700'
    if (level === 'MODERATE') return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  const handleSearch = async () => {
    if (!patientId) return
    setLoading(true); setError('')
    try {
      const [histRes, trendRes] = await Promise.all([getPatientHistory(patientId), getRiskTrend(patientId)])
      setHistory(histRes.data)
      setTrend(trendRes.data.risk_trend)
    } catch (err) {
      setError('Patient not found or backend error.')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Patient Records</h1>
        <p className="text-gray-500 mt-1">Search any patient by ID to view visit history and risk trends</p>
      </div>
      <div className="flex gap-3 mb-6">
        <input className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter Patient ID (e.g. P001)" value={patientId} onChange={e => setPatientId(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <button onClick={handleSearch} disabled={loading} className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-60">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Search
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {history && (
        <>
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Patient {history.patient_id}</h2>
              <span className="text-sm text-gray-500">{history.total_visits} visit{history.total_visits !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <RiskTrendChart data={trend} />
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Visit History</h2>
            {history.visits.map((visit, i) => (
              <div key={visit.visit_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-gray-500 text-sm"><Calendar size={14} />{visit.visit_date}</div>
                    {visit.department && <div className="flex items-center gap-1 text-gray-400 text-xs"><Building2 size={12} />{visit.department}</div>}
                  </div>
                  {visit.risk_level && <span className={"text-xs px-3 py-1 rounded-full font-medium " + getRiskBadge(visit.risk_level)}>{visit.risk_level}</span>}
                </div>
                {visit.primary_diagnosis && (
                  <p className="text-sm font-semibold text-gray-800 mb-3">{visit.primary_diagnosis}</p>
                )}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-500 mb-1">Risk Score</p>
                    <p className="text-lg font-bold text-blue-800">{visit.risk_score ? visit.risk_score + '/100' : 'N/A'}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-500 mb-1">Comorbidities</p>
                    <p className="text-lg font-bold text-purple-800">{visit.comorbidities?.length || 0}</p>
                  </div>
                </div>
                {visit.medications?.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1"><Pill size={12} />Medications</div>
                    <div className="flex flex-wrap gap-1">{visit.medications.map((m, j) => <span key={j} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">{m}</span>)}</div>
                  </div>
                )}
                {visit.risk_flags?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1"><AlertTriangle size={12} />Risk Flags</div>
                    <div className="flex flex-wrap gap-1">{visit.risk_flags.map((f, j) => <span key={j} className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">{f}</span>)}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}`;

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

fs.writeFileSync('src/services/api.js', api, 'utf8');
fs.writeFileSync('src/components/ResultCard.jsx', resultCard, 'utf8');
fs.writeFileSync('src/components/RiskTrendChart.jsx', riskChart, 'utf8');
fs.writeFileSync('src/pages/Patient.jsx', patient, 'utf8');
fs.writeFileSync('src/components/Navbar.jsx', navbar, 'utf8');
console.log('All frontend files written successfully!');const fs = require('fs');

const api = `import axios from 'axios'
const API = axios.create({ baseURL: 'http://127.0.0.1:8000/api/v1' })
export const analyzeNote = (data) => API.post('/analyze-sync', data)
export const getPatientHistory = (patientId) => API.get('/patient/' + patientId + '/history')
export const getRiskTrend = (patientId) => API.get('/patient/' + patientId + '/risk-trend')
export const assessDischargeRisk = (data) => API.post('/discharge-risk', data)`;

const resultCard = `export default function ResultCard({ data }) {
  if (!data) return null
  const getRiskColor = (level) => {
    if (level === 'CRITICAL') return 'bg-red-100 text-red-700 border-red-200'
    if (level === 'HIGH') return 'bg-orange-100 text-orange-700 border-orange-200'
    if (level === 'MODERATE') return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-green-100 text-green-700 border-green-200'
  }
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Extracted Clinical Indicators</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-xs text-blue-500 uppercase tracking-wide mb-1">Primary Diagnosis</p>
          <p className="text-lg font-bold text-blue-800">{data.primary_diagnosis || 'N/A'}</p>
          {data.department && <p className="text-xs text-blue-400 mt-1">{data.department}</p>}
        </div>
        <div className={"rounded-xl p-4 border " + getRiskColor(data.risk_level)}>
          <p className="text-xs uppercase tracking-wide mb-1 opacity-70">Risk Level</p>
          <p className="text-lg font-bold">{data.risk_level || 'N/A'}</p>
          {data.risk_score && <p className="text-xs mt-1 opacity-70">Score: {data.risk_score}/100</p>}
        </div>
      </div>
      <div className="space-y-3">
        {data.vital_signs && Object.keys(data.vital_signs).filter(k => data.vital_signs[k]).length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Vital Signs</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.vital_signs).map(([k, v], i) => v && (
                <span key={i} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">{k}: {v}</span>
              ))}
            </div>
          </div>
        )}
        {data.symptoms?.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Symptoms</p>
            <div className="flex flex-wrap gap-2">
              {data.symptoms.map((s, i) => <span key={i} className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">{s}</span>)}
            </div>
          </div>
        )}
        {data.medications?.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Medications</p>
            <div className="flex flex-wrap gap-2">
              {data.medications.map((m, i) => <span key={i} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">{m}</span>)}
            </div>
          </div>
        )}
        {data.lab_results && Object.keys(data.lab_results).filter(k => data.lab_results[k]).length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Lab Results</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.lab_results).map(([k, v], i) => v && (
                <span key={i} className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full">{k}: {v}</span>
              ))}
            </div>
          </div>
        )}
        {data.comorbidities?.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Comorbidities</p>
            <div className="flex flex-wrap gap-2">
              {data.comorbidities.map((c, i) => <span key={i} className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">{c}</span>)}
            </div>
          </div>
        )}
        {data.risk_flags?.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Risk Flags</p>
            <div className="flex flex-wrap gap-2">
              {data.risk_flags.map((f, i) => <span key={i} className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full">{f}</span>)}
            </div>
          </div>
        )}
        {data.doctor_recommendations?.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Recommendations</p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {data.doctor_recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}`;

const riskChart = `import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
export default function RiskTrendChart({ data }) {
  if (!data || data.length === 0) return null
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Risk Score Trend</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="visit_date" tick={{ fontSize: 12 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value, name, props) => [value + '/100 - ' + props.payload.risk_level, 'Risk Score']} contentStyle={{ borderRadius: '8px' }} />
          <ReferenceLine y={25} stroke="#22c55e" strokeDasharray="4 4" label={{ value: 'Low', fontSize: 11 }} />
          <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Moderate', fontSize: 11 }} />
          <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'High', fontSize: 11 }} />
          <Line type="monotone" dataKey="risk_score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 5, fill: '#3b82f6' }} activeDot={{ r: 7 }} />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>Low</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>Moderate</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>High</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>Critical</span>
      </div>
    </div>
  )
}`;

const patient = `import { useState } from 'react'
import { getPatientHistory, getRiskTrend } from '../services/api'
import RiskTrendChart from '../components/RiskTrendChart'
import { Search, Loader2, Calendar, Pill, AlertTriangle, Building2 } from 'lucide-react'

export default function Patient() {
  const [patientId, setPatientId] = useState('')
  const [history, setHistory] = useState(null)
  const [trend, setTrend] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getRiskBadge = (level) => {
    if (level === 'CRITICAL') return 'bg-red-100 text-red-700'
    if (level === 'HIGH') return 'bg-orange-100 text-orange-700'
    if (level === 'MODERATE') return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  const handleSearch = async () => {
    if (!patientId) return
    setLoading(true); setError('')
    try {
      const [histRes, trendRes] = await Promise.all([getPatientHistory(patientId), getRiskTrend(patientId)])
      setHistory(histRes.data)
      setTrend(trendRes.data.risk_trend)
    } catch (err) {
      setError('Patient not found or backend error.')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Patient Records</h1>
        <p className="text-gray-500 mt-1">Search any patient by ID to view visit history and risk trends</p>
      </div>
      <div className="flex gap-3 mb-6">
        <input className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter Patient ID (e.g. P001)" value={patientId} onChange={e => setPatientId(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSearch()} />
        <button onClick={handleSearch} disabled={loading} className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-60">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Search
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {history && (
        <>
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Patient {history.patient_id}</h2>
              <span className="text-sm text-gray-500">{history.total_visits} visit{history.total_visits !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <RiskTrendChart data={trend} />
          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Visit History</h2>
            {history.visits.map((visit, i) => (
              <div key={visit.visit_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-gray-500 text-sm"><Calendar size={14} />{visit.visit_date}</div>
                    {visit.department && <div className="flex items-center gap-1 text-gray-400 text-xs"><Building2 size={12} />{visit.department}</div>}
                  </div>
                  {visit.risk_level && <span className={"text-xs px-3 py-1 rounded-full font-medium " + getRiskBadge(visit.risk_level)}>{visit.risk_level}</span>}
                </div>
                {visit.primary_diagnosis && (
                  <p className="text-sm font-semibold text-gray-800 mb-3">{visit.primary_diagnosis}</p>
                )}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-500 mb-1">Risk Score</p>
                    <p className="text-lg font-bold text-blue-800">{visit.risk_score ? visit.risk_score + '/100' : 'N/A'}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-500 mb-1">Comorbidities</p>
                    <p className="text-lg font-bold text-purple-800">{visit.comorbidities?.length || 0}</p>
                  </div>
                </div>
                {visit.medications?.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1"><Pill size={12} />Medications</div>
                    <div className="flex flex-wrap gap-1">{visit.medications.map((m, j) => <span key={j} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">{m}</span>)}</div>
                  </div>
                )}
                {visit.risk_flags?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1"><AlertTriangle size={12} />Risk Flags</div>
                    <div className="flex flex-wrap gap-1">{visit.risk_flags.map((f, j) => <span key={j} className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">{f}</span>)}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}`;

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

fs.writeFileSync('src/services/api.js', api, 'utf8');
fs.writeFileSync('src/components/ResultCard.jsx', resultCard, 'utf8');
fs.writeFileSync('src/components/RiskTrendChart.jsx', riskChart, 'utf8');
fs.writeFileSync('src/pages/Patient.jsx', patient, 'utf8');
fs.writeFileSync('src/components/Navbar.jsx', navbar, 'utf8');
console.log('All frontend files written successfully!');
