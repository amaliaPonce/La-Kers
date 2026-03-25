import { createRouter, createWebHistory } from 'vue-router';
import LandingView from '../views/LandingView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import DashboardView from '../views/DashboardView.vue';
import ApartmentsView from '../views/ApartmentsView.vue';
import TenantsView from '../views/TenantsView.vue';
import PaymentsView from '../views/PaymentsView.vue';
import IncidentsView from '../views/IncidentsView.vue';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Landing', component: LandingView, meta: { public: true, hideNavbar: true } },
    { path: '/login', name: 'Login', component: LoginView, meta: { public: true, hideNavbar: true } },
    { path: '/register', name: 'Register', component: RegisterView, meta: { public: true, hideNavbar: true } },
    { path: '/dashboard', name: 'Dashboard', component: DashboardView },
    { path: '/apartments', name: 'Apartments', component: ApartmentsView },
    { path: '/tenants', name: 'Tenants', component: TenantsView },
    { path: '/payments', name: 'Payments', component: PaymentsView },
    { path: '/incidents', name: 'Incidents', component: IncidentsView }
  ]
});

router.beforeEach((to) => {
  const publicRoute = to.meta.public;
  const auth = useAuthStore();
  if (!publicRoute && !auth.isAuthenticated) {
    return { path: '/login' };
  }
  if (to.path === '/login' && auth.isAuthenticated) {
    return { path: '/dashboard' };
  }
});

export default router;
