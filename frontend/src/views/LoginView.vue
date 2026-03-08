<template>
  <div class="flex items-center justify-center min-h-[70vh]">
    <div class="bg-white shadow rounded-lg p-6 w-full max-w-md">
      <h2 class="text-2xl font-semibold mb-4 text-center">Iniciar sesión</h2>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm text-slate-600">Correo</label>
          <input
            v-model="form.email"
            type="email"
            class="w-full rounded-md border border-slate-200 px-3 py-2"
          />
        </div>
        <div>
          <label class="block text-sm text-slate-600">Contraseña</label>
          <input
            v-model="form.password"
            type="password"
            class="w-full rounded-md border border-slate-200 px-3 py-2"
          />
        </div>
        <button
          class="w-full bg-primary text-white py-2 rounded-md hover:bg-blue-600"
          :disabled="loading"
        >
          {{ loading ? 'Validando...' : 'Entrar' }}
        </button>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </form>
      <p class="text-center text-sm text-slate-500">
        ¿Sin cuenta?
        <router-link to="/register" class="text-primary font-semibold hover:underline">Regístrate</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();
const form = reactive({
  email: 'owner@example.com',
  password: 'password123'
});
const loading = ref(false);
const error = ref('');

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  try {
    await auth.login(form);
    router.push('/dashboard');
  } catch (e: unknown) {
    console.error(e);
    error.value = 'Credenciales incorrectas';
  } finally {
    loading.value = false;
  }
};
</script>
