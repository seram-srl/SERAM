import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
  console.warn(
    '[Supabase Service]: Falta configurar VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el archivo .env. Utilizando credenciales de demostración.'
  );
}

/**
 * Fetch con control de latencia inteligente y soporte de subida de archivos:
 * - Para consultas de lectura (GET) se aplica un timeout de 7 segundos para activar fallbacks si hay fallas de DNS.
 * - Para subidas a Supabase Storage (/storage/v1/) y operaciones de mutación (POST, PUT, PATCH, DELETE),
 *   se proporciona un tiempo de hasta 120 segundos para garantizar la subida íntegra de documentos, PDFs y registros.
 */
const GET_TIMEOUT_MS = 7000;
const MUTATION_TIMEOUT_MS = 120000;

const resilientFetch = (url, options = {}) => {
  const isStorage = typeof url === 'string' && url.includes('/storage/v1/');
  const isMutation = options.method && options.method.toUpperCase() !== 'GET';
  const timeoutMs = (isStorage || isMutation) ? MUTATION_TIMEOUT_MS : GET_TIMEOUT_MS;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

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
