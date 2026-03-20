<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../../../shared/api/client'
import {
  formatDateTime,
  getActionStatusMeta,
  getDecisionStatusMeta,
  getEvidenceSourceMeta,
  getEvidenceStanceMeta,
  getIssueStatusMeta,
  getReviewAssessmentMeta,
} from '../../../shared/presentation/formatters'
import { createRequestSequence } from '../lib/request-sequence'
import type { ActionItem, DecisionCard, Evidence, Issue, ReviewResult } from '@research-os/domain'
import {
  FileText,
  Search,
  Scale,
  PlayCircle,
  RotateCcw,
  AlertTriangle,
  Eye,
  ShieldAlert,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
} from 'lucide-vue-next'

const route = useRoute()
const requestSequence = createRequestSequence()
const issue = ref<Issue | null>(null)
const evidence = ref<Evidence[]>([])
const decision = ref<DecisionCard | null>(null)
const actions = ref<ActionItem[]>([])
const reviews = ref<ReviewResult[]>([])
const errorMessage = ref('')

const linkedReviews = computed(() =>
  reviews.value.filter((review) => actions.value.some((action) => action.id === review.actionItemId)),
)

const evidenceBreakdown = computed(() =>
  evidence.value.reduce(
    (summary, item) => {
      summary.total += 1
      summary.avgConfidence += item.confidence
      summary[item.stance] += 1
      return summary
    },
    { total: 0, pro: 0, con: 0, neutral: 0, avgConfidence: 0 },
  ),
)

const averageEvidenceConfidence = computed(() => {
  if (evidenceBreakdown.value.total === 0) {
    return 0
  }

  return Math.round(evidenceBreakdown.value.avgConfidence / evidenceBreakdown.value.total)
})

const completedActions = computed(
  () => actions.value.filter((item) => item.status === 'done' || item.status === 'verified').length,
)

const actionCompletionPercent = computed(() => {
  if (actions.value.length === 0) {
    return 0
  }

  return Math.round((completedActions.value / actions.value.length) * 100)
})

const orderedEvidence = computed(() =>
  [...evidence.value].sort((left, right) => {
    if (left.confidence !== right.confidence) {
      return right.confidence - left.confidence
    }

    return new Date(right.freshnessAt).getTime() - new Date(left.freshnessAt).getTime()
  }),
)

const spotlightEvidence = computed(() => orderedEvidence.value[0] ?? null)
const remainingEvidence = computed(() => orderedEvidence.value.slice(1))
const currentIssueStatus = computed(() => (issue.value ? getIssueStatusMeta(issue.value.status) : null))
const currentDecisionStatus = computed(() => (decision.value ? getDecisionStatusMeta(decision.value.status) : null))

function resetIssueDetailState() {
  issue.value = null
  evidence.value = []
  decision.value = null
  actions.value = []
  reviews.value = []
}

async function loadIssue(id: string) {
  const requestId = requestSequence.next()

  errorMessage.value = ''
  resetIssueDetailState()

  try {
    const response = await api.getIssueDetail(id)

    if (!requestSequence.isCurrent(requestId)) {
      return
    }

    issue.value = response.issue
    evidence.value = response.evidence
    decision.value = response.decision
    actions.value = response.actions
    reviews.value = response.reviews
  } catch (error) {
    if (!requestSequence.isCurrent(requestId)) {
      return
    }

    errorMessage.value = error instanceof Error ? error.message : '加载失败'
  }
}

watch(
  () => String(route.params.id),
  (id) => {
    void loadIssue(id)
  },
  { immediate: true },
)
</script>

<template>
  <section class="page issue-room-page">
    <template v-if="issue && currentIssueStatus">
      <section class="workspace-hero workspace-hero--split issue-room-hero">
        <div class="workspace-hero__main">
          <p class="eyebrow">
            <FileText :size="14" class="icon icon--sm" />
            Issue room
          </p>
          <div class="workspace-hero__headline">
            <h1>{{ issue.title }}</h1>
            <p class="workspace-summary">{{ issue.description }}</p>
          </div>

          <div class="workspace-pill-row">
            <span class="status-pill" :data-tone="currentIssueStatus.tone">{{ currentIssueStatus.label }}</span>
            <span class="meta-pill">{{ issue.domain }}</span>
            <span class="meta-pill">负责人 {{ issue.ownerName }}</span>
            <span class="meta-pill">决策截止 {{ formatDateTime(issue.decisionDueAt) }}</span>
          </div>

          <div class="workspace-card workspace-card--accent issue-room-recommendation">
            <p class="workspace-label">Decision path</p>
            <h3>问题 → 证据 → 决策 → 行动 → 回看</h3>
            <p class="workspace-copy">
              {{
                decision
                  ? `当前建议是"${decision.recommendation}"，先核对支持与反对证据，再确认动作闭环是否足够支撑判断。`
                  : '当前先确认问题背景和证据完整度，再补齐决策卡与后续动作。'
              }}
            </p>
          </div>
        </div>

        <aside class="workspace-priority issue-room-priority">
          <div class="workspace-priority__label">Executive summary</div>
          <h3>先判断这条论证链条是否足够支持下一步资源动作</h3>
          <p>
            这里不是平铺所有信息，而是先看问题背景、证据质量、建议强度，以及动作是否已经形成闭环。
          </p>

          <div class="issue-room-priority__grid">
            <article class="workspace-card workspace-card--warning">
              <p class="workspace-label">证据密度</p>
              <strong>{{ evidenceBreakdown.total }}</strong>
              <p>条证据已进入当前论证链。</p>
            </article>
            <article class="workspace-card workspace-card--success">
              <p class="workspace-label">执行闭环</p>
              <strong>{{ actionCompletionPercent }}%</strong>
              <p>{{ completedActions }}/{{ actions.length }} 个动作已完成或验证。</p>
            </article>
          </div>
        </aside>
      </section>

      <section class="workspace-four-column issue-room-metrics">
        <article class="workspace-metric workspace-metric--accent">
          <span class="workspace-label">支持证据</span>
          <strong>{{ evidenceBreakdown.pro }}</strong>
          <small>反对 {{ evidenceBreakdown.con }} · 中性 {{ evidenceBreakdown.neutral }}</small>
        </article>
        <article class="workspace-metric workspace-metric--warning">
          <span class="workspace-label">平均置信度</span>
          <strong>{{ averageEvidenceConfidence }}%</strong>
          <small>衡量当前证据整体可靠性</small>
        </article>
        <article class="workspace-metric workspace-metric--success">
          <span class="workspace-label">行动进度</span>
          <strong>{{ completedActions }}/{{ actions.length }}</strong>
          <small>已完成或已验证</small>
        </article>
        <article class="workspace-metric workspace-metric--danger">
          <span class="workspace-label">回看记录</span>
          <strong>{{ linkedReviews.length }}</strong>
          <small>已形成执行效果验证</small>
        </article>
      </section>

      <section class="issue-room-flow">
        <!-- Problem Section -->
        <article data-testid="issue-flow-section-problem" data-flow="problem" class="workspace-section issue-flow-section">
          <div class="section-title">
            <div class="issue-flow-section__title">
              <div class="issue-flow-icon issue-flow-icon--problem">
                <FileText :size="18" />
              </div>
              <div>
                <p class="eyebrow">Problem</p>
                <h3>这个议题为什么重要</h3>
              </div>
            </div>
            <span class="status-pill" :data-tone="currentIssueStatus.tone">{{ currentIssueStatus.label }}</span>
          </div>

          <div class="issue-problem-grid">
            <section class="workspace-card issue-summary-card">
              <p class="workspace-label">Issue brief</p>
              <h4>{{ issue.title }}</h4>
              <p>{{ issue.description }}</p>
            </section>

            <dl class="issue-facts-grid">
              <div>
                <dt>领域</dt>
                <dd>{{ issue.domain }}</dd>
              </div>
              <div>
                <dt>负责人</dt>
                <dd>{{ issue.ownerName }}</dd>
              </div>
              <div>
                <dt>决策截止</dt>
                <dd>{{ formatDateTime(issue.decisionDueAt) }}</dd>
              </div>
              <div>
                <dt>创建时间</dt>
                <dd>{{ formatDateTime(issue.createdAt) }}</dd>
              </div>
              <div>
                <dt>最近更新</dt>
                <dd>{{ formatDateTime(issue.updatedAt) }}</dd>
              </div>
            </dl>
          </div>
        </article>

        <!-- Evidence Section -->
        <article data-testid="issue-flow-section-evidence" data-flow="evidence" class="workspace-section issue-flow-section">
          <div class="section-title">
            <div class="issue-flow-section__title">
              <div class="issue-flow-icon issue-flow-icon--evidence">
                <Search :size="18" />
              </div>
              <div>
                <p class="eyebrow">Evidence</p>
                <h3>现有证据支持什么结论</h3>
              </div>
            </div>
            <span class="meta-pill">平均置信度 {{ averageEvidenceConfidence }}%</span>
          </div>

          <div class="issue-evidence-layout">
            <section v-if="spotlightEvidence" class="workspace-card workspace-card--accent issue-spotlight-card">
              <p class="workspace-label">Lead evidence</p>
              <h4>{{ spotlightEvidence.sourceLabel }}</h4>
              <p class="issue-spotlight-card__summary">{{ spotlightEvidence.summary }}</p>
              <p class="issue-spotlight-card__content">{{ spotlightEvidence.content }}</p>
              <div class="badge-group">
                <span class="badge" :data-tone="getEvidenceSourceMeta(spotlightEvidence.sourceType).tone">
                  {{ getEvidenceSourceMeta(spotlightEvidence.sourceType).label }}
                </span>
                <span class="badge" :data-tone="getEvidenceStanceMeta(spotlightEvidence.stance).tone">
                  {{ getEvidenceStanceMeta(spotlightEvidence.stance).label }}
                </span>
              </div>
            </section>
            <section v-else class="workspace-card issue-empty-card">
              <p class="workspace-label">Lead evidence</p>
              <h4>暂无证据</h4>
              <p>当前还没有可用于支撑判断的证据，需要先补充研究输入。</p>
            </section>

            <div class="issue-evidence-list">
              <article v-for="item in remainingEvidence" :key="item.id" class="issue-evidence-item">
                <div class="issue-evidence-item__top">
                  <div>
                    <p class="card-kicker">{{ item.sourceRef }}</p>
                    <h4>{{ item.sourceLabel }}</h4>
                  </div>
                  <strong>{{ item.confidence }}%</strong>
                </div>
                <p>{{ item.summary }}</p>
                <div class="badge-group">
                  <span class="badge" :data-tone="getEvidenceSourceMeta(item.sourceType).tone">{{ getEvidenceSourceMeta(item.sourceType).label }}</span>
                  <span class="badge" :data-tone="getEvidenceStanceMeta(item.stance).tone">{{ getEvidenceStanceMeta(item.stance).label }}</span>
                </div>
                <small class="muted">{{ formatDateTime(item.freshnessAt) }} · {{ item.citation }}</small>
              </article>
            </div>
          </div>
        </article>

        <!-- Decision Section -->
        <article data-testid="issue-flow-section-decision" data-flow="decision" class="workspace-section issue-flow-section">
          <div class="section-title">
            <div class="issue-flow-section__title">
              <div class="issue-flow-icon issue-flow-icon--decision">
                <Scale :size="18" />
              </div>
              <div>
                <p class="eyebrow">Decision</p>
                <h3>当前建议是什么</h3>
              </div>
            </div>
            <span v-if="currentDecisionStatus" class="status-pill" :data-tone="currentDecisionStatus.tone">
              {{ currentDecisionStatus.label }}
            </span>
            <span v-else class="meta-pill">待生成决策卡</span>
          </div>

          <template v-if="decision">
            <section class="workspace-card workspace-card--accent issue-decision-card">
              <p class="workspace-label">Recommendation</p>
              <h4>{{ decision.recommendation }}</h4>
              <p class="workspace-copy">置信度 {{ decision.confidenceScore }}% · {{ decision.confidenceReason }}</p>
            </section>

            <div class="issue-decision-columns">
              <section class="workspace-card issue-decision-column issue-decision-column--pro">
                <p class="workspace-label">
                  <CheckCircle2 :size="14" />
                  支持判断
                </p>
                <ul class="stack-list issue-point-list">
                  <li v-for="item in decision.proEvidence" :key="item.evidenceId" class="issue-point-item">
                    <strong>{{ item.argument }}</strong>
                    <small>强度 {{ item.strength }}</small>
                  </li>
                </ul>
              </section>

              <section class="workspace-card issue-decision-column issue-decision-column--con">
                <p class="workspace-label">
                  <AlertTriangle :size="14" />
                  保留意见
                </p>
                <ul class="stack-list issue-point-list">
                  <li v-for="item in decision.conEvidence" :key="item.evidenceId" class="issue-point-item">
                    <strong>{{ item.argument }}</strong>
                    <small>强度 {{ item.strength }}</small>
                  </li>
                </ul>
              </section>
            </div>

            <div class="issue-decision-notes">
              <section class="workspace-card" v-if="decision.conflicts.length > 0">
                <p class="workspace-label">
                  <AlertTriangle :size="14" />
                  冲突点
                </p>
                <ul class="stack-list issue-note-list">
                  <li v-for="conflict in decision.conflicts" :key="conflict.description">
                    <strong>{{ conflict.description }}</strong>
                    <p>{{ conflict.interpretation }}</p>
                  </li>
                </ul>
              </section>

              <section class="workspace-card" v-if="decision.blindSpots.length > 0">
                <p class="workspace-label">
                  <Eye :size="14" />
                  信息盲区
                </p>
                <ul class="stack-list issue-note-list">
                  <li v-for="blindSpot in decision.blindSpots" :key="blindSpot.description">
                    <strong>{{ blindSpot.description }}</strong>
                    <p>优先级 {{ blindSpot.importance }}</p>
                  </li>
                </ul>
              </section>

              <section class="workspace-card" v-if="decision.assumptions.length > 0">
                <p class="workspace-label">
                  <Lightbulb :size="14" />
                  关键假设
                </p>
                <ul class="stack-list issue-note-list">
                  <li v-for="assumption in decision.assumptions" :key="assumption">
                    <strong>{{ assumption }}</strong>
                  </li>
                </ul>
              </section>

              <section class="workspace-card" v-if="decision.failureWarnings.length > 0">
                <p class="workspace-label">
                  <ShieldAlert :size="14" />
                  失败预警
                </p>
                <ul class="stack-list issue-note-list">
                  <li v-for="warning in decision.failureWarnings" :key="warning">
                    <strong>{{ warning }}</strong>
                  </li>
                </ul>
              </section>
            </div>
          </template>

          <section v-else class="workspace-card issue-empty-card">
            <p class="workspace-label">Recommendation</p>
            <h4>尚未形成决策卡</h4>
            <p>现阶段仍需继续补齐证据或完成分析，才能生成可供判断的建议。</p>
          </section>
        </article>

        <!-- Action Section -->
        <article data-testid="issue-flow-section-action" data-flow="action" class="workspace-section issue-flow-section">
          <div class="section-title">
            <div class="issue-flow-section__title">
              <div class="issue-flow-icon issue-flow-icon--action">
                <PlayCircle :size="18" />
              </div>
              <div>
                <p class="eyebrow">Action</p>
                <h3>后续动作如何推进</h3>
              </div>
            </div>
            <span class="meta-pill">完成度 {{ actionCompletionPercent }}%</span>
          </div>

          <div class="issue-progress-card">
            <div class="issue-progress-card__top">
              <strong>行动闭环进度</strong>
              <span>{{ completedActions }}/{{ actions.length }}</span>
            </div>
            <div class="issue-progress-card__bar">
              <span :style="{ width: `${actionCompletionPercent}%` }" />
            </div>
          </div>

          <ul v-if="actions.length > 0" class="stack-list issue-action-list">
            <li v-for="item in actions" :key="item.id" class="workspace-feed-item issue-action-item">
              <div class="workspace-feed-item__top">
                <div>
                  <p class="workspace-label">{{ item.ownerName }}</p>
                  <h4>{{ item.title }}</h4>
                </div>
                <span class="badge" :data-tone="getActionStatusMeta(item.status).tone">{{ getActionStatusMeta(item.status).label }}</span>
              </div>
              <p>{{ item.description }}</p>
              <div class="issue-action-item__meta">
                <span class="meta-pill">截止 {{ formatDateTime(item.dueAt) }}</span>
                <span class="meta-pill">{{ item.expectedMetric }}</span>
              </div>
            </li>
          </ul>
          <section v-else class="workspace-card issue-empty-card">
            <p class="workspace-label">Action plan</p>
            <h4>暂无动作项</h4>
            <p>当前还没有把建议拆解成可执行动作，需要补充执行安排。</p>
          </section>
        </article>

        <!-- Review Section -->
        <article data-testid="issue-flow-section-review" data-flow="review" class="workspace-section issue-flow-section">
          <div class="section-title">
            <div class="issue-flow-section__title">
              <div class="issue-flow-icon issue-flow-icon--review">
                <RotateCcw :size="18" />
              </div>
              <div>
                <p class="eyebrow">Review</p>
                <h3>回看结果如何</h3>
              </div>
            </div>
            <span class="meta-pill">共 {{ linkedReviews.length }} 条回看</span>
          </div>

          <ul v-if="linkedReviews.length > 0" class="stack-list issue-review-list">
            <li v-for="review in linkedReviews" :key="review.id" class="workspace-feed-item issue-review-item">
              <div class="workspace-feed-item__top">
                <div>
                  <p class="workspace-label">{{ getReviewAssessmentMeta(review.assessment).label }}</p>
                  <h4>{{ review.delta }}</h4>
                </div>
                <span class="badge" :data-tone="getReviewAssessmentMeta(review.assessment).tone">
                  {{ getReviewAssessmentMeta(review.assessment).label }}
                </span>
              </div>
              <p>{{ review.learnings }}</p>
              <div class="issue-review-item__metrics">
                <span class="meta-pill">{{ review.baselineMetric }}</span>
                <span class="meta-pill">
                  <ArrowRight :size="12" />
                  {{ review.actualMetric }}
                </span>
                <span class="meta-pill">{{ formatDateTime(review.createdAt) }}</span>
              </div>
            </li>
          </ul>
          <section v-else class="workspace-card issue-empty-card">
            <p class="workspace-label">Review status</p>
            <h4>尚未进入回看阶段</h4>
            <p>等动作执行并产生结果后，再回收效果数据验证这次判断是否有效。</p>
          </section>
        </article>
      </section>
    </template>

    <p v-else-if="errorMessage" class="error-banner">{{ errorMessage }}</p>
    <p v-else class="empty-state surface surface--ghost">加载中...</p>
  </section>
</template>

<style scoped lang="less">
.issue-room-page {
  gap: 28px;
}

.issue-room-recommendation {
  padding: 22px;
}

.issue-room-priority__grid {
  display: grid;
  gap: 14px;
}

.issue-room-priority__grid .workspace-card {
  padding: 18px;
}

.issue-room-priority__grid strong {
  font-size: 2rem;
  line-height: 1;
}

.issue-room-flow {
  display: grid;
  gap: 20px;
}

.issue-flow-section {
  padding: 24px;
}

.issue-flow-section__title {
  display: flex;
  align-items: center;
  gap: 14px;
}

.issue-flow-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.issue-flow-icon--problem {
  background: var(--accent-soft);
  color: var(--accent);
}

.issue-flow-icon--evidence {
  background: var(--warning-soft);
  color: #92400e;
}

.issue-flow-icon--decision {
  background: rgba(55, 92, 210, 0.08);
  color: var(--accent-strong);
}

.issue-flow-icon--action {
  background: var(--success-soft);
  color: #047857;
}

.issue-flow-icon--review {
  background: var(--bg-panel-strong);
  color: var(--text-soft);
}

.issue-problem-grid,
.issue-evidence-layout,
.issue-decision-columns,
.issue-decision-notes {
  display: grid;
  gap: 16px;
}

.issue-problem-grid,
.issue-evidence-layout {
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
}

.issue-summary-card,
.issue-spotlight-card,
.issue-empty-card,
.issue-decision-card {
  padding: 22px;
}

.issue-summary-card h4,
.issue-spotlight-card h4,
.issue-empty-card h4,
.issue-decision-card h4,
.issue-evidence-item h4,
.issue-action-item h4,
.issue-review-item h4 {
  margin: 0;
}

.issue-summary-card p,
.issue-spotlight-card p,
.issue-empty-card p,
.issue-decision-card p,
.issue-evidence-item p,
.issue-action-item p,
.issue-review-item p {
  margin: 0;
}

.issue-facts-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.issue-facts-grid div,
.issue-evidence-item,
.issue-point-item,
.issue-progress-card {
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-panel-strong);
}

.issue-facts-grid dt {
  margin-bottom: 8px;
  font-size: 0.76rem;
  color: var(--text-muted);
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.issue-facts-grid dd {
  margin: 0;
  color: var(--text);
  font-weight: 600;
}

.issue-spotlight-card {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.issue-spotlight-card__summary {
  font-size: 1.08rem;
  color: var(--text);
}

.issue-spotlight-card__content {
  color: var(--text-soft);
}

.issue-evidence-list,
.issue-action-list,
.issue-review-list,
.issue-point-list,
.issue-note-list {
  gap: 14px;
}

.issue-evidence-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.issue-evidence-item__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.issue-evidence-item__top strong {
  font-size: 1.5rem;
  line-height: 1;
  color: var(--accent);
}

.issue-decision-columns {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.issue-decision-column {
  border-left: 3px solid transparent;
}

.issue-decision-column--pro {
  border-left-color: var(--success);
}

.issue-decision-column--con {
  border-left-color: var(--danger);
}

.issue-decision-column .workspace-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.issue-decision-notes {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.issue-decision-notes .workspace-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.issue-point-item,
.issue-note-list li {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.issue-point-item strong,
.issue-note-list strong {
  color: var(--text);
}

.issue-point-item small,
.issue-note-list p {
  color: var(--text-muted);
}

.issue-progress-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.issue-progress-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.issue-progress-card__bar {
  overflow: hidden;
  height: 10px;
  border-radius: var(--radius-pill);
  background: rgba(55, 92, 210, 0.08);
}

.issue-progress-card__bar span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--accent), var(--success));
}

.issue-action-item,
.issue-review-item {
  gap: 14px;
  padding: 20px;
  background: var(--bg-panel-strong);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.issue-action-item__meta,
.issue-review-item__metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.issue-review-item__metrics .meta-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

@media (max-width: 1200px) {
  .issue-room-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .issue-problem-grid,
  .issue-evidence-layout,
  .issue-decision-columns,
  .issue-decision-notes {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .issue-flow-section,
  .issue-summary-card,
  .issue-spotlight-card,
  .issue-empty-card,
  .issue-decision-card {
    padding: 20px;
  }

  .issue-room-metrics,
  .issue-facts-grid {
    grid-template-columns: 1fr;
  }

  .issue-evidence-item__top {
    flex-direction: column;
  }
}
</style>
