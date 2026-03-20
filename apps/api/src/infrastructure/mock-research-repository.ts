import { dashboard, issues, evidence, decisionCards, actionItems, reviewResults } from './mock/research-data.ts'

export interface ResearchRepository {
  listIssues(): typeof issues
  listEvidence(): typeof evidence
  listDecisionCards(): typeof decisionCards
  listActionItems(): typeof actionItems
  listReviewResults(): typeof reviewResults
  getDashboard(): typeof dashboard
}

export const mockResearchRepository: ResearchRepository = {
  listIssues: () => issues,
  listEvidence: () => evidence,
  listDecisionCards: () => decisionCards,
  listActionItems: () => actionItems,
  listReviewResults: () => reviewResults,
  getDashboard: () => dashboard,
}
