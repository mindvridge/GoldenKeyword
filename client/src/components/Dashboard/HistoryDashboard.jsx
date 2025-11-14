import { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material'
import {
  History,
  TrendingUp,
  TrendingDown,
  Star,
  Timeline,
  Assessment,
} from '@mui/icons-material'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  getKeywordStats,
  getTopPerforming,
  getMostSearched,
  getDailyStats,
  getRecentKeywords,
} from '../../services/historyAPI'
import { formatNumber } from '../../utils/calculations'

/**
 * 히스토리 대시보드 컴포넌트
 * 키워드 분석 히스토리, 통계, 트렌드 표시
 */
function HistoryDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [topPerforming, setTopPerforming] = useState([])
  const [mostSearched, setMostSearched] = useState([])
  const [dailyStats, setDailyStats] = useState([])
  const [recentKeywords, setRecentKeywords] = useState([])
  const [tabValue, setTabValue] = useState(0)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)

    try {
      // 모든 데이터 병렬로 가져오기
      const [statsRes, topRes, searchedRes, dailyRes, recentRes] = await Promise.all([
        getKeywordStats(),
        getTopPerforming(10),
        getMostSearched(10),
        getDailyStats(),
        getRecentKeywords(20),
      ])

      setStats(statsRes.data)
      setTopPerforming(topRes.data)
      setMostSearched(searchedRes.data)
      setDailyStats(dailyRes.data)
      setRecentKeywords(recentRes.data)
    } catch (err) {
      console.error('Load dashboard data error:', err)
      setError(err.message || '대시보드 데이터 로드에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          히스토리 데이터 로딩 중...
        </Typography>
      </Paper>
    )
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Alert severity="error">
          {error}
          <Typography variant="body2" sx={{ mt: 1 }}>
            데이터베이스가 설정되지 않았거나 히스토리 데이터가 없을 수 있습니다.
          </Typography>
        </Alert>
      </Paper>
    )
  }

  // 일별 통계 차트 데이터
  const dailyChartData = dailyStats.map((day) => ({
    date: new Date(day.date).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    }),
    검색수: parseInt(day.total_searches),
    '황금 키워드': parseInt(day.golden_count),
    '평균 KGR': parseFloat(day.avg_kgr) * 10, // 스케일 조정
  }))

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        📊 키워드 분석 히스토리
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        최근 30일간 분석 데이터 및 성과 통계
      </Typography>

      {/* 통계 카드 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Assessment color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  총 분석 키워드
                </Typography>
              </Box>
              <Typography variant="h4">{stats?.total_keywords || 0}</Typography>
              <Typography variant="caption" color="text.secondary">
                총 {stats?.total_searches || 0}회 검색
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined" sx={{ bgcolor: 'success.light' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Star sx={{ color: 'white', mr: 1 }} />
                <Typography variant="subtitle2" sx={{ color: 'white' }}>
                  황금 키워드
                </Typography>
              </Box>
              <Typography variant="h4" sx={{ color: 'white' }}>
                {stats?.golden_keywords || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'white' }}>
                KGR &lt; 0.25
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  평균 검색량
                </Typography>
              </Box>
              <Typography variant="h4">
                {formatNumber(Math.round(stats?.avg_search_volume || 0))}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                회/월
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Timeline color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  평균 KGR
                </Typography>
              </Box>
              <Typography variant="h4">
                {parseFloat(stats?.avg_kgr || 0).toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                낮을수록 좋음
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 탭 메뉴 */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
          <Tab label="일별 통계" />
          <Tab label="상위 성과" />
          <Tab label="검색 빈도" />
          <Tab label="최근 키워드" />
        </Tabs>
      </Box>

      {/* 탭 컨텐츠 */}
      {tabValue === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            일별 검색 통계 (최근 30일)
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="검색수" stroke="#1976d2" strokeWidth={2} />
              <Line type="monotone" dataKey="황금 키워드" stroke="#4caf50" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            상위 성과 키워드 (KGR 낮은 순)
          </Typography>
          <List>
            {topPerforming.map((kw, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {index + 1}. {kw.keyword_text}
                      </Typography>
                      {kw.kgr < 0.25 && (
                        <Chip
                          label="황금"
                          size="small"
                          color="success"
                          sx={{ ml: 1 }}
                          icon={<Star fontSize="small" />}
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      KGR: {parseFloat(kw.kgr).toFixed(4)} | 검색량:{' '}
                      {formatNumber(kw.search_volume)} | KEI: {kw.kei}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            검색 빈도 높은 키워드
          </Typography>
          <List>
            {mostSearched.map((kw, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {index + 1}. {kw.keyword_text}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {kw.search_count}회 검색 | 평균 KGR:{' '}
                      {parseFloat(kw.avg_kgr).toFixed(4)} | 평균 검색량:{' '}
                      {formatNumber(Math.round(kw.avg_search_volume))}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {tabValue === 3 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            최근 분석한 키워드
          </Typography>
          <List>
            {recentKeywords.map((kw, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {kw.keyword_text}
                    </Typography>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      KGR: {parseFloat(kw.kgr).toFixed(4)} | 검색량:{' '}
                      {formatNumber(kw.search_volume)} |{' '}
                      {new Date(kw.created_at).toLocaleString('ko-KR')}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Paper>
  )
}

export default HistoryDashboard
