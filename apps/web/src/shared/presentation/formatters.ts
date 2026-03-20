import type {
  ActionStatus,
  DecisionStatus,
  EvidenceSourceType,
  EvidenceStance,
  IssueStatus,
  ReviewAssessment,
} from '@research-os/domain'

type Tone = 'accent' | 'warning' | 'success' | 'danger' | 'muted'

interface Meta {
  label: string
  tone: Tone
}

const issueStatusMeta: Record<IssueStatus, Meta> = {
  draft: { label: '草稿', tone: 'muted' },
  collecting: { label: '采集中', tone: 'accent' },
  analyzing: { label: '分析中', tone: 'warning' },
  pending_decision: { label: '待决策', tone: 'accent' },
  decided: { label: '已决策', tone: 'success' },
  closed: { label: '已关闭', tone: 'muted' },
}

const actionStatusMeta: Record<ActionStatus, Meta> = {
  todo: { label: '待开始', tone: 'muted' },
  in_progress: { label: '进行中', tone: 'warning' },
  done: { label: '已完成', tone: 'success' },
  verified: { label: '已验证', tone: 'accent' },
}

const decisionStatusMeta: Record<DecisionStatus, Meta> = {
  pending_review: { label: '待审阅', tone: 'warning' },
  adopted: { label: '已采纳', tone: 'success' },
  rejected: { label: '已拒绝', tone: 'danger' },
  expired: { label: '已过期', tone: 'muted' },
}

const evidenceSourceMeta: Record<EvidenceSourceType, Meta> = {
  survey: { label: '问卷', tone: 'accent' },
  social: { label: '舆情', tone: 'warning' },
  competitor: { label: '竞品', tone: 'danger' },
  report: { label: '报告', tone: 'success' },
  manual: { label: '人工录入', tone: 'muted' },
}

const evidenceStanceMeta: Record<EvidenceStance, Meta> = {
  pro: { label: '正方', tone: 'success' },
  con: { label: '反方', tone: 'danger' },
  neutral: { label: '中立', tone: 'muted' },
}

const reviewAssessmentMeta: Record<ReviewAssessment, Meta> = {
  effective: { label: '有效', tone: 'success' },
  partial: { label: '部分有效', tone: 'warning' },
  ineffective: { label: '无效', tone: 'muted' },
  negative: { label: '负向', tone: 'danger' },
}

export function getIssueStatusMeta(status: IssueStatus): Meta {
  return issueStatusMeta[status]
}

export function getActionStatusMeta(status: ActionStatus): Meta {
  return actionStatusMeta[status]
}

export function getDecisionStatusMeta(status: DecisionStatus): Meta {
  return decisionStatusMeta[status]
}

export function getEvidenceSourceMeta(sourceType: EvidenceSourceType): Meta {
  return evidenceSourceMeta[sourceType]
}

export function getEvidenceStanceMeta(stance: EvidenceStance): Meta {
  return evidenceStanceMeta[stance]
}

export function getReviewAssessmentMeta(assessment: ReviewAssessment): Meta {
  return reviewAssessmentMeta[assessment]
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
