import { useState, useMemo } from 'react'
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Switch,
  FormControlLabel
} from '@mui/material'
import { Brightness4, Brightness7, Search as SearchIcon } from '@mui/icons-material'
import SearchForm from './components/KeywordSearch/SearchForm'
import KeywordTable from './components/DataTable/KeywordTable'
import StatsCards from './components/Dashboard/StatsCards'
import TrendChart from './components/Charts/TrendChart'
import KGRDistribution from './components/Charts/KGRDistribution'
import ScatterChart from './components/Charts/ScatterChart'

function App() {
  const [darkMode, setDarkMode] = useState(false)
  const [keywords, setKeywords] = useState([])
  const [loading, setLoading] = useState(false)

  // Material-UI 테마 설정 (다크 모드 지원)
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          primary: {
            main: '#1976d2',
          },
          secondary: {
            main: '#dc004e',
          },
        },
        typography: {
          fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
          ].join(','),
        },
      }),
    [darkMode]
  )

  // 다크 모드 토글
  const handleThemeChange = () => {
    setDarkMode(!darkMode)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        {/* 상단 앱바 */}
        <AppBar position="static" elevation={2}>
          <Toolbar>
            <SearchIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              황금 키워드 찾기 - Golden Keyword Finder
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={darkMode}
                  onChange={handleThemeChange}
                  icon={<Brightness7 />}
                  checkedIcon={<Brightness4 />}
                />
              }
              label={darkMode ? '다크 모드' : '라이트 모드'}
            />
          </Toolbar>
        </AppBar>

        {/* 메인 컨텐츠 */}
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          {/* 통계 카드 */}
          <StatsCards keywords={keywords} />

          {/* 검색 폼 */}
          <Box sx={{ mt: 4 }}>
            <SearchForm
              onSearch={setKeywords}
              onLoadingChange={setLoading}
            />
          </Box>

          {/* 결과 테이블 */}
          <Box sx={{ mt: 4 }}>
            <KeywordTable
              keywords={keywords}
              loading={loading}
            />
          </Box>

          {/* 데이터 시각화 차트 */}
          {keywords.length > 0 && (
            <>
              <TrendChart keywords={keywords} />
              <KGRDistribution keywords={keywords} />
              <ScatterChart keywords={keywords} />
            </>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default App
