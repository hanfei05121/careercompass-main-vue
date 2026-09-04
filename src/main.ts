import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/stores/auth'
import './styles/globals.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// 在挂载前同步初始化登录态（从 localStorage 恢复），
// 确保路由守卫和首页跳转在首次渲染时就能拿到准确的登录状态。
useAuthStore().initAuth()

app.mount('#app')
