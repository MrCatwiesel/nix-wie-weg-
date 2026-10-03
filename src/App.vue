<script setup lang="ts">
import { getNavItems } from '@/core/registry'
import { useOnline } from '@/core/composables'

const navItems = getNavItems()
const online = useOnline()
</script>

<template>
  <header class="navbar navbar-expand bg-body border-bottom sticky-top">
    <div class="container">
      <RouterLink to="/" class="navbar-brand fw-semibold d-flex align-items-center gap-2">
        <img src="/icon.svg" alt="" width="28" height="28" />Nix wie weg
      </RouterLink>
      <ul class="navbar-nav ms-auto d-none d-md-flex">
        <li v-for="item in navItems" :key="item.id" class="nav-item">
          <RouterLink :to="item.to" class="nav-link" active-class="active">
            <i :class="`bi bi-${item.icon} me-1`" aria-hidden="true"></i>{{ item.title }}
          </RouterLink>
        </li>
        <li class="nav-item">
          <RouterLink to="/einstellungen" class="nav-link" active-class="active">
            <i class="bi bi-gear me-1" aria-hidden="true"></i>Einstellungen
          </RouterLink>
        </li>
      </ul>
    </div>
  </header>

  <div v-if="!online" class="bg-warning-subtle text-warning-emphasis small text-center py-1">
    <i class="bi bi-wifi-off me-1" aria-hidden="true"></i>Offline – alle Daten bleiben verfügbar.
  </div>

  <main class="container py-3 app-main">
    <RouterView />
  </main>

  <!-- Untere Navigation für das Handy -->
  <nav class="bottom-nav d-md-none border-top bg-body" aria-label="Hauptnavigation">
    <RouterLink v-for="item in navItems" :key="item.id" :to="item.to" active-class="active">
      <i :class="`bi bi-${item.icon}`" aria-hidden="true"></i><span>{{ item.title }}</span>
    </RouterLink>
    <RouterLink to="/einstellungen" active-class="active">
      <i class="bi bi-gear" aria-hidden="true"></i><span>Einstellungen</span>
    </RouterLink>
  </nav>
</template>
