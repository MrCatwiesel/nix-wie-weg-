import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { getModules } from './registry'

/** Baut den Router aus den Routen aller registrierten Module. */
export function buildRouter() {
  const routes: RouteRecordRaw[] = [
    { path: '/', redirect: '/trip' },
    { path: '/einstellungen', name: 'settings', component: () => import('./views/SettingsView.vue') },
    ...getModules().flatMap((m) => m.routes),
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ]
  return createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: () => ({ top: 0 })
  })
}
