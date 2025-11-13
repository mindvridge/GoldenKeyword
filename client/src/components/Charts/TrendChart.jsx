import { Paper, Typography, Box } from '@mui/material'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

/**
 * 트렌드 차트 컴포넌트
 * 검색량 vs 난이도 트렌드 시각화
 */
function TrendChart({ keywords }) {
  if (!keywords || keywords.length === 0) {
    return null
  }

  // 상위 10개 키워드만 표시
  const topKeywords = keywords.slice(0, 10)

  // 차트 데이터 준비
  const chartData = topKeywords.map((k, index) => ({
    name: k.keyword.length > 15 ? k.keyword.substring(0, 15) + '...' : k.keyword,
    검색량: k.searchVolume,
    난이도: k.difficulty,
    KGR: parseFloat((k.kgr * 100).toFixed(2)), // 백분율로 표시
  }))

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        상위 키워드 트렌드 (검색량 vs 난이도)
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        KGR 기준 상위 10개 키워드의 검색량과 난이도 비교
      </Typography>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            style={{ fontSize: '12px' }}
          />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="검색량"
            stroke="#1976d2"
            strokeWidth={2}
            activeDot={{ r: 8 }}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="난이도"
            stroke="#f44336"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </Paper>
  )
}

export default TrendChart
