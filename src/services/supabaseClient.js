import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    '[Supabase Service]: Falta configurar VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el archivo .env. Utilizando credenciales de demostración.'
  );
}

/**
 * Fetch con timeout estricto de 3.5 segundos para evitar bloqueos por latencia
 * o errores de DNS en el host de Supabase, permitiendo fallback inmediato.
 */
const FETCH_TIMEOUT_MS = 3500;

const resilientFetch = (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, FETCH_TIMEOUT_MS);

  const signal = options.signal || controller.signal;

  return fetch(url, { ...options, signal })
    .finally(() => clearTimeout(timeoutId));
};

/**
 * Cliente de conexión oficial de Supabase.
 * Proporciona acceso unificado a los servicios de autenticación y base de datos.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    fetch: resilientFetch,
  },
});

export default supabase;
