import { Paper, Typography } from '@mui/material'
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from 'recharts'

/**
 * 검색량 vs 난이도 산점도
 * 키워드 기회 시각화
 */
function ScatterChart({ keywords }) {
  if (!keywords || keywords.length === 0) {
    return null
  }

  // 차트 데이터 준비
  const chartData = keywords.map((k) => ({
    x: k.searchVolume,
    y: k.difficulty,
    z: k.kgr * 1000, // 크기 조정
    name: k.keyword,
  }))

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {data.name}
          </Typography>
          <Typography variant="body2">
            검색량: {data.x.toLocaleString()}
          </Typography>
          <Typography variant="body2">난이도: {data.y}</Typography>
          <Typography variant="body2">
            KGR: {(data.z / 1000).toFixed(4)}
          </Typography>
        </Paper>
      )
    }
    return null
  }

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        키워드 기회 맵 (검색량 vs 난이도)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        왼쪽 위 영역이 가장 좋은 기회 (높은 검색량 + 낮은 난이도)
      </Typography>

      <ResponsiveContainer width="100%" height={400}>
        <RechartsScatterChart
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <CartesianGrid />
          <XAxis
            type="number"
            dataKey="x"
            name="검색량"
            label={{ value: '검색량', position: 'insideBottom', offset: -10 }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="난이도"
            label={{ value: '난이도', angle: -90, position: 'insideLeft' }}
          />
          <ZAxis type="number" dataKey="z" range={[50, 400]} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Scatter
            name="키워드"
            data={chartData}
            fill="#1976d2"
            fillOpacity={0.6}
          />
        </RechartsScatterChart>
      </ResponsiveContainer>
    </Paper>
  )
}

export default ScatterChart
