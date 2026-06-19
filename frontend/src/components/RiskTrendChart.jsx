import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'

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
}