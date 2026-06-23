import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import GamePage from '@/pages/GamePage.vue'
import AboutPage from '@/pages/AboutPage.vue'
import NotFoundPage from '@/pages/NotFoundPage.vue'

const routes = [
  { path: '/', component: HomePage, name: 'home' },
  { path: '/games/:gameId', component: GamePage, name: 'game' },
  { path: '/about', component: AboutPage, name: 'about' },
  { path: '/:pathMatch(.*)*', component: NotFoundPage, name: 'not-found' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
