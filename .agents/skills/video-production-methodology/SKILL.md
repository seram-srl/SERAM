---
name: video-production-methodology
description: Metodología paso a paso para la ideación, producción en lote y ensamblaje de videos programáticos combinando Gemini, Antigravity, HeyGen y Remotion para la consultora SERAM.
---

# Metodología de Producción de Video Programática (SERAM Experience)

Esta skill define la metodología paso a paso para estructurar un lote de contenidos (slots o books) para redes sociales utilizando el ecosistema integrado:
1. **Gemini (Google Pro):** Director Creativo y Guionista (Guiones, ganchos y código Remotion).
2. **Antigravity (IA Visual):** Director de Arte (Fondos, texturas y B-roll estático).
3. **HeyGen:** El Portavoz (Avatar fotorrealista / clon con canal alfa o chroma key).
4. **Remotion:** El Estudio Programable (React + Vite, superposición, telemetría y subtítulos dinámicos).

---

## 🔁 Flujo de Trabajo en 4 Pasos

### Paso 1: Ideación y Guionización (En Gemini)
Estructurar el guion del lote de contenidos dividido en tres fases de embudo (TOFU, MOFU, BOFU):
* **TOFU (Atracción - 45s):** Gancho visual disruptivo + Dato técnico/curiosidad impactante.
* **MOFU (Nutrición - 60s):** Miniclase práctica que resuelve un dolor o enseña a usar una herramienta en campo.
* **BOFU (Conversión - 45s):** Invitación a la acción directa, registro de cursos o salidas técnicas de SERAM.

### Paso 2: Generación de Activos (En Antigravity)
Generar fondos y B-roll de apoyo.
* **Prompts Visuales:** Redactar prompts optimizados con estilo cinemático y colores de marca.
* **Formato:** Asegurar relación de aspecto vertical 9:16.

### Paso 3: Síntesis de Portavoz (En HeyGen)
Generar el video del presentador diciendo el guion.
* Crear video vertical con fondo verde (chroma key) o transparente (canal alfa).
* Guardar el archivo en formato `.mp4` de alta resolución.

### Paso 4: Ensamblaje y Renderizado (En Remotion)
* Mover los archivos de video y audio generados a `remotion-video/public/`.
* Ejecutar la transcripción automática en español mediante Whisper:
  ```bash
  node sub.mjs public/<nombre-video>.mp4
  ```
* Superponer la pista del portavoz por encima del fondo y HUD de telemetría científica.

---

## 📋 Protocolo de Cierre Obligatorio (Comandos de Renderizado)

Cada vez que el agente ayude al usuario a estructurar un lote de contenidos o slots de video bajo esta metodología, debe terminar su respuesta imprimiendo de manera obligatoria una **Guía Rápida de Comandos** adaptada a los nombres de las composiciones definidas.

### Plantilla de Guía de Renderizado al Final de Turno:

```bash
# ========================================================
# COMANDOS DE RENDERIZADO (EJECUCIÓN EN REMOTION-VIDEO)
# ========================================================

# 1. Transcribir los videos y generar subtítulos JSON en español:
node sub.mjs public/<tofu-video-name>.mp4
node sub.mjs public/<mofu-video-name>.mp4
node sub.mjs public/<bofu-video-name>.mp4

# 2. Renderizar los videos finales listos para publicar:
npx remotion render <composition-id-tofu> public/render-tofu.mp4
npx remotion render <composition-id-mofu> public/render-mofu.mp4
npx remotion render <composition-id-bofu> public/render-bofu.mp4
```
