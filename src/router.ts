import { createRouter, createWebHashHistory } from 'vue-router'

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('./views/HomeView.vue') },
    { path: '/p/:code', name: 'passport', component: () => import('./views/PassportView.vue') },
    { path: '/producer', name: 'producer', component: () => import('./views/ProducerView.vue') },
    { path: '/privacy', name: 'privacy', component: () => import('./views/PrivacyView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: (to) => (to.hash ? { el: to.hash, top: 12, behavior: 'smooth' } : { top: 0 }),
})
