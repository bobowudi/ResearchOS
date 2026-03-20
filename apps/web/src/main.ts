import { createApp } from 'vue'
import AppShell from './app/AppShell.vue'
import { router } from './app/router'
import './styles/index.less'

createApp(AppShell).use(router).mount('#app')
