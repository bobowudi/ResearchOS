import { describe, expect, it } from 'vitest'
import {
  formatDateTime,
  getActionStatusMeta,
  getEvidenceSourceMeta,
  getEvidenceStanceMeta,
  getIssueStatusMeta,
  getReviewAssessmentMeta,
} from './formatters'

describe('presentation formatters', () => {
  it('maps issue statuses to readable labels and tones', () => {
    expect(getIssueStatusMeta('analyzing')).toEqual({ label: '分析中', tone: 'warning' })
    expect(getIssueStatusMeta('pending_decision')).toEqual({ label: '待决策', tone: 'accent' })
  })

  it('maps action statuses to readable labels and tones', () => {
    expect(getActionStatusMeta('todo')).toEqual({ label: '待开始', tone: 'muted' })
    expect(getActionStatusMeta('done')).toEqual({ label: '已完成', tone: 'success' })
  })

  it('maps evidence source and stance metadata', () => {
    expect(getEvidenceSourceMeta('survey')).toEqual({ label: '问卷', tone: 'accent' })
    expect(getEvidenceStanceMeta('con')).toEqual({ label: '反方', tone: 'danger' })
  })

  it('maps review assessments to readable labels and tones', () => {
    expect(getReviewAssessmentMeta('effective')).toEqual({ label: '有效', tone: 'success' })
    expect(getReviewAssessmentMeta('negative')).toEqual({ label: '负向', tone: 'danger' })
  })

  it('formats ISO timestamps for Chinese locale display', () => {
    expect(formatDateTime('2026-03-19T10:00:00.000Z')).toMatch('2026')
  })
})
