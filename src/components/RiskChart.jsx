import { AreaChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import './RiskChart.css'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="risk-tooltip">
      <div className="risk-tooltip__time">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="risk-tooltip__row">
          <span style={{ background: p.color }} className="risk-tooltip__swatch" />
          <span>{p.name}</span>
          <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  )
}

export default function RiskChart({ data, color, showBaseline }) {
  return (
    <div className="risk-chart">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.28} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
            interval={7}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11, fill: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
            axisLine={false}
            tickLine={false}
            width={34}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="risk"
            name="Risk score"
            stroke={color}
            strokeWidth={2.5}
            fill="url(#riskFill)"
            dot={false}
            isAnimationActive={false}
          />
          {showBaseline && (
            <Line
              type="monotone"
              dataKey="news2"
              name="NEWS2 baseline"
              stroke="var(--text-muted)"
              strokeWidth={1.5}
              strokeDasharray="3 4"
              dot={false}
              isAnimationActive={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
