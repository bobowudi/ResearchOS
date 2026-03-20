// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Issue } from '@research-os/domain'
import IssuesPage from './IssuesPage.vue'
import { api } from '../../../shared/api/client'

const issuesFixture: Issue[] = [
  {
    id: 'issue-later-analysis',
    tenantId: 'tenant-default',
    title: '体验问题归因复盘',
    description: '梳理反馈与日志，确认体验问题的主因。',
    domain: 'product',
    status: 'analyzing',
    ownerId: 'u-1',
    ownerName: '研究团队',
    decisionDueAt: '2026-03-24T10:00:00.000Z',
    createdAt: '2026-03-18T10:00:00.000Z',
    updatedAt: '2026-03-19T09:00:00.000Z',
  },
  {
    id: 'issue-soon-decision',
    tenantId: 'tenant-default',
    title: '是否加大小红书投放',
    description: '需要在本周内决定是否扩大预算。',
    domain: 'market',
    status: 'pending_decision',
    ownerId: 'u-2',
    ownerName: '李总监',
    decisionDueAt: '2026-03-20T10:00:00.000Z',
    createdAt: '2026-03-17T10:00:00.000Z',
    updatedAt: '2026-03-19T10:00:00.000Z',
  },
  {
    id: 'issue-overdue',
    tenantId: 'tenant-default',
    title: '品牌恢复动作是否延期',
    description: '决策窗口已过，需要立即判断后续动作。',
    domain: 'brand',
    status: 'pending_decision',
    ownerId: 'u-3',
    ownerName: '王 PM',
    decisionDueAt: '2026-03-18T10:00:00.000Z',
    createdAt: '2026-03-15T10:00:00.000Z',
    updatedAt: '2026-03-18T12:00:00.000Z',
  },
]

async function flushView() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('IssuesPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('renders a scan-first workspace ordered by urgency', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-19T10:00:00.000Z'))
    vi.spyOn(api, 'getIssues').mockResolvedValue({ items: issuesFixture })

    const wrapper = mount(IssuesPage, {
      global: {
        stubs: {
          RouterLink: {
            template: '<a><slot /></a>',
          },
        },
      },
    })

    await flushView()

    expect(wrapper.text()).toContain('优先处理')
    expect(wrapper.text()).toContain('品牌恢复动作是否延期')
    expect(wrapper.text()).toContain('已逾期')
    expect(wrapper.text()).toContain('48 小时内')

    const rowTitles = wrapper.findAll('[data-testid="issue-row-title"]').map((node) => node.text())
    expect(rowTitles).toEqual(['品牌恢复动作是否延期', '是否加大小红书投放', '体验问题归因复盘'])
  })

  it('shows an error banner when loading fails', async () => {
    vi.spyOn(api, 'getIssues').mockRejectedValue(new Error('Request failed: 500'))

    const wrapper = mount(IssuesPage, {
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
  })
})
