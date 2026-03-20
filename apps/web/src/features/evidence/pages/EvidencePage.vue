<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { api } from '../../../shared/api/client'
import { formatDateTime, getEvidenceSourceMeta, getEvidenceStanceMeta } from '../../../shared/presentation/formatters'
import type { Evidence } from '@research-os/domain'
import { BookOpen, TrendingUp, Shield, Clock, ArrowUpRight } from 'lucide-vue-next'

const evidence = ref<Evidence[]>([])
const errorMessage = ref('')

const evidenceSummary = computed(() =>
  evidence.value.reduce(
    (summary, item) => {
      summary.total += 1
      summary.avgConfidence += item.confidence

      if (item.stance === 'pro') {
        summary.pro += 1
      }

      if (item.stance === 'con') {
        summary.con += 1
      }

      return summary
    },
    { total: 0, pro: 0, con: 0, avgConfidence: 0 },
  ),
)

const averageConfidence = computed(() => {
  if (evidenceSummary.value.total === 0) {
    return 0
  }

  return Math.round(evidenceSummary.value.avgConfidence / evidenceSummary.value.total)
})

const orderedEvidence = computed(() =>
  [...evidence.value].sort((left, right) => {
    if (left.confidence !== right.confidence) {
      return right.confidence - left.confidence
    }

    return new Date(right.freshnessAt).getTime() - new Date(left.freshnessAt).getTime()
  }),
)

const leadEvidence = computed(() => orderedEvidence.value[0] ?? null)
const latestEvidence = computed(() =>
  [...evidence.value].sort((left, right) => new Date(right.freshnessAt).getTime() - new Date(left.freshnessAt).getTime())[0] ?? null,
)
const highConfidenceCount = computed(() => orderedEvidence.value.filter((item) => item.confidence >= 80).length)

onMounted(async () => {
  try {
    const response = await api.getEvidence()
    evidence.value = response.items
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '加载失败'
  }
})
</script>

<template>
  <section class="page evidence-intelligence-page">
    <header class="page-header evidence-header">
      <div>
        <p class="eyebrow">
          <BookOpen :size="14" class="icon icon--sm" />
          证据库
        </p>
        <h2>情报面板</h2>
        <p class="page-description">先看最有判断价值的证据，再横向扫描来源、立场、时效性与引用线索。</p>
      </div>
      <div class="summary-strip evidence-summary-strip">
        <article class="summary-card">
          <span class="summary-label">证据总数</span>
          <strong>{{ evidenceSummary.total }}</strong>
        </article>
        <article class="summary-card">
          <span class="summary-label">
            <Shield :size="12" />
            高置信证据
          </span>
          <strong>{{ highConfidenceCount }}</strong>
          <small class="muted">80% 及以上</small>
        </article>
        <article class="summary-card">
          <span class="summary-label">
            <TrendingUp :size="12" />
            平均置信度
          </span>
          <strong>{{ averageConfidence }}%</strong>
          <small class="muted">支持 {{ evidenceSummary.pro }} · 反对 {{ evidenceSummary.con }}</small>
        </article>
      </div>
    </header>

    <p v-if="errorMessage" class="error-banner">{{ errorMessage }}</p>
    <template v-else>
      <section v-if="leadEvidence" class="evidence-hero surface">
        <div class="evidence-hero__main">
          <p class="eyebrow">高置信证据</p>
          <h3>{{ leadEvidence.sourceLabel }}</h3>
          <p class="evidence-hero__summary">{{ leadEvidence.summary }}</p>
          <p class="evidence-hero__content">{{ leadEvidence.content }}</p>
        </div>

        <aside class="evidence-hero__rail">
          <div class="section-title">
            <div>
              <p class="evidence-kicker">
                <Clock :size="12" />
                最新同步
              </p>
              <h3>{{ latestEvidence?.sourceLabel ?? '暂无更新' }}</h3>
            </div>
          </div>
          <p class="muted">{{ latestEvidence ? formatDateTime(latestEvidence.freshnessAt) : '暂无数据' }}</p>
          <div v-if="latestEvidence" class="badge-group">
            <span class="badge" :data-tone="getEvidenceSourceMeta(latestEvidence.sourceType).tone">{{ getEvidenceSourceMeta(latestEvidence.sourceType).label }}</span>
            <span class="badge" :data-tone="getEvidenceStanceMeta(latestEvidence.stance).tone">{{ getEvidenceStanceMeta(latestEvidence.stance).label }}</span>
          </div>
          <p class="evidence-hero__rail-copy">{{ latestEvidence?.summary }}</p>
        </aside>
      </section>

      <section v-if="orderedEvidence.length > 0" class="evidence-stream surface surface--ghost">
        <header class="evidence-stream__header">
          <div>
            <p class="eyebrow">Evidence stream</p>
            <h3>按置信度快速扫描</h3>
          </div>
          <p class="muted">优先阅读高置信信号，再补充较新的低置信线索。</p>
        </header>

        <div class="evidence-stream__list" role="list">
          <article v-for="item in orderedEvidence" :key="item.id" class="evidence-entry" role="listitem">
            <div class="evidence-entry__score">
              <span class="summary-label">置信度</span>
              <strong>{{ item.confidence }}%</strong>
            </div>

            <div class="evidence-entry__main">
              <div class="evidence-entry__heading">
                <p class="card-kicker">{{ item.sourceRef }}</p>
                <h3 data-testid="evidence-entry-title">{{ item.sourceLabel }}</h3>
              </div>
              <p class="evidence-card-summary">{{ item.summary }}</p>
              <p class="evidence-card-content">{{ item.content }}</p>
              <div class="tag-list">
                <span v-for="tag in item.tags" :key="tag" class="tag-chip">{{ tag }}</span>
              </div>
            </div>

            <div class="evidence-entry__signals badge-group">
              <span class="badge" :data-tone="getEvidenceSourceMeta(item.sourceType).tone">{{ getEvidenceSourceMeta(item.sourceType).label }}</span>
              <span class="badge" :data-tone="getEvidenceStanceMeta(item.stance).tone">{{ getEvidenceStanceMeta(item.stance).label }}</span>
            </div>

            <dl class="evidence-entry__meta">
              <div>
                <dt>更新时间</dt>
                <dd>{{ formatDateTime(item.freshnessAt) }}</dd>
              </div>
              <div>
                <dt>引用</dt>
                <dd>{{ item.citation }}</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <p v-else class="empty-state surface surface--ghost">暂无证据</p>
    </template>
  </section>
</template>

<style scoped lang="less">
.evidence-intelligence-page {
  gap: 20px;
}

.evidence-summary-strip {
  align-self: stretch;
}

.evidence-summary-strip small {
  color: var(--text-muted);
}

.evidence-summary-strip .summary-label {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.evidence-hero,
.evidence-stream {
  padding: 24px;
}

.evidence-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.8fr);
  gap: 20px;
}

.evidence-hero__main,
.evidence-hero__rail,
.evidence-stream {
  display: flex;
  flex-direction: column;
}

.evidence-hero__main,
.evidence-stream {
  gap: 16px;
}

.evidence-hero__rail {
  gap: 14px;
  padding: 20px;
  background: var(--bg-panel-strong);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
}

.evidence-hero h3,
.evidence-stream__header h3,
.evidence-entry__main h3 {
  margin: 0;
}

.evidence-hero__summary,
.evidence-hero__content,
.evidence-hero__rail-copy,
.evidence-stream__header p,
.evidence-entry__main p {
  margin: 0;
}

.evidence-hero__summary {
  font-size: 1.15rem;
  color: var(--text);
}

.evidence-hero__content,
.evidence-hero__rail-copy,
.evidence-stream__header p {
  color: var(--text-soft);
}

.evidence-kicker {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  font-size: 0.72rem;
  color: var(--text-muted);
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.evidence-stream {
  gap: 18px;
}

.evidence-stream__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.evidence-stream__list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.evidence-entry {
  display: grid;
  grid-template-columns: minmax(110px, 0.55fr) minmax(0, 1.6fr) auto minmax(240px, 0.9fr);
  gap: 16px;
  align-items: start;
  padding: 18px;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  background: var(--bg-panel);
  box-shadow: var(--shadow-xs);
  transition: transform var(--duration-fast) var(--ease-out),
              border-color var(--duration-fast) var(--ease-out),
              box-shadow var(--duration-fast) var(--ease-out);
}

.evidence-entry:hover {
  transform: translateY(-1px);
  border-color: var(--border-accent);
  box-shadow: var(--shadow-card);
}

.evidence-entry__score,
.evidence-entry__main,
.evidence-entry__meta {
  min-width: 0;
}

.evidence-entry__score {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.evidence-entry__score strong {
  font-size: 1.4rem;
  line-height: 1;
  color: var(--accent);
}

.evidence-entry__heading {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.evidence-entry__signals {
  justify-content: flex-start;
}

.evidence-entry__meta {
  display: grid;
  gap: 12px;
}

.evidence-entry__meta dt {
  font-size: 0.76rem;
  color: var(--text-muted);
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.evidence-entry__meta dd {
  margin: 6px 0 0;
  color: var(--text);
  font-weight: 600;
}

@media (max-width: 1200px) {
  .evidence-entry {
    grid-template-columns: minmax(110px, 0.7fr) minmax(0, 1.4fr);
  }

  .evidence-entry__signals,
  .evidence-entry__meta {
    grid-column: span 2;
  }
}

@media (max-width: 960px) {
  .evidence-hero,
  .evidence-stream__header,
  .evidence-entry {
    display: flex;
    flex-direction: column;
  }
}
</style>
