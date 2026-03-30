import type { Appearance } from '@clerk/shared/types';

export const clerkAuthAppearance: Appearance = {
  layout: {
    logoPlacement: 'none',
    socialButtonsVariant: 'blockButton',
    socialButtonsPlacement: 'top',
    showOptionalFields: false
  },
  variables: {
    colorPrimary: '#1f4f46',
    colorText: '#0f172a',
    colorTextSecondary: '#64748b',
    colorBackground: '#ffffff',
    colorInputBackground: '#f8f5ef',
    colorInputText: '#0f172a',
    colorDanger: '#e11d48',
    colorSuccess: '#047857',
    borderRadius: '1rem',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontFamilyButtons: "'Plus Jakarta Sans', sans-serif"
  },
  elements: {
    cardBox: 'w-full',
    card: 'rounded-[32px] border border-white/80 bg-white/94 p-6 shadow-[0_28px_70px_rgba(15,23,42,0.10)] backdrop-blur sm:p-8',
    headerTitle: 'text-3xl font-semibold text-slate-900',
    headerSubtitle: 'mt-3 text-sm leading-7 text-slate-500',
    footer: 'pt-5',
    footerAction: 'justify-center',
    footerActionText: 'text-sm text-slate-500',
    footerActionLink: 'font-semibold text-[#1f4f46] hover:text-[#173c36]',
    socialButtonsBlockButton:
      'h-12 rounded-2xl border border-[#e7ddd1] bg-[#f8f5ef] shadow-none transition hover:border-[#d8c4b4] hover:bg-white',
    socialButtonsBlockButtonText: 'text-sm font-semibold text-slate-800',
    socialButtonsProviderIcon: 'text-slate-700',
    dividerRow: 'my-5',
    dividerLine: 'bg-[#eadfd2]',
    dividerText: 'bg-white px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400',
    formFieldLabel: 'text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500',
    formFieldInput:
      'h-12 rounded-2xl border border-[#e7ddd1] bg-[#f8f5ef] px-4 text-sm text-slate-900 shadow-none transition placeholder:text-sm placeholder:text-slate-400 focus:border-[#1f4f46] focus:bg-white focus:ring-4 focus:ring-[#1f4f46]/10',
    formFieldInputShowPasswordButton: 'text-slate-400 transition hover:text-slate-700',
    formFieldAction: 'font-semibold text-[#1f4f46] hover:text-[#173c36]',
    formFieldErrorText: 'text-sm font-medium text-rose-600',
    formButtonPrimary:
      'h-12 rounded-2xl bg-[#1f4f46] text-sm font-semibold text-white shadow-lg shadow-emerald-950/10 transition hover:bg-[#173c36]',
    otpCodeFieldInputs: 'gap-2',
    otpCodeFieldInput:
      'h-12 w-12 rounded-2xl border border-[#e7ddd1] bg-[#f8f5ef] text-slate-900 shadow-none focus:border-[#1f4f46] focus:bg-white focus:ring-4 focus:ring-[#1f4f46]/10'
  }
};

export const clerkUserButtonAppearance: Appearance = {
  elements: {
    userButtonBox: 'block h-full w-full',
    userButtonTrigger: 'h-full w-full overflow-hidden rounded-full focus:shadow-none',
    userButtonAvatarBox: 'h-full w-full',
    userButtonAvatarImage: 'h-full w-full object-cover object-center'
  }
};
