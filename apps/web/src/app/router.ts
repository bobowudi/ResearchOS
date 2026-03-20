import { createRouter, createWebHistory } from 'vue-router'
import DashboardPage from '../features/dashboard/pages/DashboardPage.vue'
import IssuesPage from '../features/issues/pages/IssuesPage.vue'
import IssueDetailPage from '../features/issues/pages/IssueDetailPage.vue'
import EvidencePage from '../features/evidence/pages/EvidencePage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: DashboardPage },
    { path: '/issues', component: IssuesPage },
    { path: '/issues/:id', component: IssueDetailPage },
    { path: '/evidence', component: EvidencePage },
  ],
})
