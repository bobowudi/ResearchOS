// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'
import AppShell from './AppShell.vue'

function createTestRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div>dashboard content</div>' } },
      { path: '/issues', component: { template: '<div>issues content</div>' } },
      { path: '/issues/:id', component: { template: '<div>issue detail content</div>' } },
      { path: '/evidence', component: { template: '<div>evidence content</div>' } },
    ],
  })
}

async function mountShellAt(path: string) {
  const router = createTestRouter()
  await router.push(path)
  await router.isReady()

  const wrapper = mount(AppShell, {
    global: {
      plugins: [router],
    },
  })

  await flushPromises()
  await flushPromises()

  return wrapper
}

describe('AppShell', () => {
  it('keeps the dashboard route focused on page-owned framing', async () => {
    const wrapper = await mountShellAt('/')

    expect(wrapper.find('.shell__topbar').exists()).toBe(false)
    expect(wrapper.find('.shell-header').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Executive overview')
    expect(wrapper.text()).not.toContain('用证据把决策优先级排清楚')
    expect(wrapper.text()).not.toContain('Priority before volume')
    expect(wrapper.find('.nav-link.active').attributes('aria-current')).toBe('page')
    expect(wrapper.find('.nav-link.active').text()).toContain('仪表盘')
    expect(wrapper.text()).toContain('dashboard content')
  })

  it('renders the issue workspace context for the issue list route', async () => {
    const wrapper = await mountShellAt('/issues')

    expect(wrapper.find('.shell__topbar').exists()).toBe(true)
    expect(wrapper.text()).toContain('Issue workspace')
    expect(wrapper.text()).toContain('在一个工作台里推进关键议题')
    expect(wrapper.text()).toContain('Workflow view')
    expect(wrapper.text()).toContain('Scan by priority')
    expect(wrapper.find('.nav-link.active').attributes('aria-current')).toBe('page')
    expect(wrapper.find('.nav-link.active').text()).toContain('议题工作台')
    expect(wrapper.text()).toContain('issues content')
  })

  it('switches to the issue room context for issue detail routes', async () => {
    const wrapper = await mountShellAt('/issues/issue-q3-nps')

    expect(wrapper.find('.shell__topbar').exists()).toBe(true)
    expect(wrapper.text()).toContain('Issue room')
    expect(wrapper.text()).toContain('论证链条与执行闭环')
    expect(wrapper.text()).toContain('Decision room')
    expect(wrapper.text()).toContain('Problem → Evidence')
    expect(wrapper.find('.nav-link.active').attributes('aria-current')).toBe('page')
    expect(wrapper.find('.nav-link.active').text()).toContain('议题工作台')
    expect(wrapper.text()).toContain('issue detail content')
  })

  it('switches to the evidence context for evidence routes', async () => {
    const wrapper = await mountShellAt('/evidence')

    expect(wrapper.find('.shell__topbar').exists()).toBe(true)
    expect(wrapper.text()).toContain('Evidence intelligence')
    expect(wrapper.text()).toContain('持续吸收高价值研究信号')
    expect(wrapper.text()).toContain('Signal board')
    expect(wrapper.find('.nav-link.active').attributes('aria-current')).toBe('page')
    expect(wrapper.find('.nav-link.active').text()).toContain('证据库')
    expect(wrapper.text()).toContain('evidence content')
  })
})

