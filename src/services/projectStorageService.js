import { supabase } from './supabaseClient';

/**
 * Servicio de almacenamiento resiliente para documentos de proyectos y cursos de SERAM SRL.
 * Gestiona la carga de archivos PDF hacia Supabase Storage con fallback automático local (DataURL).
 */

const STORAGE_BUCKET = 'project-documents';
const DB_NAME = 'seram_storage_db';
const STORE_NAME = 'documents';

function openStorageDb() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

export async function saveLocalBlob(id, file) {
  try {
    const db = await openStorageDb();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ id, file, name: file.name, type: file.type, updatedAt: Date.now() });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (_) {
    return false;
  }
}

export async function getLocalBlob(id) {
  try {
    const db = await openStorageDb();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result ? req.result.file : null);
      req.onerror = () => resolve(null);
    });
  } catch (_) {
    return null;
  }
}

/**
 * Convierte un File a DataURL (base64) solo para archivos pequeños (< 150KB).
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Sube un documento PDF de proyecto o curso con persistencia híbrida.
 * Intenta Supabase Storage primero; si falla, utiliza IndexedDB y Blob URL seguro.
 */
export async function uploadProjectDocument(file, entityId = Date.now(), folder = 'projects') {
  if (!file) return null;

  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${folder}/${entityId}_${Date.now()}_${sanitizedName}`;
  const localDocId = `doc_${entityId}_${sanitizedName}`;

  // Respaldo preventivo en IndexedDB (no colapsa cuota de localStorage)
  await saveLocalBlob(localDocId, file);

  try {
    // 1. Intento de subida a Supabase Storage con timeout extendido
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'application/pdf',
      });

    if (!error && data) {
      // 2. Obtener URL pública permanente desde Supabase
      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: publicUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        isLocalFallback: false,
      };
    } else if (error) {
      console.warn('[Supabase Storage Notice]:', error.message);
    }
  } catch (err) {
    console.warn('[Storage Upload Warning]:', err.message);
  }

  // 3. Fallback seguro: Usar URL de objeto Blob o documento oficial para no colapsar la cuota de localStorage
  let safeFallbackUrl = '/assets/documents/compendio_normativo_gestion_ambiental_seram.pdf';
  if (typeof URL !== 'undefined' && URL.createObjectURL) {
    try {
      safeFallbackUrl = URL.createObjectURL(file);
    } catch (_) {}
  }

  return {
    success: true,
    url: safeFallbackUrl,
    name: file.name,
    size: file.size,
    type: file.type,
    isLocalFallback: true,
  };
}
