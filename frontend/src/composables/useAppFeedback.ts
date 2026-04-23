import { reactive, readonly } from 'vue';

export type AppToastTone = 'info' | 'success' | 'error';
export type AppConfirmTone = 'default' | 'danger';

type AppToastState = {
  visible: boolean;
  message: string;
  tone: AppToastTone;
};

type AppConfirmState = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  tone: AppConfirmTone;
};

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: AppConfirmTone;
};

const toast = reactive<AppToastState>({
  visible: false,
  message: '',
  tone: 'info'
});

const confirmation = reactive<AppConfirmState>({
  visible: false,
  title: '',
  message: '',
  confirmLabel: 'Confirmar',
  cancelLabel: 'Cancelar',
  tone: 'default'
});

let toastTimer: ReturnType<typeof setTimeout> | null = null;
let confirmResolver: ((value: boolean) => void) | null = null;

const hideToast = () => {
  toast.visible = false;
  if (toastTimer) {
    clearTimeout(toastTimer);
    toastTimer = null;
  }
};

const showToast = (
  message: string,
  options: {
    tone?: AppToastTone;
    durationMs?: number;
  } = {}
) => {
  hideToast();
  toast.message = message;
  toast.tone = options.tone ?? 'info';
  toast.visible = true;

  const durationMs = options.durationMs ?? 2800;
  toastTimer = setTimeout(() => {
    toast.visible = false;
    toastTimer = null;
  }, durationMs);
};

const showError = (message: string) => {
  showToast(message, { tone: 'error', durationMs: 3600 });
};

const showSuccess = (message: string) => {
  showToast(message, { tone: 'success' });
};

const resolveConfirmation = (value: boolean) => {
  const resolver = confirmResolver;
  confirmResolver = null;
  confirmation.visible = false;
  confirmation.title = '';
  confirmation.message = '';
  confirmation.confirmLabel = 'Confirmar';
  confirmation.cancelLabel = 'Cancelar';
  confirmation.tone = 'default';
  resolver?.(value);
};

const requestConfirmation = (options: ConfirmOptions) => {
  if (confirmResolver) {
    resolveConfirmation(false);
  }

  confirmation.visible = true;
  confirmation.title = options.title;
  confirmation.message = options.message;
  confirmation.confirmLabel = options.confirmLabel ?? 'Confirmar';
  confirmation.cancelLabel = options.cancelLabel ?? 'Cancelar';
  confirmation.tone = options.tone ?? 'default';

  return new Promise<boolean>((resolve) => {
    confirmResolver = resolve;
  });
};

export const useAppFeedback = () => {
  return {
    toast: readonly(toast),
    confirmation: readonly(confirmation),
    hideToast,
    showToast,
    showError,
    showSuccess,
    requestConfirmation,
    resolveConfirmation
  };
};
