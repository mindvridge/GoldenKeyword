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
  Skeleton,
  Tooltip,
  IconButton,
} from '@mui/material'
import {
  Download,
  Star,
  TrendingUp,
  TrendingDown,
  BookmarkBorder,
} from '@mui/icons-material'
import { CSVLink } from 'react-csv'
import * as XLSX from 'xlsx'
import { getKGRLabel, getKGRRating, formatNumber, formatCurrency } from '../../utils/calculations'

/**
 * 키워드 결과 테이블 컴포넌트
 * 키워드 분석 결과를 테이블 형식으로 표시하고 정렬, 페이징, 내보내기 기능을 제공합니다.
 */
function KeywordTable({ keywords, loading }) {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [orderBy, setOrderBy] = useState('kgr')
  const [order, setOrder] = useState('asc')

  // 정렬 핸들러
  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  // 페이지 변경 핸들러
  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }

  // 행 개수 변경 핸들러
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
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

  // 페이지네이션된 키워드
  const paginatedKeywords = sortedKeywords.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  )

  // CSV 내보내기 데이터
  const csvData = keywords.map((k) => ({
    키워드: k.keyword,
    검색량: k.searchVolume,
    Allintitle: k.allintitle,
    경쟁도: k.competition,
    CPC: k.cpc,
    KGR: k.kgr,
    KEI: k.kei,
    난이도: k.difficulty,
    점수: k.score,
  }))

  // Excel 내보내기
  const handleExportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(csvData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '키워드 분석')
    XLSX.writeFile(workbook, `키워드_분석_결과_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  // KGR 칩 색상
  const getKGRChipColor = (kgr) => {
    const rating = getKGRRating(kgr)
    if (rating === 'excellent') return 'success'
    if (rating === 'good') return 'warning'
    return 'error'
  }

  // 로딩 스켈레톤
  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Skeleton variant="text" width={150} height={40} />
          <Skeleton variant="rectangular" width={120} height={36} />
        </Box>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1 }} />
        ))}
      </Paper>
    )
  }

  // 데이터 없음
  if (!keywords || keywords.length === 0) {
    return (
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box
          sx={{
            textAlign: 'center',
            py: 8,
            color: 'text.secondary',
          }}
        >
          <TrendingUp sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
          <Typography variant="h6" gutterBottom>
            키워드를 검색해보세요
          </Typography>
          <Typography variant="body2">
            위의 검색 폼에서 시드 키워드를 입력하면 황금 키워드를 찾을 수 있습니다.
          </Typography>
        </Box>
      </Paper>
    )
  }

  return (
    <Paper elevation={3}>
      {/* 헤더 */}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          키워드 분석 결과 ({keywords.length}개)
        </Typography>
        <Box>
          <CSVLink
            data={csvData}
            filename={`키워드_분석_결과_${new Date().toISOString().split('T')[0]}.csv`}
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
                  active={orderBy === 'kei'}
                  direction={orderBy === 'kei' ? order : 'asc'}
                  onClick={() => handleSort('kei')}
                >
                  KEI
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
              <TableCell sx={{ fontWeight: 'bold' }} align="right">
                <TableSortLabel
                  active={orderBy === 'difficulty'}
                  direction={orderBy === 'difficulty' ? order : 'asc'}
                  onClick={() => handleSort('difficulty')}
                >
                  난이도
                </TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">상태</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }} align="center">액션</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedKeywords.map((keyword, index) => (
              <TableRow
                key={keyword.id}
                hover
                sx={{
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {keyword.keyword}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">
                    {formatNumber(keyword.searchVolume)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {keyword.kgr}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{keyword.kei}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">${keyword.cpc}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2">{keyword.difficulty}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={getKGRLabel(keyword.kgr)}
                    color={getKGRChipColor(keyword.kgr)}
                    size="small"
                    icon={
                      keyword.kgr < 0.25 ? (
                        <Star fontSize="small" />
                      ) : undefined
                    }
                  />
                </TableCell>
                <TableCell align="center">
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
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} / 총 ${count}개`
        }
      />
    </Paper>
  )
}

export default KeywordTable
