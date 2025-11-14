import { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material'
import {
  Download,
  TrendingUp,
  Star,
  Assessment,
  MonetizationOn,
  CheckCircle,
  Warning,
  Info,
  Error as ErrorIcon,
  AutoAwesome,
} from '@mui/icons-material'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { generatePerformanceReport, getQuickReport } from '../../services/reportAPI'
import { formatNumber } from '../../utils/calculations'

/**
 * 성과 분석 리포트 컴포넌트
 * 키워드 분석 성과를 종합적으로 표시
 */
function PerformanceReport() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [report, setReport] = useState(null)
  const [period, setPeriod] = useState('30') // 7, 30, 90 일
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    loadDefaultReport()
  }, [])

  // 기본 리포트 로드 (최근 30일)
  const loadDefaultReport = async () => {
    setLoading(true)
    setError(null)

    try {
      const endDate = new Date()
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

      const response = await generatePerformanceReport({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        includeRecommendations: true,
      })

      setReport(response.data)
    } catch (err) {
      console.error('Load report error:', err)
      setError(err.message || '리포트 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 기간 변경 핸들러
  const handlePeriodChange = async (event, newPeriod) => {
    if (!newPeriod) return
    setPeriod(newPeriod)

    setLoading(true)
    setError(null)

    try {
      const endDate = new Date()
      const startDate = new Date(Date.now() - parseInt(newPeriod) * 24 * 60 * 60 * 1000)

      const response = await generatePerformanceReport({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        includeRecommendations: true,
      })

      setReport(response.data)
    } catch (err) {
      console.error('Load report error:', err)
      setError(err.message || '리포트 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 커스텀 기간 리포트 생성
  const handleCustomReport = async () => {
    if (!startDate || !endDate) {
      setError('시작일과 종료일을 모두 입력해주세요.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await generatePerformanceReport({
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        includeRecommendations: true,
      })

      setReport(response.data)
    } catch (err) {
      console.error('Load report error:', err)
      setError(err.message || '리포트 생성에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 추천 타입별 아이콘 및 색상
  const getRecommendationStyle = (type) => {
    const styles = {
      critical: { icon: <ErrorIcon />, color: 'error' },
      warning: { icon: <Warning />, color: 'warning' },
      info: { icon: <Info />, color: 'info' },
      success: { icon: <CheckCircle />, color: 'success' },
      opportunity: { icon: <AutoAwesome />, color: 'secondary' },
      action: { icon: <TrendingUp />, color: 'primary' },
    }
    return styles[type] || styles.info
  }

  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          성과 리포트 생성 중...
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
            데이터베이스에 충분한 히스토리 데이터가 없을 수 있습니다.
          </Typography>
        </Alert>
      </Paper>
    )
  }

  if (!report) {
    return null
  }

  // 카테고리별 데이터 준비
  const volumeRangeData = report.categoryPerformance.byVolumeRange.map((item) => ({
    name: item.volume_range,
    count: parseInt(item.count),
    avgKgr: parseFloat(item.avg_kgr),
  }))

  const trendData = report.categoryPerformance.byTrend.map((item) => ({
    name: item.trend || 'Unknown',
    count: parseInt(item.count),
  }))

  const intentData = report.categoryPerformance.byIntent.map((item) => ({
    name: item.intent || 'Unknown',
    count: parseInt(item.count),
  }))

  const COLORS = ['#4caf50', '#2196f3', '#ff9800', '#f44336', '#9c27b0']

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        📊 성과 분석 리포트
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        키워드 분석 성과 및 최적화 추천
      </Typography>

      {/* 기간 선택 */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <ToggleButtonGroup
            value={period}
            exclusive
            onChange={handlePeriodChange}
            size="small"
          >
            <ToggleButton value="7">최근 7일</ToggleButton>
            <ToggleButton value="30">최근 30일</ToggleButton>
            <ToggleButton value="90">최근 90일</ToggleButton>
          </ToggleButtonGroup>

          <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />

          <TextField
            type="date"
            label="시작일"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="종료일"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button variant="outlined" size="small" onClick={handleCustomReport}>
            조회
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary">
          기간: {new Date(report.period.startDate).toLocaleDateString('ko-KR')} ~{' '}
          {new Date(report.period.endDate).toLocaleDateString('ko-KR')} ({report.period.days}일)
        </Typography>
      </Box>

      {/* 전체 통계 카드 */}
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
              <Typography variant="h4">
                {report.overallStats.total_unique_keywords || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                총 {report.overallStats.total_searches || 0}회 검색
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
                {report.goldenKeywordPerformance.golden_keyword_count || 0}
              </Typography>
              <Typography variant="caption" sx={{ color: 'white' }}>
                발견율: {report.goldenKeywordPerformance.discovery_rate}%
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
                {formatNumber(Math.round(report.overallStats.avg_search_volume || 0))}
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
                <MonetizationOn color="primary" sx={{ mr: 1 }} />
                <Typography variant="subtitle2" color="text.secondary">
                  평균 CPC
                </Typography>
              </Box>
              <Typography variant="h4">
                ${parseFloat(report.overallStats.avg_cpc || 0).toFixed(2)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                평균 KGR: {parseFloat(report.overallStats.avg_kgr || 0).toFixed(2)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 추천사항 */}
      {report.recommendations && report.recommendations.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            💡 최적화 추천사항
          </Typography>
          <Grid container spacing={2}>
            {report.recommendations.map((rec, index) => {
              const style = getRecommendationStyle(rec.type)
              return (
                <Grid item xs={12} md={6} key={index}>
                  <Alert
                    severity={style.color}
                    icon={style.icon}
                    sx={{ height: '100%' }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                      {rec.title}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {rec.message}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}
                    >
                      👉 {rec.action}
                    </Typography>
                  </Alert>
                </Grid>
              )
            })}
          </Grid>
        </Box>
      )}

      {/* 카테고리별 성과 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          📈 카테고리별 분석
        </Typography>
        <Grid container spacing={3}>
          {/* 검색량 범위별 */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                검색량 범위별 분포
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={volumeRangeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#2196f3" name="키워드 수" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>

          {/* 트렌드별 */}
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                트렌드별 분포
              </Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={trendData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {trendData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* 상위 성과 키워드 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          🏆 상위 성과 키워드 Top 10
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>순위</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>키워드</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  검색량
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  KGR
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  KEI
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  CPC
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  상태
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {report.topKeywords.map((kw, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {kw.keyword_text}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{formatNumber(kw.search_volume)}</TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        color: kw.kgr < 0.25 ? 'success.main' : 'warning.main',
                        fontWeight: 500,
                      }}
                    >
                      {parseFloat(kw.kgr).toFixed(4)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">{kw.kei}</TableCell>
                  <TableCell align="right">${kw.cpc}</TableCell>
                  <TableCell align="center">
                    {kw.kgr < 0.25 && (
                      <Chip
                        label="황금"
                        size="small"
                        color="success"
                        icon={<Star fontSize="small" />}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* 내보내기 버튼 */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" startIcon={<Download />}>
          PDF 내보내기
        </Button>
        <Button variant="outlined" startIcon={<Download />}>
          Excel 내보내기
        </Button>
      </Box>

      {/* 생성 시간 */}
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        리포트 생성: {new Date(report.generatedAt).toLocaleString('ko-KR')}
      </Typography>
    </Paper>
  )
}

export default PerformanceReport
