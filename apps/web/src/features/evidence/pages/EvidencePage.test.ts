// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import type { Evidence } from '@research-os/domain'
import EvidencePage from './EvidencePage.vue'
import { api } from '../../../shared/api/client'

const evidenceFixture: Evidence[] = [
  {
    id: 'evidence-3',
    issueId: 'issue-1',
    tenantId: 'tenant-default',
    sourceType: 'social',
    sourceLabel: '品牌舆情周报',
    sourceRef: 'social-brand-weekly',
    content: '品牌整体讨论量上升，但对核心功能的质疑仍在扩散。',
    summary: '舆情热度上涨，但负面体验话题没有收敛。',
    stance: 'con',
    tags: ['舆情', '品牌'],
    confidence: 61,
    freshnessAt: '2026-03-16T09:00:00.000Z',
    citation: '舆情平台周报',
  },
  {
    id: 'evidence-1',
    issueId: 'issue-1',
    tenantId: 'tenant-default',
    sourceType: 'survey',
    sourceLabel: '品牌健康度追踪 2026Q3',
    sourceRef: 'survey-q3-nps',
    content: '产品体验维度评分下降明显，开放题中卡顿相关提及率提升。',
    summary: '问卷显示产品体验是最强信号。',
    stance: 'pro',
    tags: ['NPS', '体验'],
    confidence: 86,
    freshnessAt: '2026-03-10T10:00:00.000Z',
    citation: '品牌健康度追踪问卷',
  },
  {
    id: 'evidence-2',
    issueId: 'issue-1',
    tenantId: 'tenant-default',
    sourceType: 'report',
    sourceLabel: '历史季度复盘',
    sourceRef: 'report-history',
    content: '去年同期曾出现相似波动，但在修复关键路径后两周恢复。',
    summary: '历史复盘表明问题可能可快速修复。',
    stance: 'neutral',
    tags: ['历史', '复盘'],
    confidence: 68,
    freshnessAt: '2026-03-12T10:00:00.000Z',
    citation: '内部复盘文档',
  },
]

async function flushView() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('EvidencePage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders an intelligence panel ordered by confidence', async () => {
    vi.spyOn(api, 'getEvidence').mockResolvedValue({ items: evidenceFixture })

    const wrapper = mount(EvidencePage)

    await flushView()

    expect(wrapper.text()).toContain('情报面板')
    expect(wrapper.text()).toContain('高置信证据')
    expect(wrapper.text()).toContain('最新同步')
    expect(wrapper.text()).toContain('问卷显示产品体验是最强信号。')

    const titles = wrapper.findAll('[data-testid="evidence-entry-title"]').map((node) => node.text())
    expect(titles).toEqual(['品牌健康度追踪 2026Q3', '历史季度复盘', '品牌舆情周报'])
  })

  it('shows an error banner when evidence loading fails', async () => {
    vi.spyOn(api, 'getEvidence').mockRejectedValue(new Error('Request failed: 500'))

    const wrapper = mount(EvidencePage)

    await flushView()

    expect(wrapper.find('.error-banner').text()).toContain('Request failed: 500')
  })
})
