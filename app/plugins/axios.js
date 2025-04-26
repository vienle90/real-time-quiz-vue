import axios from 'axios';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  
  // Create a custom axios instance
  const api = axios.create({
    baseURL: config.public.apiBaseUrl || 'http://localhost:8000',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });
  
  // Make axios available in the app
  return {
    provide: {
      axios: axios,
      api: api
    }
  };
});