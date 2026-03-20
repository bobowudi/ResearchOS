// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { DashboardPayload } from '@research-os/domain'
import DashboardPage from './DashboardPage.vue'
import { api } from '../../../shared/api/client'

const dashboardFixture: DashboardPayload = {
  stats: {
    activeIssues: 8,
    pendingDecisionCards: 3,
    overdueActions: 1,
    completedActions: 9,
    totalActions: 12,
  },
  focusDecisions: [
    {
      id: 'decision-1',
      issueId: 'issue-q3-nps',
      issueTitle: 'Q3 NPS 下降应对策略',
      confidenceScore: 75,
      recommendation: '优先解决产品卡顿问题，同时补充去年同期数据排除季节性干扰。',
      status: 'pending_review',
    },
  ],
  recentEvidence: [
    {
      id: 'feed-1',
      type: 'evidence',
      title: '品牌健康度追踪 2026Q3',
      subtitle: '产品体验是 NPS 下滑的最强信号。',
      timestamp: '10 分钟前',
    },
    {
      id: 'feed-2',
      type: 'decision',
      title: 'Q3 NPS 下降应对策略',
      subtitle: '建议优先修复关键路径后再决定资源投入。',
      timestamp: '30 分钟前',
    },
    {
      id: 'feed-3',
      type: 'action',
      title: '排查卡顿 Top3 场景',
      subtitle: '已经进入验证闭环。',
      timestamp: '1 小时前',
    },
  ],
  actionProgress: {
    completed: 9,
    total: 12,
    percent: 75,
  },
}

async function flushView() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('DashboardPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a decision-first executive cockpit', async () => {
    vi.spyOn(api, 'getDashboard').mockResolvedValue(dashboardFixture)

    const wrapper = mount(DashboardPage, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })

    await flushView()

    expect(wrapper.text()).toContain('现在最需要关注的判断')
    expect(wrapper.text()).toContain('Q3 NPS 下降应对策略')
    expect(wrapper.text()).toContain('优先解决产品卡顿问题，同时补充去年同期数据排除季节性干扰。')
    expect(wrapper.text()).toContain('待审阅')
    expect(wrapper.text()).toContain('置信度 75%')
    expect(wrapper.text()).toContain('最近证据动态')
    expect(wrapper.text()).toContain('执行与决策健康度')
    expect(wrapper.text()).toContain('9/12')
    expect(wrapper.text()).toContain('Evidence update')
    expect(wrapper.text()).toContain('Decision update')
    expect(wrapper.text()).toContain('Action update')
  })

  it('keeps the dashboard context visible when no focus decision exists', async () => {
    vi.spyOn(api, 'getDashboard').mockResolvedValue({
      ...dashboardFixture,
      focusDecisions: [],
    })

    const wrapper = mount(DashboardPage, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })

    await flushView()

    expect(wrapper.find('.dashboard-hero').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('现在最需要关注的判断')
    expect(wrapper.text()).toContain('活跃议题')
    expect(wrapper.text()).toContain('待审阅决策卡')
    expect(wrapper.text()).toContain('行动完成率')
    expect(wrapper.text()).toContain('逾期行动项')
    expect(wrapper.text()).toContain('最近证据动态')
    expect(wrapper.text()).toContain('品牌健康度追踪 2026Q3')
    expect(wrapper.text()).toContain('Evidence update')
    expect(wrapper.text()).toContain('执行与决策健康度')
    expect(wrapper.text()).toContain('9/12')
    expect(wrapper.text()).toContain('待决策项目')
    expect(wrapper.text()).toContain('已完成动作')
    expect(wrapper.text()).toContain('总动作数')
    expect(wrapper.text()).not.toContain('加载中...')
  })

  it('shows an error banner when dashboard loading fails', async () => {
    vi.spyOn(api, 'getDashboard').mockRejectedValue(new Error('Request failed: 500'))

    const wrapper = mount(DashboardPage, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })

    await flushView()

    expect(wrapper.find('.error-banner').text()).toContain('Request failed: 500')
    expect(wrapper.text()).not.toContain('加载中...')
  })
})
