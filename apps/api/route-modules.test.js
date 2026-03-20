import { strict as assert } from 'node:assert'
import test from 'node:test'
import { dashboard, issues, evidence, decisionCards, actionItems, reviewResults } from './src/infrastructure/mock/research-data.ts'
import { mockResearchRepository } from './src/infrastructure/mock-research-repository.ts'
import { listIssues } from './src/modules/issues/service.ts'
import { getIssueDetail } from './src/modules/issues/detail-service.ts'
import { getDashboardPayload } from './src/modules/dashboard/service.ts'
import { listEvidence } from './src/modules/evidence/service.ts'
import { listDecisionCards } from './src/modules/decisions/service.ts'
import { listActionItems } from './src/modules/actions/service.ts'

test('issue detail module composes related records by issue id', () => {
  const detail = getIssueDetail(mockResearchRepository, 'issue-q3-nps')

  assert.deepEqual(detail, {
    issue: issues.find((item) => item.id === 'issue-q3-nps'),
    evidence: evidence.filter((item) => item.issueId === 'issue-q3-nps'),
    decision: decisionCards.find((item) => item.issueId === 'issue-q3-nps') ?? null,
    actions: actionItems.filter((item) => item.decisionCardId === 'decision-dc-0042'),
    reviews: reviewResults.filter((item) => item.decisionCardId === 'decision-dc-0042'),
  })
})

test('issue detail module returns null for missing issues', () => {
  assert.equal(getIssueDetail(mockResearchRepository, 'missing-issue'), null)
})

test('collection modules preserve existing response contracts', () => {
  assert.deepEqual(listIssues(mockResearchRepository), { items: issues })
  assert.deepEqual(listEvidence(mockResearchRepository), { items: evidence })
  assert.deepEqual(listDecisionCards(mockResearchRepository), { items: decisionCards })
  assert.deepEqual(listActionItems(mockResearchRepository), { items: actionItems })
  assert.deepEqual(getDashboardPayload(mockResearchRepository), dashboard)
})
