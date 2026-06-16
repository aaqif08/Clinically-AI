import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'

export default function HbA1cChart({ data }) {
  if (!data || data.length === 0) return null

  const getColor = (value) => {
    if (value >= 9.0) return '#ef4444'
    if (value >= 7.5) return '#f59e0b'
    return '#22c55e'
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mt-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">HbA1c Trend</h2>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="visit_date" tick={{ fontSize: 12 }} />
          <YAxis domain={[5, 12]} tick={{ fontSize: 12 }} />
          <Tooltip
            formatter={(value) => [value + '%', 'HbA1c']}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
          />
          <ReferenceLine y={7.5} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Warning', fontSize: 11 }} />
          <ReferenceLine y={9.0} stroke="#ef4444" strokeDasharray="4 4" label={{ value: 'Critical', fontSize: 11 }} />
          <Line
            type="monotone"
            dataKey="hba1c"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 5, fill: '#3b82f6' }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Normal (&lt;7.5%)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span> Warning (7.5-9%)</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Critical (&gt;9%)</span>
      </div>
    </div>
  )
}
