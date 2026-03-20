// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import type { ActionItem, DecisionCard, Evidence, Issue, ReviewResult } from '@research-os/domain'
import IssueDetailPage from './IssueDetailPage.vue'
import { api } from '../../../shared/api/client'

const issueFixture: Issue = {
  id: 'issue-q3-nps',
  tenantId: 'tenant-default',
  title: 'Q3 NPS 下降应对策略',
  description: 'Q3 NPS 从 72 降至 67，需要结合问卷、舆情和历史研究找出主因并制定改善动作。',
  domain: 'brand',
  status: 'analyzing',
  ownerId: 'user-li',
  ownerName: '李总监',
  decisionDueAt: '2026-03-25T10:00:00.000Z',
  createdAt: '2026-03-15T08:00:00.000Z',
  updatedAt: '2026-03-19T10:00:00.000Z',
}

const evidenceFixture: Evidence[] = [
  {
    id: 'evidence-e05',
    issueId: 'issue-q3-nps',
    tenantId: 'tenant-default',
    sourceType: 'survey',
    sourceLabel: '品牌健康度追踪 2026Q3',
    sourceRef: 'survey-q3-nps-2026',
    content: '产品体验维度评分下降明显。',
    summary: '产品体验是 NPS 下滑的最强信号。',
    stance: 'pro',
    tags: ['NPS', '产品体验'],
    confidence: 86,
    freshnessAt: '2026-03-10T10:00:00.000Z',
    citation: '品牌健康度追踪问卷，样本 2340',
  },
]

const decisionFixture: DecisionCard = {
  id: 'decision-dc-0042',
  issueId: 'issue-q3-nps',
  version: 1,
  recommendation: '优先解决产品卡顿问题，同时补充去年同期数据排除季节性干扰。',
  proEvidence: [{ evidenceId: 'evidence-e05', argument: '问卷里产品体验降幅最大。', strength: 5 }],
  conEvidence: [{ evidenceId: 'evidence-e18', argument: '存在季节性波动历史先例。', strength: 2 }],
  conflicts: [{ description: '问卷与舆情节奏不一致。', evidenceIds: ['evidence-e05'], interpretation: '问卷滞后于实时反馈。' }],
  blindSpots: [{ description: '缺少去年同期 NPS 数据。', importance: 'high' }],
  assumptions: ['产品团队能快速修复关键路径。'],
  failureWarnings: ['如果根因在基础设施层，修复成本会抬升。'],
  confidenceScore: 75,
  confidenceReason: '问卷与舆情形成交叉验证，但仍缺历史同期数据。',
  status: 'pending_review',
  createdAt: '2026-03-16T14:30:00.000Z',
}

const actionsFixture: ActionItem[] = [
  {
    id: 'action-1',
    decisionCardId: 'decision-dc-0042',
    title: '排查卡顿 Top3 场景',
    description: '定位下单、支付、加载三个主要卡顿场景的根因并产出修复方案。',
    ownerName: '王 PM',
    dueAt: '2026-03-20T10:00:00.000Z',
    expectedMetric: '卡顿相关投诉占比下降 30%',
    status: 'done',
  },
]

const reviewsFixture: ReviewResult[] = [
  {
    id: 'review-1',
    actionItemId: 'action-1',
    decisionCardId: 'decision-dc-0042',
    baselineMetric: '卡顿相关投诉占比 18%',
    actualMetric: '卡顿相关投诉占比 11%',
    delta: '-7pp',
    assessment: 'effective',
    learnings: '优先修复高频路径比全面优化更快见效。',
    createdAt: '2026-03-28T09:00:00.000Z',
  },
]

function createIssueDetailPayload(id: string, title: string = issueFixture.title) {
  const decisionId = `${decisionFixture.id}-${id}`

  return {
    issue: {
      ...issueFixture,
      id,
      title,
    },
    evidence: evidenceFixture.map((item) => ({
      ...item,
      issueId: id,
    })),
    decision: {
      ...decisionFixture,
      id: decisionId,
      issueId: id,
    },
    actions: actionsFixture.map((item) => ({
      ...item,
      decisionCardId: decisionId,
    })),
    reviews: reviewsFixture.map((item) => ({
      ...item,
      decisionCardId: decisionId,
    })),
  }
}

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/issues/:id', component: IssueDetailPage }],
  })
}

function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((res) => {
    resolve = res
  })
  return { promise, resolve }
}

async function flushView() {
  await flushPromises()
  await flushPromises()
}

describe('IssueDetailPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the issue detail in problem to review order', async () => {
    vi.spyOn(api, 'getIssueDetail').mockResolvedValue(createIssueDetailPayload('issue-q3-nps'))

    const router = createTestRouter()
    await router.push('/issues/issue-q3-nps')
    await router.isReady()

    const wrapper = mount(IssueDetailPage, {
      global: {
        plugins: [router],
      },
    })

    await flushView()

    expect(wrapper.text()).toContain('问题 → 证据 → 决策 → 行动 → 回看')
    expect(wrapper.text()).toContain('产品团队能快速修复关键路径。')

    const flow = [
      'problem',
      'evidence',
      'decision',
      'action',
      'review',
    ].map((name) => wrapper.find(`[data-testid="issue-flow-section-${name}"]`).attributes('data-flow'))
    expect(flow).toEqual(['problem', 'evidence', 'decision', 'action', 'review'])
  })

  it('shows only an error banner when the initial load fails', async () => {
    vi.spyOn(api, 'getIssueDetail').mockRejectedValue(new Error('Request failed: 500'))

    const router = createTestRouter()
    await router.push('/issues/issue-q3-nps')
    await router.isReady()

    const wrapper = mount(IssueDetailPage, {
      global: {
        plugins: [router],
      },
    })

    await flushView()

    expect(wrapper.find('.error-banner').text()).toContain('Request failed: 500')
    expect(wrapper.text()).not.toContain('加载中...')
    expect(wrapper.text()).not.toContain('问题 → 证据 → 决策 → 行动 → 回看')
  })

  it('clears stale content when a later route request fails', async () => {
    vi.spyOn(api, 'getIssueDetail').mockImplementation((id: string) => {
      if (id === 'first') {
        return Promise.resolve(createIssueDetailPayload('first', 'First issue'))
      }

      return Promise.reject(new Error('Second issue failed'))
    })

    const router = createTestRouter()
    await router.push('/issues/first')
    await router.isReady()

    const wrapper = mount(IssueDetailPage, {
      global: {
        plugins: [router],
      },
    })

    await flushView()
    expect(wrapper.text()).toContain('First issue')

    await router.push('/issues/second')
    await flushView()

    expect(wrapper.find('.error-banner').text()).toContain('Second issue failed')
    expect(wrapper.text()).not.toContain('First issue')
    expect(wrapper.text()).not.toContain('加载中...')
  })

  it('keeps only the latest route request result', async () => {
    const first = deferred<ReturnType<typeof createIssueDetailPayload>>()
    const second = deferred<ReturnType<typeof createIssueDetailPayload>>()

    vi.spyOn(api, 'getIssueDetail').mockImplementation((id: string) => {
      if (id === 'first') {
        return first.promise
      }

      return second.promise
    })

    const router = createTestRouter()
    await router.push('/issues/first')
    await router.isReady()

    const wrapper = mount(IssueDetailPage, {
      global: {
        plugins: [router],
      },
    })

    await router.push('/issues/second')

    second.resolve(createIssueDetailPayload('second', 'Second issue'))
    await flushView()

    expect(wrapper.text()).toContain('Second issue')

    first.resolve(createIssueDetailPayload('first', 'First issue'))
    await flushView()

    expect(wrapper.text()).toContain('Second issue')
    expect(wrapper.text()).not.toContain('First issue')
  })
})
