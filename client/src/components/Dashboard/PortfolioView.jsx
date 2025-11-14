import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material'
import {
  Star,
  MonetizationOn,
  TrendingUp,
  Speed,
  EmojiEvents,
} from '@mui/icons-material'
import { formatNumber } from '../../utils/calculations'

/**
 * 키워드 포트폴리오 뷰 컴포넌트
 * Quick Wins, Cash Cows, Long Term 등으로 분류된 키워드 표시
 */
function PortfolioView({ portfolio }) {
  if (!portfolio) {
    return null
  }

  const categories = [
    {
      key: 'quickWins',
      title: '⚡ Quick Wins',
      description: '빠른 성과 (KGR < 0.25, 검색량 100-500)',
      icon: <Speed />,
      color: '#4caf50',
      keywords: portfolio.quickWins || [],
    },
    {
      key: 'cashCows',
      title: '💰 Cash Cows',
      description: '수익 창출 (CPC > $2, KGR < 1.0)',
      icon: <MonetizationOn />,
      color: '#ff9800',
      keywords: portfolio.cashCows || [],
    },
    {
      key: 'longTerm',
      title: '🚀 Long Term',
      description: '장기 투자 (검색량 > 1000, KGR < 1.0)',
      icon: <EmojiEvents />,
      color: '#2196f3',
      keywords: portfolio.longTerm || [],
    },
    {
      key: 'trending',
      title: '📈 Trending',
      description: '떠오르는 키워드 (상승 추세)',
      icon: <TrendingUp />,
      color: '#9c27b0',
      keywords: portfolio.trending || [],
    },
    {
      key: 'lowHanging',
      title: '🍎 Low Hanging Fruits',
      description: '쉬운 타겟 (약한 경쟁사 3+)',
      icon: <Star />,
      color: '#f44336',
      keywords: portfolio.lowHanging || [],
    },
  ]

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        📊 키워드 포트폴리오
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        균형잡힌 키워드 전략을 위한 분류
      </Typography>

      <Grid container spacing={3}>
        {categories.map((category) => (
          <Grid item xs={12} md={6} lg={4} key={category.key}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                borderColor: category.color,
                borderWidth: 2,
                '&:hover': {
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                {/* 헤더 */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Box sx={{ color: category.color, mr: 1 }}>{category.icon}</Box>
                  <Typography variant="h6">{category.title}</Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {category.description}
                </Typography>

                <Divider sx={{ mb: 2 }} />

                {/* 키워드 개수 */}
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={`${category.keywords.length}개 키워드`}
                    size="small"
                    sx={{
                      backgroundColor: category.color,
                      color: 'white',
                    }}
                  />
                </Box>

                {/* 키워드 리스트 */}
                {category.keywords.length > 0 ? (
                  <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {category.keywords.map((kw, index) => (
                      <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemText
                          primary={
                            <Typography variant="body2" noWrap>
                              {kw.keyword || kw}
                            </Typography>
                          }
                          secondary={
                            kw.searchVolume && kw.kgr ? (
                              <Typography variant="caption" color="text.secondary">
                                검색량: {formatNumber(kw.searchVolume)} | KGR: {kw.kgr}
                              </Typography>
                            ) : null
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    해당 카테고리의 키워드가 없습니다.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 전략 제안 */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          💡 추천 전략
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.light', color: 'white' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                1단계: Quick Wins 공략
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                즉시 콘텐츠 제작을 시작하세요. 빠른 트래픽 확보가 가능합니다.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'warning.light', color: 'white' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                2단계: Cash Cows 병행
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                수익화에 집중하세요. 애드센스 및 제휴 마케팅에 최적화된 키워드입니다.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.light', color: 'white' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                3단계: Long Term 투자
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                브랜드 구축을 위해 장기적으로 투자하세요. 높은 검색량의 키워드입니다.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  )
}

export default PortfolioView
