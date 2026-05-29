# Configuración del Supabase Storage: Bucket `assets-3d`

Esta guía técnica describe los pasos para configurar el almacenamiento en la nube en Supabase con el fin de alojar las texturas e imágenes tridimensionales de alta definición para el fondo inmersivo de la plataforma SERAM.

---

## 📂 1. Creación del Storage Bucket en Supabase

Sigue estos pasos en el Panel de Control de tu proyecto de Supabase:

1. Ve a la pestaña **Storage** (Almacenamiento) en el menú lateral izquierdo de Supabase.
2. Haz clic en el botón **New Bucket** (Nuevo Bucket).
3. Configura los siguientes parámetros en el formulario modal:
   * **Bucket Name:** `assets-3d`
   * **Allowed MIME types:** Dejar en blanco para aceptar cualquier formato, o especificar `image/webp, image/png` para mayor seguridad.
   * **Public Bucket:** **ACTIVO (Habilitado)** 🔓. *Esto es fundamental para que el cargador `Three.TextureLoader` de Three.js pueda consumir las URLs públicas sin requerir tokens de autenticación efímeros.*
4. Haz clic en **Save** para crear el bucket.

---

## 🎨 2. Carga y Estructura de Texturas (Assets WebGL)

Una vez creado el bucket `assets-3d`, sube los archivos de texturas WebP con la siguiente nomenclatura para mantener consistencia con el diseño desacoplado:

```
assets-3d/
├── bg_texture.webp    ← Textura de fondo lejano (Plano Z = -15)
├── mid_texture.webp   ← Textura de producto principal/foco (Plano Z = -5)
└── fg_texture.webp    ← Textura de partículas en primer plano (Plano Z = 1)
```

> [!TIP]
> Para lograr el máximo desempeño en dispositivos móviles y de escritorio, asegúrate de que tus texturas tengan dimensiones en potencias de 2 (ej. $1024 \times 1024$ o $2048 \times 2048$ píxeles) y estén optimizadas en formato WebP con un factor de compresión de calidad entre 70% y 80%.

---

## ⚙️ 3. Integración en el Archivo de Entorno (`.env`)

Obtén las URLs públicas generadas por Supabase para cada textura (puedes copiarlas haciendo clic en los tres puntos al lado de cada archivo en la consola y seleccionando *"Get Public URL"*).

Pega estas URLs en tu archivo local [`.env`](file:///d:/SERAM/.env) o en la consola de variables de entorno de tu proveedor de la nube (Vercel, Netlify, Cloudflare):

```bash
# URLs públicas del Bucket Supabase Storage para alimentar al motor WebGL
VITE_BG_TEXTURE_URL="https://[tu-id-proyecto].supabase.co/storage/v1/object/public/assets-3d/bg_texture.webp"
VITE_MID_TEXTURE_URL="https://[tu-id-proyecto].supabase.co/storage/v1/object/public/assets-3d/mid_texture.webp"
VITE_FG_TEXTURE_URL="https://[tu-id-proyecto].supabase.co/storage/v1/object/public/assets-3d/fg_texture.webp"
```

---

## 🔌 4. Consumo Automático en el Motor WebGL

El componente base `<WebGLBackground />` está preparado por código para consumir estas variables dinámicas de entorno. En tu componente integrador, pásalas directamente como props:

```jsx
import WebGLBackground from './components/ui/WebGLBackground';

export default function App() {
  return (
    <div className="relative">
      <WebGLBackground 
        bgTextureUrl={import.meta.env.VITE_BG_TEXTURE_URL}
        midTextureUrl={import.meta.env.VITE_MID_TEXTURE_URL}
        fgTextureUrl={import.meta.env.VITE_FG_TEXTURE_URL}
      />
      {/* Contenido HTML de la App */}
    </div>
  );
}
```

*Nota: Si las variables de entorno no están definidas o la red experimenta fallos de conectividad, el motor WebGL activará automáticamente el modo de contingencia `wireframe: true` renderizando las mallas verdes orgánicas calibradas, garantizando resiliencia gráfica.*
