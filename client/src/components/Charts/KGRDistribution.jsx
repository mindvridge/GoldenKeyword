import { Paper, Typography, Box } from '@mui/material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'

/**
 * KGR 분포도 컴포넌트
 * KGR 등급별 키워드 분포 시각화
 */
function KGRDistribution({ keywords }) {
  if (!keywords || keywords.length === 0) {
    return null
  }

  // KGR 등급별 분류
  const excellent = keywords.filter((k) => k.kgr < 0.25).length
  const good = keywords.filter((k) => k.kgr >= 0.25 && k.kgr < 1.0).length
  const difficult = keywords.filter((k) => k.kgr >= 1.0).length

  const chartData = [
    {
      name: '황금 키워드\n(KGR < 0.25)',
      count: excellent,
      color: '#4caf50',
    },
    {
      name: '양호\n(KGR 0.25-1.0)',
      count: good,
      color: '#ff9800',
    },
    {
      name: '경쟁 높음\n(KGR > 1.0)',
      count: difficult,
      color: '#f44336',
    },
  ]

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        KGR 분포도
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        키워드 난이도 등급별 분포 (황금 키워드: KGR {'<'} 0.25)
      </Typography>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" style={{ fontSize: '12px' }} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" name="키워드 수">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* 통계 요약 */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-around' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
            {excellent}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            황금 키워드
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: '#ff9800', fontWeight: 'bold' }}>
            {good}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            양호
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h4" sx={{ color: '#f44336', fontWeight: 'bold' }}>
            {difficult}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            경쟁 높음
          </Typography>
        </Box>
      </Box>
    </Paper>
  )
}

export default KGRDistribution
