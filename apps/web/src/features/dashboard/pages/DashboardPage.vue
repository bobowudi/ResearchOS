<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '../../../shared/api/client'
import { getDecisionStatusMeta } from '../../../shared/presentation/formatters'
import type { DashboardPayload } from '@research-os/domain'
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Activity,
  Target,
  BarChart3,
  Zap,
} from 'lucide-vue-next'

const dashboard = ref<DashboardPayload | null>(null)
const errorMessage = ref('')

const primaryDecision = computed(() => dashboard.value?.focusDecisions[0] ?? null)
const primaryDecisionStatus = computed(() => {
  if (!primaryDecision.value) {
    return null
  }

  return getDecisionStatusMeta(primaryDecision.value.status)
})

const secondaryStats = computed(() => {
  if (!dashboard.value) {
    return []
  }

  return [
    {
      label: '活跃议题',
      value: String(dashboard.value.stats.activeIssues),
      note: '仍在推进中的判断对象',
      tone: 'accent',
      icon: Target,
    },
    {
      label: '待审阅决策卡',
      value: String(dashboard.value.stats.pendingDecisionCards),
      note: '需要管理层尽快做出判断',
      tone: 'warning',
      icon: AlertTriangle,
    },
    {
      label: '行动完成率',
      value: `${dashboard.value.actionProgress.percent}%`,
      note: `${dashboard.value.actionProgress.completed}/${dashboard.value.actionProgress.total} 个动作已闭环`,
      tone: 'success',
      icon: CheckCircle2,
    },
    {
      label: '逾期行动项',
      value: String(dashboard.value.stats.overdueActions),
      note: '需要重新校正执行节奏',
      tone: 'danger',
      icon: Clock,
    },
  ]
})

const signalFeed = computed(() =>
  (dashboard.value?.recentEvidence ?? []).map((item) => ({
    ...item,
    label:
      item.type === 'evidence' ? 'Evidence update' : item.type === 'decision' ? 'Decision update' : 'Action update',
    link: item.type === 'evidence' ? '/evidence' : '/issues',
  })),
)

const actionHealth = computed(() => {
  if (!dashboard.value) {
    return []
  }

  return [
    {
      label: '待决策项目',
      value: String(dashboard.value.stats.pendingDecisionCards),
      note: '当前需要拉回管理层判断',
    },
    {
      label: '已完成动作',
      value: String(dashboard.value.stats.completedActions),
      note: '已经进入闭环验证的执行项',
    },
    {
      label: '总动作数',
      value: String(dashboard.value.stats.totalActions),
      note: '纳入当前决策系统跟踪',
    },
  ]
})

onMounted(async () => {
  try {
    dashboard.value = await api.getDashboard()
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '加载失败'
  }
})
</script>

<template>
  <section class="page dashboard-page">
    <p v-if="errorMessage" class="error-banner">{{ errorMessage }}</p>

    <template v-else-if="dashboard">
      <section v-if="primaryDecision && primaryDecisionStatus" class="workspace-hero workspace-hero--split dashboard-hero">
        <div class="workspace-hero__main">
          <p class="eyebrow">Executive priority</p>
          <div class="workspace-hero__headline">
            <h1>现在最需要关注的判断</h1>
            <p class="workspace-summary">
              当前最值得优先处理的是"{{ primaryDecision.issueTitle }}"。先围绕关键体验问题完成验证，再决定资源投入节奏。
            </p>
          </div>

          <div class="workspace-pill-row">
            <span class="status-pill" :data-tone="primaryDecisionStatus.tone">{{ primaryDecisionStatus.label }}</span>
            <span class="meta-pill">
              <BarChart3 :size="12" />
              置信度 {{ primaryDecision.confidenceScore }}%
            </span>
            <span class="meta-pill">{{ dashboard.stats.pendingDecisionCards }} 个判断等待推进</span>
          </div>

          <div class="dashboard-hero__narrative workspace-card workspace-card--accent">
            <p class="workspace-label">Current recommendation</p>
            <h3>{{ primaryDecision.issueTitle }}</h3>
            <p class="workspace-copy">{{ primaryDecision.recommendation }}</p>
          </div>

          <div class="workspace-action-row">
            <RouterLink :to="`/issues/${primaryDecision.issueId}`" class="dashboard-link dashboard-link--primary">
              <ArrowRight :size="16" />
              查看论证链条
            </RouterLink>
            <RouterLink to="/evidence" class="dashboard-link">
              <Activity :size="16" />
              查看最新证据动态
            </RouterLink>
          </div>
        </div>

        <aside class="workspace-priority dashboard-priority">
          <div class="workspace-priority__label">
            <TrendingUp :size="14" />
            Executive summary
          </div>
          <h3>这一轮应该先判断是否继续加速处理</h3>
          <p>
            当前重点不是平均浏览全部指标，而是确认这张决策卡是否足够支撑接下来的资源动作。
          </p>

          <div class="dashboard-priority__grid">
            <article class="workspace-card workspace-card--warning">
              <p class="workspace-label">判断压力</p>
              <strong>{{ dashboard.stats.pendingDecisionCards }}</strong>
              <p>个待审阅决策卡正在靠近判断点。</p>
            </article>
            <article class="workspace-card workspace-card--success">
              <p class="workspace-label">执行闭环</p>
              <strong>{{ dashboard.actionProgress.percent }}%</strong>
              <p>动作项已经进入验证的完成比例。</p>
            </article>
          </div>
        </aside>
      </section>

      <section class="workspace-four-column dashboard-metrics">
        <article
          v-for="item in secondaryStats"
          :key="item.label"
          class="workspace-metric"
          :class="`workspace-metric--${item.tone}`"
        >
          <div class="dashboard-metric-header">
            <span class="workspace-label">{{ item.label }}</span>
            <component :is="item.icon" :size="18" class="dashboard-metric-icon" />
          </div>
          <strong>{{ item.value }}</strong>
          <small>{{ item.note }}</small>
        </article>
      </section>

      <section class="workspace-rail-grid dashboard-rail">
        <article class="workspace-section dashboard-section">
          <div class="section-title">
            <div>
              <p class="eyebrow">Signal stream</p>
              <h3>最近证据动态</h3>
            </div>
            <span class="meta-pill">
              <Zap :size="12" />
              持续更新
            </span>
          </div>

          <ul class="stack-list dashboard-feed-list">
            <li v-for="feed in signalFeed" :key="feed.id" class="workspace-feed-item dashboard-feed-item">
              <div class="workspace-feed-item__top">
                <div>
                  <p class="workspace-label">{{ feed.label }}</p>
                  <h3>{{ feed.title }}</h3>
                </div>
                <span class="meta-pill">{{ feed.timestamp }}</span>
              </div>
              <p>{{ feed.subtitle }}</p>
              <RouterLink :to="feed.link" class="dashboard-link">
                <ArrowRight :size="14" />
                继续查看
              </RouterLink>
            </li>
          </ul>
        </article>

        <article class="workspace-section dashboard-section dashboard-section--compact">
          <div class="section-title">
            <div>
              <p class="eyebrow">Decision health</p>
              <h3>执行与决策健康度</h3>
            </div>
          </div>

          <div class="dashboard-progress">
            <div class="dashboard-progress__top">
              <strong>行动闭环进度</strong>
              <span>{{ dashboard.actionProgress.completed }}/{{ dashboard.actionProgress.total }}</span>
            </div>
            <div class="dashboard-progress__bar">
              <span :style="{ width: `${dashboard.actionProgress.percent}%` }" />
            </div>
          </div>

          <div class="dashboard-health-list">
            <div v-for="item in actionHealth" :key="item.label" class="dashboard-health-item">
              <div>
                <span>{{ item.label }}</span>
                <p>{{ item.note }}</p>
              </div>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </article>
      </section>
    </template>

    <p v-else class="empty-state surface surface--ghost">加载中...</p>
  </section>
</template>

<style scoped lang="less">
.dashboard-page {
  gap: 28px;
}

.dashboard-metric-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.dashboard-metric-icon {
  color: var(--text-muted);
  opacity: 0.6;
}

.dashboard-priority__grid {
  display: grid;
  gap: 14px;
}

.dashboard-priority__grid .workspace-card {
  padding: 18px;
}

.dashboard-priority__grid strong {
  font-size: 2rem;
  line-height: 1;
}

.dashboard-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: fit-content;
  min-height: 40px;
  padding: 0 18px;
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  background: var(--bg-panel-strong);
  color: var(--text);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  transition: background var(--duration-fast) var(--ease-out),
              border-color var(--duration-fast) var(--ease-out);
}

.dashboard-link:hover {
  border-color: var(--border-accent);
  background: var(--accent-soft);
}

.dashboard-link--primary {
  border-color: var(--border-accent);
  background: var(--accent-soft);
  color: var(--accent);
}

.dashboard-link--primary:hover {
  background: rgba(55, 92, 210, 0.14);
}

.dashboard-section {
  padding: 24px;
}

.dashboard-feed-list {
  gap: 14px;
}

.dashboard-feed-item {
  padding: 20px;
  background: var(--bg-panel-strong);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.dashboard-feed-item h3 {
  font-size: 1.1rem;
}

.dashboard-section--compact {
  align-self: start;
}

.dashboard-progress {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 18px;
  border: 1px solid var(--border-accent);
  border-radius: var(--radius-lg);
  background: var(--accent-soft);
}

.dashboard-progress__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.dashboard-progress__bar {
  overflow: hidden;
  height: 10px;
  border-radius: var(--radius-pill);
  background: rgba(55, 92, 210, 0.1);
}

.dashboard-progress__bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent), var(--success));
}

.dashboard-health-list {
  display: grid;
  gap: 14px;
}

.dashboard-health-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
}

.dashboard-health-item:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.dashboard-health-item span {
  display: block;
  margin-bottom: 6px;
  color: var(--text);
  font-weight: 600;
}

.dashboard-health-item p {
  color: var(--text-muted);
}

.dashboard-health-item strong {
  font-size: 1.5rem;
  line-height: 1;
}

@media (max-width: 1120px) {
  .dashboard-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .dashboard-section,
  .dashboard-hero__narrative {
    padding: 20px;
  }

  .dashboard-metrics {
    grid-template-columns: 1fr;
  }
}
</style>
