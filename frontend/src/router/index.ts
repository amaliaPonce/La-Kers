import { createRouter, createWebHistory } from 'vue-router';

const LandingView = () => import('../views/LandingView.vue');
const DemoView = () => import('../views/DemoView.vue');
const SignInView = () => import('../views/LoginView.vue');
const SignUpView = () => import('../views/RegisterView.vue');
const DashboardView = () => import('../views/DashboardView.vue');
const ApartmentsView = () => import('../views/ApartmentsView.vue');
const TenantsView = () => import('../views/TenantsView.vue');
const PaymentsView = () => import('../views/PaymentsView.vue');
const IncidentsView = () => import('../views/IncidentsView.vue');
const DocumentsView = () => import('../views/DocumentsView.vue');
const BillingView = () => import('../views/BillingView.vue');
const CommunicationsView = () => import('../views/CommunicationsView.vue');
const TenantPortalView = () => import('../views/TenantPortalView.vue');
const TenantLoginView = () => import('../views/TenantLoginView.vue');
const TenantRegisterView = () => import('../views/TenantRegisterView.vue');

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'Landing', component: LandingView, meta: { public: true, hideNavbar: true } },
    { path: '/demo', name: 'Demo', component: DemoView, meta: { public: true, hideNavbar: true } },
    { path: '/login', redirect: '/sign-in' },
    { path: '/login/:pathMatch(.*)*', redirect: (to) => ({ path: `/sign-in/${String(to.params.pathMatch ?? '')}`.replace(/\/$/, '') }) },
    { path: '/register', redirect: '/sign-up' },
    { path: '/register/:pathMatch(.*)*', redirect: (to) => ({ path: `/sign-up/${String(to.params.pathMatch ?? '')}`.replace(/\/$/, '') }) },
    { path: '/sign-in', component: SignInView, meta: { public: true, hideNavbar: true } },
    { path: '/sign-in/:pathMatch(.*)*', name: 'SignIn', component: SignInView, meta: { public: true, hideNavbar: true } },
    { path: '/sign-up', component: SignUpView, meta: { public: true, hideNavbar: true } },
    { path: '/sign-up/:pathMatch(.*)*', name: 'SignUp', component: SignUpView, meta: { public: true, hideNavbar: true } },
    { path: '/tenant/sign-in', name: 'TenantSignIn', component: TenantLoginView, meta: { public: true, hideNavbar: true, tenantPortal: true } },
    { path: '/tenant/sign-up', name: 'TenantSignUp', component: TenantRegisterView, meta: { public: true, hideNavbar: true, tenantPortal: true } },
    { path: '/billing', name: 'Billing', component: BillingView },
    { path: '/founder-dashboard', redirect: '/dashboard' },
    { path: '/dashboard', name: 'Dashboard', component: DashboardView, meta: { onboardingRoute: 'dashboard' } },
    { path: '/apartments', name: 'Apartments', component: ApartmentsView, meta: { onboardingRoute: 'apartments' } },
    { path: '/tenants', name: 'Tenants', component: TenantsView, meta: { onboardingRoute: 'tenants' } },
    { path: '/payments', name: 'Payments', component: PaymentsView, meta: { onboardingRoute: 'payments' } },
    { path: '/incidents', name: 'Incidents', component: IncidentsView },
    { path: '/documents', name: 'Documents', component: DocumentsView },
    { path: '/communications', name: 'Communications', component: CommunicationsView },
    { path: '/tenant', name: 'TenantPortal', component: TenantPortalView, meta: { tenantPortal: true } }
  ]
});

export default router;
