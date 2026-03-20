<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { LayoutDashboard, FileSearch, Database, Compass, ArrowRight, Shield, Zap } from 'lucide-vue-next'

const route = useRoute()
const isDashboardRoute = computed(() => route.path === '/')

const navItems = [
  {
    to: '/',
    label: '仪表盘',
    description: '关键判断与风险信号',
    icon: LayoutDashboard,
  },
  {
    to: '/issues',
    label: '议题工作台',
    description: '核心议题与决策进度',
    icon: FileSearch,
  },
  {
    to: '/evidence',
    label: '证据库',
    description: '研究证据与情报线索',
    icon: Database,
  },
]

const shellContext = computed(() => {
  if (route.path.startsWith('/issues/')) {
    return {
      eyebrow: 'Issue room',
      title: '论证链条与执行闭环',
      description: '把问题背景、证据冲突、推荐结论与后续动作放进一条连续的判断路径。',
      badge: 'Decision room',
      cards: [
        {
          title: '当前视角',
          body: '先明确问题为何重要，再快速定位支持与反对证据。',
          note: 'Problem → Evidence',
        },
        {
          title: '工作重点',
          body: '把建议、行动项与回看结果连成闭环，而不是分散浏览。',
          note: 'Decision → Action → Review',
        },
      ],
    }
  }

  if (route.path.startsWith('/issues')) {
    return {
      eyebrow: 'Issue workspace',
      title: '在一个工作台里推进关键议题',
      description: '从状态、负责人到决策时点统一排序，让真正值得推进的问题先浮到前面。',
      badge: 'Workflow view',
      cards: [
        {
          title: '当前视角',
          body: '优先识别接近决策点、等待补证据和需要协调推进的议题。',
          note: 'Scan by priority',
        },
        {
          title: '工作重点',
          body: '用更强的层级表达状态、截止时间与最近更新，而不只是展示列表。',
          note: 'Move from list to workspace',
        },
      ],
    }
  }

  if (route.path.startsWith('/evidence')) {
    return {
      eyebrow: 'Evidence intelligence',
      title: '持续吸收高价值研究信号',
      description: '按来源、立场、摘要和时效组织证据，让用户先判断可信度，再决定是否深读。',
      badge: 'Signal board',
      cards: [
        {
          title: '当前视角',
          body: '先看高置信度来源和新鲜信号，再判断哪些证据值得引用。',
          note: 'Source → Confidence → Summary',
        },
        {
          title: '工作重点',
          body: '提升扫读效率，减少所有字段在同一层争抢注意力。',
          note: 'Faster evidence triage',
        },
      ],
    }
  }

  return {
    eyebrow: 'Executive overview',
    title: '用证据把决策优先级排清楚',
    description: '先看最关键判断，再展开证据动态、执行进度与潜在风险，保持管理层视角始终稳定。',
    badge: 'Executive mode',
    cards: [
      {
        title: '当前视角',
        body: '聚焦最值得立即判断的问题，而不是平均浏览所有指标。',
        note: 'Priority before volume',
      },
      {
        title: '工作重点',
        body: '用证据动态和执行健康度验证当前建议是否需要继续推进。',
        note: 'Signal + execution loop',
      },
    ],
  }
})

function isActive(itemTo: string) {
  return route.path === itemTo || (itemTo !== '/' && route.path.startsWith(itemTo))
}
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="sidebar__top">
        <div class="sidebar__eyebrow">Research decision system</div>

        <section class="brand-block">
          <div class="brand-mark">
            <Compass :size="20" />
          </div>
          <div>
            <h1 class="brand">ResearchOS</h1>
            <p class="brand-subtitle">多源证据驱动的 AI 调研决策系统</p>
          </div>
        </section>
      </div>

      <section class="sidebar__mission">
        <p class="eyebrow">Operating premise</p>
        <strong>让研究信号真正进入决策闭环</strong>
        <p>不是停留在"看过"，而是把问题、证据、建议、执行和回看连在一起。</p>
      </section>

      <section class="sidebar__workflow">
        <div>
          <p class="eyebrow">Decision loop</p>
          <strong>问题 → 证据 → 决策 → 行动 → 回看</strong>
        </div>
        <div class="sidebar__workflow-row">
          <div>
            <div class="sidebar__workflow-index">01 Diagnose</div>
            <small>确认当前最重要的问题</small>
          </div>
          <small>Priority framing</small>
        </div>
        <div class="sidebar__workflow-row">
          <div>
            <div class="sidebar__workflow-index">02 Validate</div>
            <small>用支持与反对证据收敛判断</small>
          </div>
          <small>Evidence review</small>
        </div>
        <div class="sidebar__workflow-row">
          <div>
            <div class="sidebar__workflow-index">03 Close</div>
            <small>把动作结果带回决策系统</small>
          </div>
          <small>Execution feedback</small>
        </div>
      </section>

      <nav class="nav" aria-label="主导航">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="nav-link"
          :class="{ active: isActive(item.to) }"
          :aria-current="isActive(item.to) ? 'page' : undefined"
        >
          <span class="nav-link__icon">
            <component :is="item.icon" :size="18" />
          </span>
          <span class="nav-link__content">
            <strong>{{ item.label }}</strong>
            <span>{{ item.description }}</span>
          </span>
        </RouterLink>
      </nav>

      <section class="sidebar__rail">
        <div class="sidebar__rail-title">
          <div>
            <p class="eyebrow">Workspace posture</p>
            <strong>Analytical workspace</strong>
          </div>
          <span class="meta-pill">
            <Shield :size="12" />
            Active
          </span>
        </div>
        <div class="sidebar__rail-item">
          <div>
            <strong>Evidence-linked</strong>
            <small>所有判断都能回到证据来源。</small>
          </div>
          <small>Traceable</small>
        </div>
        <div class="sidebar__rail-item">
          <div>
            <strong>Decision-oriented</strong>
            <small>优先表达应该判断什么，而不是只展示数据。</small>
          </div>
          <small>Actionable</small>
        </div>
      </section>
    </aside>

    <div class="shell__main" :class="{ 'shell__main--dashboard': isDashboardRoute }">
      <div v-if="!isDashboardRoute" class="shell__topbar">
        <header class="shell-header">
          <div class="shell-header__main">
            <div>
              <p class="eyebrow">{{ shellContext.eyebrow }}</p>
              <h2>{{ shellContext.title }}</h2>
            </div>
            <p class="shell-header__description">{{ shellContext.description }}</p>
          </div>

          <div class="shell-header__meta">
            <div class="shell-header__badges">
              <span class="meta-pill">
                <Zap :size="12" />
                Evidence-informed
              </span>
              <span class="meta-pill">{{ shellContext.badge }}</span>
            </div>
            <div class="shell-header__grid">
              <article v-for="card in shellContext.cards" :key="card.title" class="shell-context-card">
                <strong>{{ card.title }}</strong>
                <p>{{ card.body }}</p>
                <small>
                  <ArrowRight :size="12" class="icon icon--sm" />
                  {{ card.note }}
                </small>
              </article>
            </div>
          </div>
        </header>
      </div>

      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>
