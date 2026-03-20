<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '../../../shared/api/client'
import { formatDateTime, getIssueStatusMeta } from '../../../shared/presentation/formatters'
import type { Issue } from '@research-os/domain'
import { AlertCircle, Clock, ListChecks, ArrowUpRight, Users, Calendar } from 'lucide-vue-next'

const issues = ref<Issue[]>([])
const errorMessage = ref('')

const HOUR_IN_MS = 60 * 60 * 1000
const DAY_IN_MS = 24 * HOUR_IN_MS

const statusSummary = computed(() =>
  issues.value.reduce(
    (summary, issue) => {
      summary.total += 1

      if (issue.status === 'analyzing') {
        summary.analyzing += 1
      }

      if (issue.status === 'pending_decision') {
        summary.pendingDecision += 1
      }

      return summary
    },
    { total: 0, analyzing: 0, pendingDecision: 0 },
  ),
)

function getDeadlineMeta(decisionDueAt: string) {
  const diff = new Date(decisionDueAt).getTime() - Date.now()

  if (diff < 0) {
    return {
      priority: 0,
      label: '已逾期',
      tone: 'danger' as const,
    }
  }

  if (diff <= 2 * DAY_IN_MS) {
    return {
      priority: 1,
      label: '48 小时内',
      tone: 'warning' as const,
    }
  }

  if (diff <= 7 * DAY_IN_MS) {
    return {
      priority: 2,
      label: '本周内',
      tone: 'accent' as const,
    }
  }

  return {
    priority: 3,
    label: '本周后',
    tone: 'muted' as const,
  }
}

const workspaceIssues = computed(() =>
  [...issues.value]
    .map((issue) => ({
      issue,
      deadline: getDeadlineMeta(issue.decisionDueAt),
      statusMeta: getIssueStatusMeta(issue.status),
    }))
    .sort((left, right) => {
      if (left.deadline.priority !== right.deadline.priority) {
        return left.deadline.priority - right.deadline.priority
      }

      if (left.issue.status !== right.issue.status) {
        return left.issue.status === 'pending_decision' ? -1 : 1
      }

      return new Date(left.issue.decisionDueAt).getTime() - new Date(right.issue.decisionDueAt).getTime()
    }),
)

const primaryIssue = computed(() => workspaceIssues.value[0] ?? null)
const overdueCount = computed(() => workspaceIssues.value.filter((item) => item.deadline.priority === 0).length)
const dueSoonCount = computed(() => workspaceIssues.value.filter((item) => item.deadline.priority === 1).length)

onMounted(async () => {
  try {
    const response = await api.getIssues()
    issues.value = response.items
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '加载失败'
  }
})
</script>

<template>
  <section class="page issues-workspace-page">
    <header class="page-header issue-list-header">
      <div>
        <p class="eyebrow">
          <ListChecks :size="14" class="icon icon--sm" />
          议题工作台
        </p>
        <h2>当前活跃议题</h2>
        <p class="page-description">按优先级、决策状态与时间窗口排列，先看最需要被判断和推进的问题。</p>
      </div>
      <div class="summary-strip issues-summary-strip">
        <article class="summary-card">
          <span class="summary-label">全部议题</span>
          <strong>{{ statusSummary.total }}</strong>
        </article>
        <article class="summary-card">
          <span class="summary-label">
            <AlertCircle :size="12" />
            优先处理
          </span>
          <strong>{{ overdueCount }}</strong>
          <small class="muted">已逾期的决策窗口</small>
        </article>
        <article class="summary-card">
          <span class="summary-label">
            <Clock :size="12" />
            48 小时内
          </span>
          <strong>{{ dueSoonCount }}</strong>
          <small class="muted">需要尽快完成判断</small>
        </article>
      </div>
    </header>

    <p v-if="errorMessage" class="error-banner">{{ errorMessage }}</p>
    <template v-else>
      <section v-if="primaryIssue" class="issues-priority surface">
        <div>
          <p class="eyebrow">优先处理</p>
          <h3>{{ primaryIssue.issue.title }}</h3>
          <p class="issues-priority__description">{{ primaryIssue.issue.description }}</p>
        </div>
        <div class="issues-priority__meta">
          <span class="badge" :data-tone="primaryIssue.statusMeta.tone">{{ primaryIssue.statusMeta.label }}</span>
          <span class="badge" :data-tone="primaryIssue.deadline.tone">{{ primaryIssue.deadline.label }}</span>
          <span class="meta-pill">
            <Users :size="12" />
            {{ primaryIssue.issue.ownerName }}
          </span>
          <span class="meta-pill">
            <Calendar :size="12" />
            {{ formatDateTime(primaryIssue.issue.decisionDueAt) }}
          </span>
        </div>
      </section>

      <div v-if="workspaceIssues.length > 0" class="issues-workspace surface surface--ghost">
        <header class="issues-workspace__header">
          <div>
            <p class="eyebrow">Scan-first workspace</p>
            <h3>按紧急程度扫描全部议题</h3>
          </div>
          <p class="muted">先看时间窗口，再看状态、负责人和更新时间。</p>
        </header>

        <div class="issues-workspace__list" role="list">
          <RouterLink
            v-for="item in workspaceIssues"
            :key="item.issue.id"
            :to="`/issues/${item.issue.id}`"
            class="issue-workspace-row issue-link"
            role="listitem"
          >
            <div class="issue-workspace-row__priority">
              <span class="summary-label">时间窗口</span>
              <strong>{{ item.deadline.label }}</strong>
            </div>

            <div class="issue-workspace-row__main">
              <div class="issue-workspace-row__heading">
                <p class="card-kicker">{{ item.issue.domain }}</p>
                <h3 data-testid="issue-row-title">{{ item.issue.title }}</h3>
              </div>
              <p class="issue-card-description">{{ item.issue.description }}</p>
            </div>

            <div class="issue-workspace-row__status badge-group">
              <span class="badge" :data-tone="item.statusMeta.tone">{{ item.statusMeta.label }}</span>
              <span class="badge" :data-tone="item.deadline.tone">{{ item.deadline.label }}</span>
            </div>

            <dl class="issue-workspace-row__meta">
              <div>
                <dt>负责人</dt>
                <dd>{{ item.issue.ownerName }}</dd>
              </div>
              <div>
                <dt>决策截止</dt>
                <dd>{{ formatDateTime(item.issue.decisionDueAt) }}</dd>
              </div>
              <div>
                <dt>最近更新</dt>
                <dd>{{ formatDateTime(item.issue.updatedAt) }}</dd>
              </div>
            </dl>

            <div class="issue-workspace-row__arrow">
              <ArrowUpRight :size="18" />
            </div>
          </RouterLink>
        </div>
      </div>

      <p v-else class="empty-state surface surface--ghost">暂无议题</p>
    </template>
  </section>
</template>

<style scoped lang="less">
.issues-workspace-page {
  gap: 20px;
}

.issues-summary-strip {
  align-self: stretch;
}

.issues-summary-strip small {
  color: var(--text-muted);
}

.issues-summary-strip .summary-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.issues-priority,
.issues-workspace {
  padding: 24px;
}

.issues-priority {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.issues-priority h3,
.issues-workspace__header h3,
.issue-workspace-row__main h3 {
  margin: 0;
}

.issues-priority__description,
.issues-workspace__header p {
  margin-top: 12px;
  color: var(--text-soft);
}

.issues-priority__meta {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.issues-workspace {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.issues-workspace__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.issues-workspace__header p,
.issue-workspace-row__main p {
  margin: 0;
}

.issues-workspace__list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.issue-workspace-row {
  display: grid;
  grid-template-columns: minmax(120px, 0.7fr) minmax(0, 1.5fr) auto minmax(320px, 1fr) 32px;
  align-items: start;
  gap: 16px;
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-panel);
  box-shadow: var(--shadow-xs);
  transition: transform var(--duration-fast) var(--ease-out),
              border-color var(--duration-fast) var(--ease-out),
              box-shadow var(--duration-fast) var(--ease-out);
}

.issue-workspace-row:hover {
  transform: translateY(-2px);
  border-color: var(--border-accent);
  box-shadow: var(--shadow-card-hover);
}

.issue-workspace-row__priority,
.issue-workspace-row__main,
.issue-workspace-row__meta {
  min-width: 0;
}

.issue-workspace-row__priority {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.issue-workspace-row__priority strong {
  font-size: 1.2rem;
  line-height: 1.1;
}

.issue-workspace-row__heading {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.issue-workspace-row__status {
  justify-content: flex-start;
}

.issue-workspace-row__meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.issue-workspace-row__meta dt {
  font-size: 0.76rem;
  color: var(--text-muted);
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.issue-workspace-row__meta dd {
  margin: 6px 0 0;
  color: var(--text);
  font-weight: 600;
}

.issue-workspace-row__arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  opacity: 0;
  transition: opacity var(--duration-fast) var(--ease-out);
}

.issue-workspace-row:hover .issue-workspace-row__arrow {
  opacity: 1;
  color: var(--accent);
}

@media (max-width: 1200px) {
  .issue-workspace-row {
    grid-template-columns: minmax(120px, 0.8fr) minmax(0, 1.4fr);
  }

  .issue-workspace-row__status,
  .issue-workspace-row__meta {
    grid-column: span 2;
  }

  .issue-workspace-row__arrow {
    display: none;
  }
}

@media (max-width: 960px) {
  .issues-priority,
  .issues-workspace__header,
  .issue-workspace-row {
    display: flex;
    flex-direction: column;
  }

  .issues-priority__meta {
    justify-content: flex-start;
  }

  .issue-workspace-row__meta {
    grid-template-columns: 1fr;
  }
}
</style>
