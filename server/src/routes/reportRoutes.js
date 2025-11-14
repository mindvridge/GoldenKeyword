import express from 'express'
import * as ReportService from '../services/reportService.js'

const router = express.Router()

/**
 * POST /api/reports/performance
 * 전체 성과 리포트 생성
 * Body: { startDate?, endDate?, includeRecommendations? }
 */
router.post('/performance', async (req, res) => {
  try {
    const { startDate, endDate, includeRecommendations = true } = req.body

    const options = {
      includeRecommendations,
    }

    if (startDate) {
      options.startDate = new Date(startDate)
    }
    if (endDate) {
      options.endDate = new Date(endDate)
    }

    const report = await ReportService.generatePerformanceReport(options)

    res.json({
      success: true,
      data: report,
    })
  } catch (error) {
    console.error('Generate performance report error:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * POST /api/reports/summary
 * 간단한 리포트 요약
 * Body: { startDate?, endDate? }
 */
router.post('/summary', async (req, res) => {
  try {
    const { startDate, endDate } = req.body

    const options = {}

    if (startDate) {
      options.startDate = new Date(startDate)
    }
    if (endDate) {
      options.endDate = new Date(endDate)
    }

    const summary = await ReportService.generateReportSummary(options)

    res.json({
      success: true,
      data: summary,
    })
  } catch (error) {
    console.error('Generate report summary error:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

/**
 * GET /api/reports/quick
 * 빠른 성과 요약 (최근 7일)
 */
router.get('/quick', async (req, res) => {
  try {
    const endDate = new Date()
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const summary = await ReportService.generateReportSummary({
      startDate,
      endDate,
    })

    res.json({
      success: true,
      data: summary,
    })
  } catch (error) {
    console.error('Generate quick report error:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

export default router
