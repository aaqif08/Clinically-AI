const fs = require('fs');

const resultCard = `export default function ResultCard({ data }) {
  if (!data) return null

  const getRiskColor = (level) => {
    if (level === 'CRITICAL') return 'bg-red-100 text-red-700 border-red-200'
    if (level === 'HIGH') return 'bg-orange-100 text-orange-700 border-orange-200'
    if (level === 'MODERATE') return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    return 'bg-green-100 text-green-700 border-green-200'
  }

  const formatValue = (val) => {
    if (val === null || val === undefined) return ''
    if (typeof val === 'string') return val
    if (typeof val === 'number') return String(val)
    if (typeof val === 'object') return Object.values(val).filter(Boolean).join(' ')
    return String(val)
  }

  const formatList = (arr) => {
    if (!arr || !Array.isArray(arr)) return []
    return arr.map(item => formatValue(item)).filter(Boolean)
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
                <span key={i} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">{k}: {formatValue(v)}</span>
              ))}
            </div>
          </div>
        )}
        {data.symptoms?.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Symptoms</p>
            <div className="flex flex-wrap gap-2">
              {formatList(data.symptoms).map((s, i) => <span key={i} className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">{s}</span>)}
            </div>
          </div>
        )}
        {data.medications?.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Medications</p>
            <div className="flex flex-wrap gap-2">
              {formatList(data.medications).map((m, i) => <span key={i} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">{m}</span>)}
            </div>
          </div>
        )}
        {data.lab_results && typeof data.lab_results === 'object' && Object.keys(data.lab_results).length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Lab Results</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(data.lab_results).map(([k, v], i) => v && (
                <span key={i} className="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full">{k}: {formatValue(v)}</span>
              ))}
            </div>
          </div>
        )}
        {data.comorbidities?.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Comorbidities</p>
            <div className="flex flex-wrap gap-2">
              {formatList(data.comorbidities).map((c, i) => <span key={i} className="bg-yellow-100 text-yellow-800 text-xs px-3 py-1 rounded-full">{c}</span>)}
            </div>
          </div>
        )}
        {data.risk_flags?.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Risk Flags</p>
            <div className="flex flex-wrap gap-2">
              {formatList(data.risk_flags).map((f, i) => <span key={i} className="bg-red-100 text-red-800 text-xs px-3 py-1 rounded-full">{f}</span>)}
            </div>
          </div>
        )}
        {data.doctor_recommendations?.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Recommendations</p>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
              {formatList(data.doctor_recommendations).map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}`;

fs.writeFileSync('src/components/ResultCard.jsx', resultCard, 'utf8');
console.log('ResultCard.jsx fixed successfully!');