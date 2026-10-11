# Implementation Plan — TASK-052: Depuración Ergonómica de Dashboard, Análisis Multidimensional y Árbol de Talentos Estructurado

## 1. Contexto y Objetivos
1. **Renombrar sección:**
   - Cambiar "Perfil RPG & Habilidades" a "Perfil y Habilidades" en sidebar y títulos.
2. **Eliminar redundancias visuales y menú duplicado:**
   - Eliminar el botón secundario tipo hamburguesa junto al título de sección en el header del dashboard (`PartnerDashboard.jsx`).
   - Eliminar el espacio innecesario / subtab redundante entre la cabecera y el cuerpo del módulo (`PartnerProfileRPGModule.jsx`).
3. **Limpieza de etiquetas sobrecargadas:**
   - Eliminar etiquetas superfluas:
     - Badge "BMC" en 'Actividades & Clientes' del sidebar.
     - Badge "Nuevo" en 'Perfil RPG & Habilidades' del sidebar.
     - "🏆 SISTEMA RPG MERITOCRÁTICO" y "· Business Model Canvas" en la cabecera del módulo de perfiles.
     - "CÁLCULO AUTOMÁTICO IMPARCIAL" y "Sin Sliders Manuales" en la tarjeta de fortalezas.
4. **Renombrar a "Análisis Multidimensional":**
   - Renombrar "Radar Pentagonal de Fortalezas & Debilidades" a "Análisis Multidimensional".
5. **Corrección del Pentágono:**
   - Eliminar parpadeo constante desactivando animaciones cíclicas (`isAnimationActive={false}`) y estabilizando dimensiones de `ResponsiveContainer`.
   - Alinear el eje métrico 0-100 a la vertical (`angle={90}` en `PolarRadiusAxis`).
   - Aumentar el contraste del eje con trazo y números nítidos legibles.
6. **Árbol de Talentos Estructurado:**
   - Integrar en el segmento de "Análisis Multidimensional" el árbol jerárquico con:
     - TRONCO COMÚN DE INGENIERO EN ECOLOGÍA Y M.A.
     - 5 Ramas conectadas:
       - RAMA I: Geo-Información & Análisis Espacial
       - RAMA II: Diagnóstico Biofísico & Monitoreo
       - RAMA III: Bioprocesos & Economía Circular
       - RAMA IV: Compliance Normativo & SYSO
       - RAMA V: Dirección & Estrategia Comercial

---

## 2. Archivos Afectados
1. `src/features/partner-portal/PartnerDashboard.jsx` (Limpieza de badges, título y eliminación de botón hamburguesa duplicado).
2. `src/features/partner-portal/PartnerProfileRPGModule.jsx` (Eliminación de etiquetas sobrecargadas, renombrado a Análisis Multidimensional, estabilización del radar sin parpadeo y eje a 90° vertical, integración del Árbol de Talentos).
3. `src/features/partner-portal/gamification/TalentTreeStructured.jsx` (Nuevo componente modular para el árbol de talentos con tronco común y 5 ramas).
4. `tasks.json` (Registro de tarea TASK-052).
