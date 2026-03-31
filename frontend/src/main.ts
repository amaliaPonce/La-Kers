import { createApp } from 'vue';
import { clerkPlugin } from '@clerk/vue';
import App from './App.vue';
import router from './router';
import './index.css';

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ?? '';

const app = createApp(App);
if (clerkPublishableKey) {
  app.use(clerkPlugin, {
    publishableKey: clerkPublishableKey,
    signInUrl: '/sign-in',
    signUpUrl: '/sign-up',
    afterSignOutUrl: '/',
    localization: {
      locale: 'es-ES',
      socialButtonsBlockButton: 'Continuar con {{provider|titleize}}',
      dividerText: 'o',
      formFieldLabel__emailAddress: 'Correo electrónico',
      formFieldLabel__emailAddress_username: 'Correo electrónico',
      formFieldLabel__password: 'Contraseña',
      formFieldInputPlaceholder__emailAddress: 'tu@correo.com',
      formFieldInputPlaceholder__emailAddress_username: 'tu@correo.com',
      formFieldInputPlaceholder__password: 'Tu contraseña',
      formFieldAction__forgotPassword: '¿Has olvidado tu contraseña?',
      formButtonPrimary: 'Entrar',
      signInEnterPasswordTitle: 'Introduce tu contraseña',
      signIn: {
        start: {
          title: 'Iniciar sesión',
          subtitle: 'Accede con tu cuenta para entrar al panel.',
          actionText: '¿No tienes cuenta?',
          actionLink: 'Crear cuenta'
        },
        password: {
          title: 'Introduce tu contraseña',
          subtitle: 'Accede con tu cuenta para entrar al panel.',
          actionLink: 'Usar otro método'
        },
        forgotPassword: {
          title: 'Restablecer contraseña',
          subtitle: 'Te enviaremos las instrucciones para recuperar el acceso.',
          subtitle_email: 'Te enviaremos un código a tu correo.',
          formTitle: 'Código de recuperación',
          resendButton: 'Reenviar código'
        },
        resetPassword: {
          title: 'Crear nueva contraseña',
          formButtonPrimary: 'Guardar contraseña',
          successMessage: 'Tu contraseña se ha actualizado.',
          requiredMessage: 'Necesitas crear una nueva contraseña para continuar.'
        }
      },
      signUp: {
        start: {
          title: 'Crear cuenta',
          subtitle: 'Regístrate para entrar al panel.',
          actionText: '¿Ya tienes cuenta?',
          actionLink: 'Iniciar sesión'
        },
        emailCode: {
          title: 'Verifica tu correo',
          subtitle: 'Introduce el código que enviamos a tu correo.'
        },
        continue: {
          title: 'Completa tu cuenta',
          subtitle: 'Revisa tus datos para terminar el registro.',
          actionText: '¿Ya tienes cuenta?',
          actionLink: 'Iniciar sesión'
        }
      }
    },
    appearance: {
      layout: {
        logoPlacement: 'none',
        socialButtonsVariant: 'blockButton',
        socialButtonsPlacement: 'top',
        showOptionalFields: false,
        unsafe_disableDevelopmentModeWarnings: true
      },
      variables: {
        colorPrimary: '#1f4f46',
        colorBackground: '#ffffff',
        colorText: '#0f172a',
        colorInputBackground: '#fcfbf8',
        colorInputText: '#0f172a',
        borderRadius: '1rem'
      },
      elements: {
        lastAuthenticationStrategyBadge: 'hidden',
        socialButtonsBlockButton:
          'h-12 rounded-2xl border border-[#dfd6cc] bg-white text-slate-700 shadow-none transition hover:border-[#cdbba8] hover:bg-[#fffaf4]',
        socialButtonsBlockButtonText: 'font-semibold text-sm',
        dividerLine: 'bg-[#ece3d7]',
        dividerText: 'text-xs font-semibold uppercase tracking-[0.28em] text-slate-400',
        formFieldLabel: 'text-sm font-medium text-slate-700',
        formFieldInput:
          'h-12 rounded-2xl border border-[#dfd6cc] bg-[#fcfbf8] text-slate-900 shadow-none transition focus:border-[#c96a37] focus:bg-white focus:ring-4 focus:ring-[#c96a37]/10',
        formButtonPrimary:
          'h-12 rounded-2xl bg-[#1f4f46] text-sm font-semibold text-white shadow-[0_18px_40px_rgba(31,79,70,0.18)] transition hover:bg-[#163a33]',
        footerActionText: 'text-sm text-slate-500',
        footerActionLink: 'font-semibold text-[#1f4f46] hover:text-[#163a33]',
        formFieldHintText: 'text-xs text-slate-400',
        formResendCodeLink: 'font-semibold text-[#1f4f46] hover:text-[#163a33]',
        otpCodeFieldInput:
          'h-12 w-12 rounded-2xl border border-[#dfd6cc] bg-[#fcfbf8] text-slate-900 shadow-none'
      }
    }
  });
}
app.use(router);
app.mount('#app');
