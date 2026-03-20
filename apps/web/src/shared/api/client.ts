import type { DashboardPayload, Evidence, Issue, DecisionCard, ActionItem, ReviewResult } from '@research-os/domain'

interface IssueDetailPayload {
  issue: Issue
  evidence: Evidence[]
  decision: DecisionCard | null
  actions: ActionItem[]
  reviews: ReviewResult[]
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
  return response.json() as Promise<T>
}

export const api = {
  getDashboard: () => getJson<DashboardPayload>('/api/dashboard'),
  getIssues: async () => getJson<{ items: Issue[] }>('/api/issues'),
  getIssueDetail: (id: string) => getJson<IssueDetailPayload>(`/api/issues/${id}`),
  getEvidence: async () => getJson<{ items: Evidence[] }>('/api/evidence'),
}
