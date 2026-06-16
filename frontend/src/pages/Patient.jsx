import { useState } from 'react'
import { getPatientHistory, getHbA1cTrend } from '../services/api'
import HbA1cChart from '../components/HbA1cChart'
import { Search, Loader2, Calendar, Pill, AlertTriangle } from 'lucide-react'

export default function Patient() {
  const [patientId, setPatientId] = useState('')
  const [history, setHistory] = useState(null)
  const [trend, setTrend] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getStatusColor = (hba1c) => {
    if (!hba1c) return 'bg-gray-100 text-gray-600'
    if (hba1c >= 9.0) return 'bg-red-100 text-red-700'
    if (hba1c >= 7.5) return 'bg-yellow-100 text-yellow-700'
    return 'bg-green-100 text-green-700'
  }

  const getStatusLabel = (hba1c) => {
    if (!hba1c) return 'Unknown'
    if (hba1c >= 9.0) return 'Critical'
    if (hba1c >= 7.5) return 'Warning'
    return 'Normal'
  }

  const handleSearch = async () => {
    if (!patientId) return
    setLoading(true)
    setError('')
    try {
      const [histRes, trendRes] = await Promise.all([
        getPatientHistory(patientId),
        getHbA1cTrend(patientId)
      ])
      setHistory(histRes.data)
      setTrend(trendRes.data.hba1c_trend)
    } catch (err) {
      setError('Patient not found or backend error.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Patient Records</h1>
        <p className="text-gray-500 mt-1">Search by patient ID to view visit history and trends</p>
      </div>

      <div className="flex gap-3 mb-6">
        <input
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter Patient ID (e.g. P001)"
          value={patientId}
          onChange={e => setPatientId(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors disabled:opacity-60"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          Search
        </button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {history && (
        <>
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 mb-2">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-gray-800">Patient {history.patient_id}</h2>
              <span className="text-sm text-gray-500">{history.total_visits} visit{history.total_visits !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <HbA1cChart data={trend} />

          <div className="mt-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Visit History</h2>
            {history.visits.map((visit, i) => (
              <div key={visit.visit_id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={15} />
                    <span className="text-sm font-medium">{visit.visit_date}</span>
                    <span className="text-gray-400 text-xs">Visit {i + 1}</span>
                  </div>
                  <span className={"text-xs px-3 py-1 rounded-full font-medium " + getStatusColor(visit.hba1c)}>
                    {getStatusLabel(visit.hba1c)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-500 mb-1">HbA1c</p>
                    <p className="text-lg font-bold text-blue-800">{visit.hba1c ? visit.hba1c + '%' : 'N/A'}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <p className="text-xs text-purple-500 mb-1">Fasting Glucose</p>
                    <p className="text-lg font-bold text-purple-800">{visit.fasting_glucose ? visit.fasting_glucose + ' mg/dL' : 'N/A'}</p>
                  </div>
                </div>

                {visit.medications?.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1"><Pill size={12} /> Medications</div>
                    <div className="flex flex-wrap gap-1">
                      {visit.medications.map((m, j) => (
                        <span key={j} className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">{m}</span>
                      ))}
                    </div>
                  </div>
                )}

                {visit.complications?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mb-1"><AlertTriangle size={12} /> Complications</div>
                    <div className="flex flex-wrap gap-1">
                      {visit.complications.map((c, j) => (
                        <span key={j} className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
