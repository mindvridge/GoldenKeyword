import { useState } from 'react'
import {
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Collapse,
  IconButton,
} from '@mui/material'
import { Search, ExpandMore, ExpandLess } from '@mui/icons-material'
import { searchKeywords, searchNaverKeywords } from '../../services/keywordAPI'
import { calculateKGR, calculateKEI, calculateKeywordScore } from '../../utils/calculations'

/**
 * 키워드 검색 폼 컴포넌트
 * 시드 키워드를 입력받아 연관 키워드를 분석합니다.
 */
function SearchForm({ onSearch, onLoadingChange }) {
  const [keyword, setKeyword] = useState('')
  const [minVolume, setMinVolume] = useState(100)
  const [maxDifficulty, setMaxDifficulty] = useState(50)
  const [location, setLocation] = useState('KR')
  const [language, setLanguage] = useState('ko')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [error, setError] = useState('')

  // 검색 핸들러
  const handleSearch = async (e) => {
    e.preventDefault()
    setError('')

    if (!keyword.trim()) {
      setError('키워드를 입력해주세요.')
      return
    }

    onLoadingChange(true)

    try {
      // 실제 환경에서는 백엔드 API를 호출
      // 개발 환경에서는 더미 데이터 생성
      const dummyKeywords = generateDummyKeywords(keyword, 20)
      onSearch(dummyKeywords)
    } catch (err) {
      setError(err.message || '검색 중 오류가 발생했습니다.')
      console.error('Search error:', err)
    } finally {
      onLoadingChange(false)
    }
  }

  // 더미 데이터 생성 (개발용)
  const generateDummyKeywords = (seedKeyword, count) => {
    const keywords = []
    const relatedTerms = ['추천', '가격', '비교', '후기', '사용법', '팁', '방법', '종류', '순위', '인기']

    for (let i = 0; i < count; i++) {
      const term = relatedTerms[i % relatedTerms.length]
      const searchVolume = Math.floor(Math.random() * 5000) + 100
      const allintitle = Math.floor(Math.random() * 500) + 10
      const competition = Math.random()
      const cpc = Math.random() * 10

      const kgr = calculateKGR(allintitle, searchVolume)
      const kei = calculateKEI(searchVolume, competition)

      const keywordData = {
        id: i + 1,
        keyword: `${seedKeyword} ${term}`,
        searchVolume,
        allintitle,
        competition: parseFloat((competition * 100).toFixed(2)),
        cpc: parseFloat(cpc.toFixed(2)),
        kgr: parseFloat(kgr),
        kei,
        difficulty: Math.floor(Math.random() * 100),
      }

      keywordData.score = calculateKeywordScore(keywordData)
      keywords.push(keywordData)
    }

    // KGR 기준으로 정렬 (낮을수록 좋음)
    return keywords.sort((a, b) => a.kgr - b.kgr)
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        키워드 검색
      </Typography>

      <form onSubmit={handleSearch}>
        <Grid container spacing={2}>
          {/* 시드 키워드 입력 */}
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="시드 키워드"
              placeholder="예: 다이어트, 블로그 수익화, 스마트폰"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              error={!!error}
              helperText={error || '분석하고 싶은 주제나 키워드를 입력하세요'}
              variant="outlined"
            />
          </Grid>

          {/* 검색 버튼 */}
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              startIcon={<Search />}
              sx={{ height: '56px' }}
            >
              황금 키워드 찾기
            </Button>
          </Grid>

          {/* 고급 필터 토글 */}
          <Grid item xs={12}>
            <Button
              onClick={() => setShowAdvanced(!showAdvanced)}
              endIcon={showAdvanced ? <ExpandLess /> : <ExpandMore />}
              sx={{ textTransform: 'none' }}
            >
              고급 필터 {showAdvanced ? '접기' : '펼치기'}
            </Button>
          </Grid>

          {/* 고급 필터 옵션 */}
          <Grid item xs={12}>
            <Collapse in={showAdvanced}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="최소 검색량"
                    value={minVolume}
                    onChange={(e) => setMinVolume(parseInt(e.target.value))}
                    helperText="월간 최소 검색량"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    type="number"
                    label="최대 난이도"
                    value={maxDifficulty}
                    onChange={(e) => setMaxDifficulty(parseInt(e.target.value))}
                    helperText="0-100 (낮을수록 쉬움)"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>국가</InputLabel>
                    <Select
                      value={location}
                      label="국가"
                      onChange={(e) => setLocation(e.target.value)}
                    >
                      <MenuItem value="KR">한국</MenuItem>
                      <MenuItem value="US">미국</MenuItem>
                      <MenuItem value="JP">일본</MenuItem>
                      <MenuItem value="CN">중국</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>언어</InputLabel>
                    <Select
                      value={language}
                      label="언어"
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      <MenuItem value="ko">한국어</MenuItem>
                      <MenuItem value="en">영어</MenuItem>
                      <MenuItem value="ja">일본어</MenuItem>
                      <MenuItem value="zh">중국어</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Collapse>
          </Grid>
        </Grid>
      </form>
    </Paper>
  )
}

export default SearchForm
