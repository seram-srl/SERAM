# Regla SERAM: Validación de Runtime, ESLint y Prevención de Pantalla de Carga/ReferenceErrors

## Propósito
Prevenir que errores en tiempo de ejecución (como `ReferenceError`, variables no importadas o dependencias faltantes) y pantallas de carga bloqueantes congelen o rompan la web y el Dashboard de socios de SERAM SRL.

---

## 1. Verificación Obligatoria de Importaciones e Identificadores (Anti-ReferenceError)
* **Importaciones de Íconos y Componentes:**
  - Todo elemento JSX utilizado (como `<ArrowRight />`, `<CheckSquare />`, etc.) DEBE estar importado explícitamente en el encabezado del archivo desde su librería correspondiente (`lucide-react`, `@heroicons`, etc.).
  - NUNCA asumir que un ícono está disponible globalmente.
* **Orden de Declaración (Anti-TDZ):**
  - Cualquier función auxiliar o handler (`iniciarTimeTracker`, formateadores, etc.) llamado dentro de un `useEffect` o callback de inicialización DEBE estar declarado **antes** del hook para evitar errores de *Temporal Dead Zone (TDZ)*.
* **Hooks de React:**
  - Si se usa `useCallback`, `useMemo`, `useRef`, `useState`, o `useEffect`, asegurarse de que estén importados en `import React, { ... } from 'react'`.

---

## 2. Protocolo de Validación Estricta Pre-Commit
`npm run build` de Vite empaqueta bundles pero NO detecta identificadores no definidos en tiempo de ejecución de React.
Por lo tanto, **antes de dar por finalizada una tarea o hacer commit**:
1. Ejecutar ESLint sobre los archivos modificados:
   ```bash
   npx eslint <archivo_modificado.jsx>
   ```
2. Si se reporta `react/jsx-no-undef` o `no-undef`, **detenerse y corregir de inmediato**. No se permite hacer push con errores de lint.
3. Para validar vistas críticas (`/dashboard`, `/`, etc.), abrir la página con `chrome-devtools-mcp` y ejecutar `list_console_messages` para certificar **0 errores en consola**.

---

## 3. Política de Carga Inmediata (0ms) en Dashboards y Portales
* **Prohibido el Bloqueo con Spinners de Pantalla Completa:**
  - En páginas de gestión (`PartnerDashboard`, `/dashboard`, etc.), el estado `loading` NUNCA debe iniciar en `true` bloqueando el árbol de React.
  - La interfaz debe renderizar en el primer milisegundo utilizando los datos en caché de `localStorage` o los datos estáticos de respaldo (`fallback`).
  - Las consultas remotas a Supabase deben ejecutarse en segundo plano e hidratar el estado silenciosamente sin desvanecer ni congelar la pantalla.
* **Protección de Tiempo Límite (Timeout Race):**
  - Toda consulta asíncrona de datos remotos debe protegerse con `Promise.race([fetchPromise, timeoutPromise])` con un timeout máximo de 2.5 a 3 segundos para prevenir que cuellos de botella de red bloqueen la experiencia del usuario.

---

## 4. Gestión de Motores Gráficos (Phaser y Three.js)
* **Un Solo Contexto Activo:**
  - No montar `EnvironmentalCanvas` (Three.js WebGL) en rutas que poseen su propio lienzo o fondo opaco (como `/dashboard`).
* **Instanciación Única de Phaser:**
  - En componentes basados en Phaser 3 (`MiniversoSERAM`), los callbacks del padre (`openModal`) deben almacenarse en referencias mutables (`useRef`) y el `useEffect` de montaje debe tener dependencias vacías `[]` para evitar destruir y reconstruir el motor gráfico en cada re-render.
