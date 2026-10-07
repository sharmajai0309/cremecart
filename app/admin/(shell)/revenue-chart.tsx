const WIDTH = 600
const HEIGHT = 160
const PADDING = 24

export function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  const max = Math.max(...data.map(d => d.revenue), 1)
  const stepX = (WIDTH - PADDING * 2) / Math.max(data.length - 1, 1)

  const points = data.map((d, i) => {
    const x = PADDING + i * stepX
    const y = HEIGHT - PADDING - (d.revenue / max) * (HEIGHT - PADDING * 2)
    return [x, y]
  })

  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1][0]},${HEIGHT - PADDING} L${points[0][0]},${HEIGHT - PADDING} Z`

  return (
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" preserveAspectRatio="none">
      <path d={areaPath} fill="#6366f1" fillOpacity={0.08} />
      <path d={linePath} fill="none" stroke="#6366f1" strokeWidth={2} />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.5} fill="#6366f1" />
      ))}
    </svg>
  )
}
