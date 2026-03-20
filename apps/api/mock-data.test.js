import { strict as assert } from 'node:assert'
import test from 'node:test'
import { dashboard, issues, evidence, decisionCards, actionItems, reviewResults } from './src/infrastructure/mock/research-data.ts'

test('mock data covers core MVP objects', () => {
  assert.ok(issues.length > 0)
  assert.ok(evidence.length > 0)
  assert.ok(decisionCards.length > 0)
  assert.ok(actionItems.length > 0)
  assert.ok(dashboard.focusDecisions.length > 0)
})

test('reviewed actions count as completed in dashboard stats', () => {
  const completedActionCount = actionItems.filter((item) => item.status === 'done' || item.status === 'verified').length

  for (const review of reviewResults) {
    const action = actionItems.find((item) => item.id === review.actionItemId)
    assert.ok(action)
    assert.ok(action.status === 'done' || action.status === 'verified')
  }

  assert.equal(dashboard.stats.completedActions, completedActionCount)
  assert.equal(dashboard.actionProgress.completed, completedActionCount)
  assert.equal(dashboard.actionProgress.total, actionItems.length)
  assert.equal(dashboard.actionProgress.percent, Math.round((completedActionCount / actionItems.length) * 100))
})
