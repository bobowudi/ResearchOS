import type { ResearchRepository } from '../../infrastructure/mock-research-repository.ts'

export function getIssueDetail(repository: ResearchRepository, id: string) {
  const issue = repository.listIssues().find((item) => item.id === id)

  if (!issue) {
    return null
  }

  const decision = repository.listDecisionCards().find((item) => item.issueId === id) ?? null
  const actions = decision ? repository.listActionItems().filter((item) => item.decisionCardId === decision.id) : []
  const reviews = decision ? repository.listReviewResults().filter((item) => item.decisionCardId === decision.id) : []

  return {
    issue,
    evidence: repository.listEvidence().filter((item) => item.issueId === id),
    decision,
    actions,
    reviews,
  }
}
