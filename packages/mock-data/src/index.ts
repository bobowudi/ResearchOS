import type {
  ActionItem,
  DashboardPayload,
  DecisionCard,
  Evidence,
  Issue,
  ReviewResult,
  User,
} from '@research-os/domain'

export const users: User[] = [
  {
    id: 'user-li',
    name: '李总监',
    email: 'li@example.com',
    role: 'admin',
  },
  {
    id: 'user-wang',
    name: '王 PM',
    email: 'wang@example.com',
    role: 'member',
  },
]

export const issues: Issue[] = [
  {
    id: 'issue-q3-nps',
    tenantId: 'tenant-default',
    title: 'Q3 NPS 下降应对策略',
    description: 'Q3 NPS 从 72 降至 67，需要结合问卷、舆情和历史研究找出主因并制定 Q4 改善动作。',
    domain: 'brand',
    status: 'analyzing',
    ownerId: 'user-li',
    ownerName: '李总监',
    decisionDueAt: '2026-03-25T10:00:00.000Z',
    createdAt: '2026-03-15T08:00:00.000Z',
    updatedAt: '2026-03-19T10:00:00.000Z',
  },
  {
    id: 'issue-xhs-budget',
    tenantId: 'tenant-default',
    title: '是否加大小红书投放',
    description: '评估小红书渠道在新品期是否值得增加预算，重点看口碑发酵、转化效率和竞品动态。',
    domain: 'market',
    status: 'pending_decision',
    ownerId: 'user-li',
    ownerName: '李总监',
    decisionDueAt: '2026-03-22T10:00:00.000Z',
    createdAt: '2026-03-14T08:00:00.000Z',
    updatedAt: '2026-03-18T11:00:00.000Z',
  },
]

export const evidence: Evidence[] = [
  {
    id: 'evidence-e05',
    issueId: 'issue-q3-nps',
    tenantId: 'tenant-default',
    sourceType: 'survey',
    sourceLabel: '品牌健康度追踪 2026Q3',
    sourceRef: 'survey-q3-nps-2026',
    content: '产品体验维度评分从上季度的 81 分下降到 73 分，开放题中“卡顿”相关提及率提升 40%。',
    summary: '产品体验是 NPS 下滑的最强信号，卡顿被反复提及。',
    stance: 'pro',
    tags: ['NPS', '产品体验', '卡顿'],
    confidence: 86,
    freshnessAt: '2026-03-10T10:00:00.000Z',
    citation: '品牌健康度追踪问卷，样本 2340',
  },
  {
    id: 'evidence-e12',
    issueId: 'issue-q3-nps',
    tenantId: 'tenant-default',
    sourceType: 'social',
    sourceLabel: '小红书口碑月报',
    sourceRef: 'social-xhs-2026-03',
    content: '近三周与“卡顿”有关的负向帖子增长 40%，集中在下单和加载场景。',
    summary: '实时舆情侧面支持问卷里的卡顿信号。',
    stance: 'pro',
    tags: ['口碑', '小红书', '卡顿'],
    confidence: 73,
    freshnessAt: '2026-03-15T12:00:00.000Z',
    citation: '舆情平台监测，样本 12847',
  },
  {
    id: 'evidence-e18',
    issueId: 'issue-q3-nps',
    tenantId: 'tenant-default',
    sourceType: 'social',
    sourceLabel: '品牌舆情周报',
    sourceRef: 'social-brand-weekly-2026w11',
    content: '品牌整体好感度维持稳定，“性价比”相关正面表达没有显著下滑。',
    summary: '整体品牌面没有大幅走弱，说明问题可能更聚焦在体验层。',
    stance: 'con',
    tags: ['品牌好感', '性价比'],
    confidence: 61,
    freshnessAt: '2026-03-16T09:00:00.000Z',
    citation: '舆情平台周报',
  },
  {
    id: 'evidence-e21',
    issueId: 'issue-q3-nps',
    tenantId: 'tenant-default',
    sourceType: 'report',
    sourceLabel: '历史季度复盘',
    sourceRef: 'report-review-2025-q3',
    content: '去年 Q3 同样出现体验评分短期波动，但在修复结算流程后两周恢复。',
    summary: '历史上同类问题可通过体验修复快速回弹。',
    stance: 'neutral',
    tags: ['历史复盘', '季节性'],
    confidence: 68,
    freshnessAt: '2026-03-12T10:00:00.000Z',
    citation: '内部复盘文档',
  },
]

export const decisionCards: DecisionCard[] = [
  {
    id: 'decision-dc-0042',
    issueId: 'issue-q3-nps',
    version: 1,
    recommendation: '优先解决产品卡顿问题，同时补充去年同期数据排除季节性干扰。',
    proEvidence: [
      {
        evidenceId: 'evidence-e12',
        argument: '舆情中卡顿抱怨激增，说明体验问题正在放大。',
        strength: 4,
      },
      {
        evidenceId: 'evidence-e05',
        argument: '问卷里产品体验降幅最大，和舆情形成互证。',
        strength: 5,
      },
    ],
    conEvidence: [
      {
        evidenceId: 'evidence-e18',
        argument: '整体品牌好感度并未明显下滑，可能不是品牌层危机。',
        strength: 3,
      },
      {
        evidenceId: 'evidence-e21',
        argument: '存在季节性波动的历史先例，需要补数据排除。',
        strength: 2,
      },
    ],
    conflicts: [
      {
        description: '问卷显示满意度尚可，但实时舆情里卡顿抱怨明显上升。',
        evidenceIds: ['evidence-e05', 'evidence-e12'],
        interpretation: '问卷采样周期更长，可能滞后于实时舆情。',
      },
    ],
    blindSpots: [
      {
        description: '缺少去年 Q3 同期 NPS 数据，无法完全排除季节性。',
        importance: 'high',
      },
      {
        description: '缺少竞品体验指标，无法判断是否为行业共性问题。',
        importance: 'medium',
      },
    ],
    assumptions: ['产品团队能在 Q4 前完成关键卡顿修复。', 'NPS 下滑主要由可控体验问题引起。'],
    failureWarnings: ['如果卡顿根因在基础设施层，前端优化无法解决。', '如果是季节性波动，过早投入会浪费资源。'],
    confidenceScore: 75,
    confidenceReason: '问卷与舆情形成交叉验证，但仍缺历史同期数据。',
    status: 'pending_review',
    createdAt: '2026-03-16T14:30:00.000Z',
  },
]

export const actionItems: ActionItem[] = [
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
  {
    id: 'action-2',
    decisionCardId: 'decision-dc-0042',
    title: '补充去年 Q3 NPS 数据',
    description: '补足历史同期数据并对比当前波动是否异常。',
    ownerName: '研究团队',
    dueAt: '2026-03-19T10:00:00.000Z',
    expectedMetric: '完成同期对比分析',
    status: 'todo',
  },
]

export const reviewResults: ReviewResult[] = [
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

export const dashboard: DashboardPayload = {
  stats: {
    activeIssues: 2,
    pendingDecisionCards: 1,
    overdueActions: 1,
    completedActions: 1,
    totalActions: 2,
  },
  focusDecisions: [
    {
      id: 'decision-dc-0042',
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
      title: '小红书舆情数据已同步',
      subtitle: '+127 条新证据，卡顿相关提及率继续上升。',
      timestamp: '3 小时前',
    },
    {
      id: 'feed-2',
      type: 'evidence',
      title: 'Q3 NPS 问卷已导入',
      subtitle: '共 2,340 份样本，产品体验维度降幅最大。',
      timestamp: '昨天',
    },
  ],
  actionProgress: {
    completed: 1,
    total: 2,
    percent: 50,
  },
}
