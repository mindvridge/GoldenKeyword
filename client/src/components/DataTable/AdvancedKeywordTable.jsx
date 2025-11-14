import { useState, useMemo } from 'react'
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Chip,
  Box,
  Typography,
  Button,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from '@mui/material'
import {
  Download,
  Star,
  TrendingUp,
  TrendingDown,
  BookmarkBorder,
  Info,
  Verified,
} from '@mui/icons-material'
import { CSVLink } from 'react-csv'
import * as XLSX from 'xlsx'
import { getKGRLabel, getKGRRating, formatNumber } from '../../utils/calculations'

/**
 * 고급 키워드 결과 테이블 컴포넌트
 * 실제 allintitle, SERP 분석, 트렌드 등 고급 정보 표시
 */
function AdvancedKeywordTable({ keywords, loading }) {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [orderBy, setOrderBy] = useState('kgr')
  const [order, setOrder] = useState('asc')
  const [detailDialog, setDetailDialog] = useState(null)

  // 정렬 핸들러
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  // 페이지 변경
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  // 행 개수 변경
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  // 상세 정보 다이얼로그
  const handleShowDetail = (keyword) => {
    setDetailDialog(keyword)
  }

  // 정렬된 키워드
  const sortedKeywords = useMemo(() => {
    if (!keywords || keywords.length === 0) return []

    return [...keywords].sort((a, b) => {
      const aValue = a[orderBy]
      const bValue = b[orderBy]

      if (order === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }, [keywords, order, orderBy])

  // 페이지네이션
  const paginatedKeywords = sortedKeywords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  // CSV 내보내기 데이터
  const csvData = keywords.map((k) => ({
    키워드: k.keyword,
    검색량: k.searchVolume,
    'Allintitle (실제)': k.allintitle,
    경쟁도: k.competition,
    CPC: k.cpc,
    KGR: k.kgr,
    KEI: k.kei,
    난이도: k.difficulty,
    트렌드: k.trend || 'N/A',
    의도: k.intent || 'N/A',
    점수: k.score,
  }))

  // Excel 내보내기
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(csvData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '키워드 분석')
    XLSX.writeFile(
      workbook,
      `황금키워드_분석_${new Date().toISOString().split('T')[0]}.xlsx`
    )
  }

  // KGR 칩 색상
  const getKGRChipColor = (kgr) => {
    const rating = getKGRRating(kgr)
    if (rating === 'excellent') return 'success'
    if (rating === 'good') return 'warning'
    return 'error'
  }

  // 트렌드 아이콘
  const getTrendIcon = (trend) => {
    if (trend === 'rising') return <TrendingUp color="success" fontSize="small" />
    if (trend === 'declining') return <TrendingDown color="error" fontSize="small" />
    return null
  }

  if (!keywords || keywords.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <TrendingUp sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6" gutterBottom>
            키워드를 검색해보세요
          </Typography>
          <Typography variant="body2">
            고급 분석 모드에서 실제 allintitle과 SERP 분석 결과를 확인하세요.
          </Typography>
        </Box>
      </Paper>
    )
  }

  return (
    <>
      <Paper elevation={3}>
        {/* 헤더 */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">
            황금 키워드 분석 결과 ({keywords.length}개)
          </Typography>
          <Box>
            <CSVLink
              data={csvData}
              filename={`황금키워드_${new Date().toISOString().split('T')[0]}.csv`}
              style={{ textDecoration: 'none', marginRight: 8 }}
            >
              <Button variant="outlined" startIcon={<Download />} size="small">
                CSV
              </Button>
            </CSVLink>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExportExcel}
              size="small"
            >
              Excel
            </Button>
          </Box>
        </Box>

        {/* 테이블 */}
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>순위</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>
                  <TableSortLabel
                    active={orderBy === 'keyword'}
                    direction={orderBy === 'keyword' ? order : 'asc'}
                    onClick={() => handleSort('keyword')}
                  >
                    키워드
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  <TableSortLabel
                    active={orderBy === 'searchVolume'}
                    direction={orderBy === 'searchVolume' ? order : 'asc'}
                    onClick={() => handleSort('searchVolume')}
                  >
                    검색량
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  <Tooltip title="실제 allintitle: 검색 결과 수">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      Allintitle
                      <Verified fontSize="small" sx={{ ml: 0.5, color: 'primary.main' }} />
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  <TableSortLabel
                    active={orderBy === 'kgr'}
                    direction={orderBy === 'kgr' ? order : 'asc'}
                    onClick={() => handleSort('kgr')}
                  >
                    KGR
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="right">
                  <TableSortLabel
                    active={orderBy === 'cpc'}
                    direction={orderBy === 'cpc' ? order : 'asc'}
                    onClick={() => handleSort('cpc')}
                  >
                    CPC
                  </TableSortLabel>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  트렌드
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  상태
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">
                  액션
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedKeywords.map((keyword, index) => (
                <TableRow
                  key={keyword.id || index}
                  hover
                  sx={{
                    '&:hover': { backgroundColor: 'action.hover' },
                    backgroundColor: keyword.isMainKeyword
                      ? 'primary.light'
                      : 'inherit',
                  }}
                >
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {keyword.keyword}
                      </Typography>
                      {keyword.isMainKeyword && (
                        <Chip
                          label="메인"
                          size="small"
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {formatNumber(keyword.searchVolume)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="실제 Google allintitle: 검색 결과">
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 'bold', color: 'primary.main' }}
                      >
                        {formatNumber(keyword.allintitle)}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        color:
                          keyword.kgr < 0.25
                            ? 'success.main'
                            : keyword.kgr < 1.0
                            ? 'warning.main'
                            : 'error.main',
                      }}
                    >
                      {keyword.kgr}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">${keyword.cpc}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    {getTrendIcon(keyword.trend)}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={getKGRLabel(keyword.kgr)}
                      color={getKGRChipColor(keyword.kgr)}
                      size="small"
                      icon={keyword.kgr < 0.25 ? <Star fontSize="small" /> : undefined}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="상세 정보">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleShowDetail(keyword)}
                      >
                        <Info fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="저장">
                      <IconButton size="small" color="primary">
                        <BookmarkBorder fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 페이지네이션 */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={keywords.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="페이지당 행 수:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} / 총 ${count}개`}
        />
      </Paper>

      {/* 상세 정보 다이얼로그 */}
      <Dialog
        open={!!detailDialog}
        onClose={() => setDetailDialog(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>키워드 상세 분석</DialogTitle>
        <DialogContent>
          {detailDialog && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {detailDialog.keyword}
              </Typography>

              <List>
                <ListItem>
                  <ListItemText
                    primary="검색량"
                    secondary={formatNumber(detailDialog.searchVolume)}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Allintitle (실제)"
                    secondary={`${formatNumber(detailDialog.allintitle)} 검색 결과`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText primary="KGR" secondary={detailDialog.kgr} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="KEI" secondary={detailDialog.kei} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="CPC" secondary={`$${detailDialog.cpc}`} />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="난이도"
                    secondary={`${detailDialog.difficulty}/100`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="트렌드"
                    secondary={detailDialog.trend || 'N/A'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="키워드 의도"
                    secondary={detailDialog.intent || 'N/A'}
                  />
                </ListItem>
                {detailDialog.recommendation && (
                  <ListItem>
                    <ListItemText
                      primary="추천"
                      secondary={detailDialog.recommendation.message}
                    />
                  </ListItem>
                )}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(null)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AdvancedKeywordTable
