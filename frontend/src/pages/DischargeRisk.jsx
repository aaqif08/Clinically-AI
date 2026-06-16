import { useState } from 'react'
import axios from 'axios'
import { Loader2, ShieldAlert, AlertCircle, CheckCircle2 } from 'lucide-react'

const API = axios.create({ baseURL: 'http://127.0.0.1:8000/api/v1' })

export default function DischargeRisk() {
  const [patientId, setPatientId] = useState('')
  const [dischargeNote, setDischargeNote] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getRiskColor = (level) => {
    if (level === 'CRITICAL') return 'bg-red-600'
    if (level === 'HIGH') return 'bg-orange-500'
    if (level === 'MODERATE') return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const handleAssess = async () => {
    if (!patientId || !dischargeNote) { setError('Please fill in all fields'); return }
    setError(''); setLoading(true); setResult(null)
    try {
      const res = await API.post('/discharge-risk', { patient_id: patientId, discharge_note: dischargeNote })
      setResult(res.data.discharge_risk)
    } catch (err) {
      setError('Assessment failed. Make sure the patient has visit history.')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Discharge Risk Scorer</h1>
        <p className="text-gray-500 mt-1">Assess readmission risk before discharging a diabetic patient</p>
      </div>
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 space-y-4">
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Patient ID</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. P001" value={patientId} onChange={e => setPatientId(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Discharge Note</label>
          <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows={6} placeholder="Paste the patient discharge summary here..." value={dischargeNote} onChange={e => setDischargeNote(e.target.value)} />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button onClick={handleAssess} disabled={loading} className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldAlert size={18} />}
          {loading ? 'Assessing Risk...' : 'Assess Discharge Risk'}
        </button>
      </div>
      {result && (
        <div className="mt-6 space-y-4">
          <div className={"rounded-2xl p-6 text-white " + getRiskColor(result.risk_level)}>
            <p className="text-sm opacity-80 uppercase tracking-wide mb-1">Readmission Risk Score</p>
            <p className="text-5xl font-bold">{result.risk_score}<span className="text-2xl">/100</span></p>
            <p className="text-lg font-semibold mt-1">{result.risk_level} RISK</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Risk Breakdown</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div><span className="text-blue-500 font-medium">Glycemic: </span>{result.glycemic_risk}</div>
              <div><span className="text-purple-500 font-medium">Medication: </span>{result.medication_risk}</div>
              <div><span className="text-orange-500 font-medium">Compliance: </span>{result.compliance_risk}</div>
            </div>
          </div>
          {result.documentation_gaps?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Documentation Gaps</h3>
              <ul className="space-y-1">{result.documentation_gaps.map((gap, i) => (<li key={i} className="text-sm text-red-700">- {gap}</li>))}</ul>
            </div>
          )}
          {result.recommended_actions?.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-green-100 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Recommended Actions</h3>
              <ul className="space-y-1">{result.recommended_actions.map((action, i) => (<li key={i} className="text-sm text-green-700">+ {action}</li>))}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}