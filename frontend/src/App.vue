<template>
  <div class="min-h-screen bg-slate-50">
    <header v-if="showHeader" class="bg-white">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-xl font-semibold text-primary">La-Kers</span>
          <span class="text-sm text-slate-500">Admin</span>
        </div>
        <nav v-if="auth.isAuthenticated" class="flex items-center gap-3 text-sm">
          <router-link
            v-for="item in navItems"
            :key="item.path"
            :to="item.path"
            class="px-3 py-2 rounded-md hover:bg-slate-100"
            active-class="bg-slate-200"
          >
            {{ item.label }}
          </router-link>
        </nav>
        <button
          v-if="auth.isAuthenticated"
          class="text-sm text-red-500 hover:underline"
          @click="handleLogout"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
    <main :class="[showHeader ? 'max-w-6xl mx-auto px-4 py-6' : 'px-0 py-0', 'min-h-screen']">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Apartamentos', path: '/apartments' },
  { label: 'Inquilinos', path: '/tenants' },
  { label: 'Pagos', path: '/payments' },
  { label: 'Incidencias', path: '/incidents' }
];

const showHeader = computed(() => !route.meta.hideNavbar);

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};
</script>
