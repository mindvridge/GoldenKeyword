import { Grid, Card, CardContent, Typography, Box } from '@mui/material'
import {
  TrendingUp,
  Star,
  Assessment,
  MonetizationOn,
} from '@mui/icons-material'
import { getKGRRating } from '../../utils/calculations'

/**
 * 통계 카드 컴포넌트
 * 키워드 분석 결과의 주요 통계를 표시합니다.
 */
function StatsCards({ keywords }) {
  // 통계 계산
  const totalKeywords = keywords.length
  const goldenKeywords = keywords.filter((k) => k.kgr < 0.25).length
  const avgSearchVolume =
    keywords.length > 0
      ? Math.round(
          keywords.reduce((sum, k) => sum + k.searchVolume, 0) / keywords.length
        )
      : 0
  const avgCPC =
    keywords.length > 0
      ? (
          keywords.reduce((sum, k) => sum + k.cpc, 0) / keywords.length
        ).toFixed(2)
      : 0

  const stats = [
    {
      title: '총 키워드 수',
      value: totalKeywords,
      icon: <Assessment fontSize="large" />,
      color: '#1976d2',
      unit: '개',
    },
    {
      title: '황금 키워드',
      value: goldenKeywords,
      icon: <Star fontSize="large" />,
      color: '#ff9800',
      unit: '개',
      subtitle: `KGR < 0.25`,
    },
    {
      title: '평균 검색량',
      value: avgSearchVolume.toLocaleString(),
      icon: <TrendingUp fontSize="large" />,
      color: '#4caf50',
      unit: '회/월',
    },
    {
      title: '평균 CPC',
      value: `$${avgCPC}`,
      icon: <MonetizationOn fontSize="large" />,
      color: '#f44336',
      unit: '',
    },
  ]

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            elevation={2}
            sx={{
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
          >
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Typography color="text.secondary" variant="subtitle2">
                  {stat.title}
                </Typography>
                <Box sx={{ color: stat.color }}>{stat.icon}</Box>
              </Box>
              <Typography variant="h4" component="div" sx={{ mb: 0.5 }}>
                {stat.value}
                {stat.unit && (
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 0.5 }}
                  >
                    {stat.unit}
                  </Typography>
                )}
              </Typography>
              {stat.subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {stat.subtitle}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  )
}

export default StatsCards
