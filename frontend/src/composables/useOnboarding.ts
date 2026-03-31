import { computed, reactive, readonly, watch } from 'vue';

export type OnboardingStepName = 'propertyCreated' | 'tenantAdded' | 'paymentAdded';
export type OnboardingStepStatus = 'pending' | 'active' | 'completed';

type OnboardingRouteName = 'dashboard' | 'apartments' | 'tenants' | 'payments';

type OnboardingSteps = Record<OnboardingStepName, boolean>;

type ChecklistItem = {
  key: OnboardingStepName;
  title: string;
  description: string;
  route: string;
  status: OnboardingStepStatus;
};

type TooltipRouteName = string | null | undefined;

export type OnboardingTooltip = {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaTo: string;
};

type OnboardingState = {
  onboardingStarted: boolean;
  onboardingDismissed: boolean;
  onboardingCompleted: boolean;
  currentStep: OnboardingStepName | null;
  checklistVisible: boolean;
  checklistMinimized: boolean;
  steps: OnboardingSteps;
  dismissedTooltipIds: string[];
};

const STORAGE_KEY = 'la-kers:onboarding:v1';
const STEP_ORDER: OnboardingStepName[] = ['propertyCreated', 'tenantAdded', 'paymentAdded'];

const DEFAULT_STEPS: OnboardingSteps = {
  propertyCreated: false,
  tenantAdded: false,
  paymentAdded: false
};

const DEFAULT_STATE: OnboardingState = {
  onboardingStarted: false,
  onboardingDismissed: false,
  onboardingCompleted: false,
  currentStep: 'propertyCreated',
  checklistVisible: true,
  checklistMinimized: false,
  steps: { ...DEFAULT_STEPS },
  dismissedTooltipIds: []
};

const stepMeta: Record<
  OnboardingStepName,
  { title: string; description: string; route: string }
> = {
  propertyCreated: {
    title: 'Crear propiedad',
    description: 'Añade tu primera unidad para activar la operación.',
    route: '/apartments'
  },
  tenantAdded: {
    title: 'Añadir inquilino',
    description: 'Asigna un contrato real para empezar el flujo de cobro.',
    route: '/tenants'
  },
  paymentAdded: {
    title: 'Registrar primer pago',
    description: 'Confirma un cobro para ver valor financiero en el panel.',
    route: '/payments'
  }
};

const state = reactive<OnboardingState>({ ...DEFAULT_STATE, steps: { ...DEFAULT_STEPS } });

let initialized = false;

const isClient = () => typeof window !== 'undefined';

const cloneDefaultState = (): OnboardingState => ({
  ...DEFAULT_STATE,
  steps: { ...DEFAULT_STEPS },
  dismissedTooltipIds: []
});

const normalizeRouteName = (routeName: TooltipRouteName): OnboardingRouteName | null => {
  if (!routeName) return null;
  const normalized = String(routeName).trim().toLowerCase();
  if (normalized.includes('dashboard')) return 'dashboard';
  if (normalized.includes('apartments')) return 'apartments';
  if (normalized.includes('tenants')) return 'tenants';
  if (normalized.includes('payments')) return 'payments';
  return null;
};

const syncDerivedState = () => {
  const nextStep = STEP_ORDER.find((step) => !state.steps[step]) ?? null;
  state.currentStep = nextStep;
  state.onboardingCompleted = nextStep === null;

  if (state.onboardingCompleted) {
    state.checklistVisible = false;
    state.checklistMinimized = false;
  }
};

const patchState = (payload: Partial<OnboardingState>) => {
  const nextDefaults = cloneDefaultState();
  state.onboardingStarted = payload.onboardingStarted ?? nextDefaults.onboardingStarted;
  state.onboardingDismissed = payload.onboardingDismissed ?? nextDefaults.onboardingDismissed;
  state.onboardingCompleted = payload.onboardingCompleted ?? nextDefaults.onboardingCompleted;
  state.currentStep = payload.currentStep ?? nextDefaults.currentStep;
  state.checklistVisible = payload.checklistVisible ?? nextDefaults.checklistVisible;
  state.checklistMinimized = payload.checklistMinimized ?? nextDefaults.checklistMinimized;
  state.steps = {
    ...nextDefaults.steps,
    ...(payload.steps ?? {})
  };
  state.dismissedTooltipIds = Array.isArray(payload.dismissedTooltipIds)
    ? [...new Set(payload.dismissedTooltipIds)]
    : [];
  syncDerivedState();
};

const loadState = () => {
  if (!isClient()) return;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    patchState(cloneDefaultState());
    return;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<OnboardingState>;
    patchState(parsed);
  } catch {
    patchState(cloneDefaultState());
  }
};

const persistState = () => {
  if (!isClient()) return;

  const payload: OnboardingState = {
    onboardingStarted: state.onboardingStarted,
    onboardingDismissed: state.onboardingDismissed,
    onboardingCompleted: state.onboardingCompleted,
    currentStep: state.currentStep,
    checklistVisible: state.checklistVisible,
    checklistMinimized: state.checklistMinimized,
    steps: { ...state.steps },
    dismissedTooltipIds: [...state.dismissedTooltipIds]
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

const ensureInitialized = () => {
  if (initialized) return;
  initialized = true;
  loadState();
  watch(state, persistState, { deep: true });
};

const buildTooltipMap = (currentStep: OnboardingStepName) =>
  ({
    propertyCreated: {
      dashboard: {
        id: 'dashboard-property-tooltip',
        title: 'Tu dashboard empieza con una propiedad',
        description: 'Crea la primera unidad para activar ocupación, cobros y lectura operativa.',
        ctaLabel: 'Ir a propiedades',
        ctaTo: '/apartments'
      },
      apartments: {
        id: 'apartments-property-tooltip',
        title: 'Crea tu primera propiedad',
        description: 'Empieza con una unidad real o de prueba y deja listo el inventario base.',
        ctaLabel: 'Nueva propiedad',
        ctaTo: '/apartments'
      }
    },
    tenantAdded: {
      dashboard: {
        id: 'dashboard-tenant-tooltip',
        title: 'Siguiente paso: añade un inquilino',
        description: 'Con un contrato activo verás la operación moverse con más contexto.',
        ctaLabel: 'Ir a inquilinos',
        ctaTo: '/tenants'
      },
      tenants: {
        id: 'tenants-tenant-tooltip',
        title: 'Añade tu primer inquilino',
        description: 'Vincúlalo a una propiedad para dejar preparado el flujo de pagos.',
        ctaLabel: 'Crear inquilino',
        ctaTo: '/tenants'
      }
    },
    paymentAdded: {
      dashboard: {
        id: 'dashboard-payment-tooltip',
        title: 'Solo falta registrar el primer pago',
        description: 'Con un cobro confirmado el panel ya mostrará valor financiero real.',
        ctaLabel: 'Ir a pagos',
        ctaTo: '/payments'
      },
      payments: {
        id: 'payments-payment-tooltip',
        title: 'Registra el primer pago',
        description: 'Marca un cobro como recibido para desbloquear el resumen financiero.',
        ctaLabel: 'Abrir pagos',
        ctaTo: '/payments'
      }
    }
  })[currentStep];

export const useOnboarding = () => {
  ensureInitialized();

  const onboardingStarted = computed(() => state.onboardingStarted);
  const onboardingDismissed = computed(() => state.onboardingDismissed);
  const onboardingCompleted = computed(() => state.onboardingCompleted);
  const currentStep = computed(() => state.currentStep);
  const checklistVisible = computed(() => state.checklistVisible);
  const checklistMinimized = computed(() => state.checklistMinimized);
  const steps = computed(() => state.steps);
  const shouldShowWelcomeModal = computed(
    () => !state.onboardingStarted && !state.onboardingDismissed
  );

  const progressPercentage = computed(() => {
    const completedSteps = STEP_ORDER.filter((step) => state.steps[step]).length;
    return Math.round((completedSteps / STEP_ORDER.length) * 100);
  });

  const checklistItems = computed<ChecklistItem[]>(() =>
    STEP_ORDER.map((step) => {
      const status: OnboardingStepStatus = state.steps[step]
        ? 'completed'
        : state.currentStep === step
          ? 'active'
          : 'pending';

      return {
        key: step,
        title: stepMeta[step].title,
        description: stepMeta[step].description,
        route: stepMeta[step].route,
        status
      };
    })
  );

  const startOnboarding = () => {
    state.onboardingStarted = true;
    state.onboardingDismissed = false;
    state.checklistVisible = true;
    state.checklistMinimized = false;
  };

  const dismissOnboarding = () => {
    state.onboardingDismissed = true;
    state.checklistVisible = false;
  };

  const completeStep = (stepName: OnboardingStepName) => {
    if (state.steps[stepName]) return;
    state.steps[stepName] = true;
    state.onboardingStarted = true;
    syncDerivedState();
  };

  const resetOnboarding = () => {
    patchState(cloneDefaultState());
  };

  const goToNextStep = () => {
    syncDerivedState();
    return state.currentStep ? stepMeta[state.currentStep].route : '/dashboard';
  };

  const isStepCompleted = (stepName: OnboardingStepName) => state.steps[stepName];

  const setChecklistVisibility = (visible: boolean) => {
    state.checklistVisible = visible;
    if (visible) {
      state.checklistMinimized = false;
      state.onboardingStarted = true;
      state.onboardingDismissed = false;
    }
  };

  const setChecklistMinimized = (minimized: boolean) => {
    state.checklistMinimized = minimized;
    if (!state.checklistVisible) {
      state.checklistVisible = true;
    }
  };

  const dismissTooltip = (tooltipId: string) => {
    if (state.dismissedTooltipIds.includes(tooltipId)) return;
    state.dismissedTooltipIds.push(tooltipId);
  };

  const resetDismissedTooltip = (tooltipId: string) => {
    state.dismissedTooltipIds = state.dismissedTooltipIds.filter((id) => id !== tooltipId);
  };

  const getCurrentTooltip = (routeName: TooltipRouteName): OnboardingTooltip | null => {
    if (!state.onboardingStarted || state.onboardingDismissed || state.onboardingCompleted) {
      return null;
    }

    if (!state.currentStep) return null;

    const normalizedRoute = normalizeRouteName(routeName);
    if (!normalizedRoute) return null;

    const tooltip = buildTooltipMap(state.currentStep)[normalizedRoute];
    if (!tooltip) return null;
    if (state.dismissedTooltipIds.includes(tooltip.id)) return null;

    return tooltip;
  };

  return {
    onboardingStarted: readonly(onboardingStarted),
    onboardingDismissed: readonly(onboardingDismissed),
    onboardingCompleted: readonly(onboardingCompleted),
    currentStep: readonly(currentStep),
    checklistVisible: readonly(checklistVisible),
    checklistMinimized: readonly(checklistMinimized),
    progressPercentage: readonly(progressPercentage),
    checklistItems: readonly(checklistItems),
    shouldShowWelcomeModal: readonly(shouldShowWelcomeModal),
    steps: readonly(steps),
    startOnboarding,
    dismissOnboarding,
    completeStep,
    resetOnboarding,
    goToNextStep,
    isStepCompleted,
    setChecklistVisibility,
    setChecklistMinimized,
    dismissTooltip,
    resetDismissedTooltip,
    getCurrentTooltip
  };
};
