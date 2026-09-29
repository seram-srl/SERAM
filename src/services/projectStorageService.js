import { supabase } from './supabaseClient';

/**
 * Servicio de almacenamiento resiliente para documentos de proyectos y cursos de SERAM SRL.
 * Gestiona la carga de archivos PDF hacia Supabase Storage con fallback automático local (DataURL).
 */

const STORAGE_BUCKET = 'project-documents';

/**
 * Convierte un File a DataURL (base64) para previsualización inmediata y fallback offline.
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
 * Sube un documento PDF de proyecto o curso.
 * Intenta Supabase Storage primero; si falla la conexión, utiliza DataURL para persistencia local.
 */
export async function uploadProjectDocument(file, entityId = Date.now(), folder = 'projects') {
  if (!file) return null;

  const fileExt = file.name.split('.').pop();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${folder}/${entityId}_${Date.now()}_${sanitizedName}`;

  try {
    // 1. Intento de subida a Supabase Storage
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn('[Supabase Storage Warning]: Falló subida a bucket, usando respaldo local:', error.message);
      const localDataUrl = await fileToDataUrl(file);
      return {
        success: true,
        url: localDataUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        isLocalFallback: true,
      };
    }

    // 2. Obtener URL pública desde Supabase
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
  } catch (err) {
    console.warn('[Storage Error Fallback]:', err.message);
    const localDataUrl = await fileToDataUrl(file);
    return {
      success: true,
      url: localDataUrl,
      name: file.name,
      size: file.size,
      type: file.type,
      isLocalFallback: true,
    };
  }
}
