<template>
  <div class="flex items-center justify-center min-h-[70vh]">
    <div class="bg-white shadow rounded-lg p-6 w-full max-w-md space-y-4">
      <div>
        <h2 class="text-2xl font-semibold mb-2 text-center">Crear cuenta</h2>
        <p class="text-sm text-slate-500 text-center">Registra al propietario con el email y contraseña deseados.</p>
      </div>
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm text-slate-600">Nombre completo</label>
          <input v-model="form.full_name" type="text" class="w-full rounded-md border border-slate-200 px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm text-slate-600">Correo</label>
          <input v-model="form.email" type="email" class="w-full rounded-md border border-slate-200 px-3 py-2" required />
        </div>
        <div>
          <label class="block text-sm text-slate-600">Contraseña</label>
          <input
            v-model="form.password"
            type="password"
            class="w-full rounded-md border border-slate-200 px-3 py-2"
            minlength="6"
            required
          />
        </div>
        <button class="w-full bg-primary text-white py-2 rounded-md hover:bg-blue-600" :disabled="loading">
          {{ loading ? 'Registrando...' : 'Crear cuenta' }}
        </button>
        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      </form>
      <p class="text-sm text-center text-slate-500">
        ¿Ya tienes cuenta?
        <router-link to="/login" class="text-primary font-semibold">Ingresar</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../services/apiClient';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const auth = useAuthStore();
const form = reactive({
  full_name: '',
  email: '',
  password: ''
});
const loading = ref(false);
const error = ref('');

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';
  try {
    const { data } = await apiClient.post('/auth/register', form);
    if (!data?.session) {
      throw new Error('No se pudo iniciar sesión');
    }
    auth.setToken(data.session.access_token);
    if (data.user) {
      auth.setUser({ id: data.user.id, email: data.user.email });
    }
    router.push('/dashboard');
  } catch (e: unknown) {
    console.error(e);
    if (axios.isAxiosError(e)) {
      const apiMessage = e.response?.data?.message;
      const apiDetails =
        typeof e.response?.data?.details === 'string'
          ? e.response?.data?.details
          : Array.isArray(e.response?.data?.errors)
            ? e.response?.data?.errors.join(', ')
            : undefined;
      error.value = [apiMessage, apiDetails]
        .filter(Boolean)
        .join(' · ') || 'No se pudo registrar. Verifica los datos.';
    } else {
      error.value = 'No se pudo registrar. Verifica los datos.';
    }
  } finally {
    loading.value = false;
  }
};
</script>
