/**
 * SERAM Academy — Almacenamiento Local Resiliente para Videos y Carátulas
 * Evita exceder el límite de 5MB de localStorage guardando archivos binarios
 * de video (.mp4/.webm/.mov) en IndexedDB bajo referencias `idb://seram-media/...`
 * y comprimiendo carátulas personalizadas mediante Canvas API.
 */

const DB_NAME = 'seram_academy_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'media_blobs';
const IDB_PREFIX = 'idb://seram-media/';

const resolvedUrlCache = new Map();

function openMediaDb() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no disponible en este entorno'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Error abriendo IndexedDB'));
  });
}

export function isIndexedDbMediaUrl(url) {
  return typeof url === 'string' && url.startsWith(IDB_PREFIX);
}

export function formatVideoDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '15:00 min';
  const total = Math.round(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (n) => String(n).padStart(2, '0');
  if (hrs > 0) return `${hrs}:${pad(mins)}:${pad(secs)} hrs`;
  return `${pad(mins)}:${pad(secs)} min`;
}

export function probeVideoDurationSeconds(file) {
  return new Promise((resolve) => {
    if (typeof document === 'undefined' || !file || !file.type?.startsWith('video/')) {
      resolve(null);
      return;
    }
    const tempUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';

    const cleanup = () => {
      URL.revokeObjectURL(tempUrl);
      video.removeAttribute('src');
    };

    video.onloadedmetadata = () => {
      const dur = Number.isFinite(video.duration) ? video.duration : null;
      cleanup();
      resolve(dur);
    };
    video.onerror = () => {
      cleanup();
      resolve(null);
    };
    video.src = tempUrl;
  });
}

/**
 * Guarda un archivo (video o recurso binario) en IndexedDB y devuelve la URI persistente.
 */
export async function saveCourseMediaBlob(file, prefix = 'lesson') {
  if (!file) throw new Error('Archivo no proporcionado');
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  const safePrefix = String(prefix || 'lesson').replace(/[^a-zA-Z0-9_-]/g, '_');
  const key = `${IDB_PREFIX}${safePrefix}_${Date.now()}_${randomSuffix}`;
  const durationSeconds = await probeVideoDurationSeconds(file);

  const db = await openMediaDb();
  const record = {
    key,
    blob: file,
    name: file.name || 'video_clase.mp4',
    type: file.type || 'video/mp4',
    size: file.size || 0,
    durationSeconds,
    updatedAt: new Date().toISOString()
  };

  await new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('No se pudo guardar el archivo en IndexedDB'));
  });

  // Pre-cachear ObjectURL para reproducción inmediata sin latencia
  const objectUrl = URL.createObjectURL(file);
  resolvedUrlCache.set(key, objectUrl);

  return {
    url: key,
    objectUrl,
    name: record.name,
    size: record.size,
    type: record.type,
    durationSeconds,
    durationLabel: durationSeconds ? formatVideoDuration(durationSeconds) : null
  };
}

/**
 * Resuelve cualquier URL (`https://...`, `/assets/...`, o `idb://seram-media/...`) a un src reproducible.
 */
export async function resolveCourseMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  if (!isIndexedDbMediaUrl(url)) return url;

  if (resolvedUrlCache.has(url)) {
    return resolvedUrlCache.get(url);
  }

  try {
    const db = await openMediaDb();
    const record = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(url);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    if (record?.blob) {
      const objectUrl = URL.createObjectURL(record.blob);
      resolvedUrlCache.set(url, objectUrl);
      return objectUrl;
    }
  } catch (err) {
    console.warn('[CourseMediaStorage] No se pudo resolver media IndexedDB:', err);
  }
  return '';
}

export async function deleteCourseMediaBlob(url) {
  if (!isIndexedDbMediaUrl(url)) return;
  const cached = resolvedUrlCache.get(url);
  if (cached) {
    URL.revokeObjectURL(cached);
    resolvedUrlCache.delete(url);
  }
  try {
    const db = await openMediaDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(url);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('[CourseMediaStorage] Error eliminando media IndexedDB:', err);
  }
}

export async function listStoredMediaMeta() {
  try {
    const db = await openMediaDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => {
        const items = (req.result || []).map(({ key, name, type, size, durationSeconds, updatedAt }) => ({
          key,
          name,
          type,
          size,
          durationSeconds,
          updatedAt
        }));
        resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

/**
 * Comprime una imagen subida desde PC (PNG/JPG/WebP) a DataURL ligero para carátulas de cursos Odoo.
 */
export function fileToDataUrlCompressed(file, maxWidth = 960, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('Imagen no válida'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result;
      if (typeof document === 'undefined') {
        resolve(rawDataUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        try {
          const scale = img.width > maxWidth ? maxWidth / img.width : 1;
          const width = Math.max(1, Math.round(img.width * scale));
          const height = Math.max(1, Math.round(img.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/webp', quality);
          resolve(compressed.startsWith('data:image/') ? compressed : rawDataUrl);
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 MB';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
