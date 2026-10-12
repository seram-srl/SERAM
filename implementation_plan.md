# Implementation Plan — Árbol de Talentos Interactivo Estilo RPG / Constelación (SERAM)

## 1. Contexto y Objetivos
Diseñar e implementar la interfaz visual interactiva del **Árbol de Talentos de Socios** para SERAM S.R.L. basada en la referencia visual de RPG/Constelación (*media_1791755248283_0d262b6a.png*) y los consensos alcanzados en el proceso `/grill-me`:
1. **Topología de 5 Constelaciones Independientes:**
   - Rama I: *Evaluación de Impacto & Riesgo Ambiental (EIA)* (Verde Esmeralda)
   - Rama II: *Gestión Ambiental, Sostenibilidad Corporativa & Construcción Sostenible (EDGE)* (Ámbar / Dorado)
   - Rama III: *Cambio Climático, Mercados de Carbono & Finanzas Verdes* (Azul Zafiro / Eléctrico)
   - Rama IV: *Conservación de Biodiversidad, Restauración & Soluciones Basadas en la Naturaleza (NbS)* (Verde Neón)
   - Rama V: *Economía Circular, Bioprocesos & Gestión de Residuos* (Púrpura / Amatista)
2. **Eliminación de Bloqueos Forzados & Vías Paralelas:**
   - La certificación EDGE no exige conocimientos previos en SYSO o auditorías.
   - Mercados de Carbono y Biocréditos no exigen silvicultura o inventarios forestales clásicos.
   - Cada constelación cuenta con 3 o 4 vías paralelas autónomas y un nodo cumbre de maestría (Apex).
3. **Integración Transversal de SIG y Teledetección:**
   - Los SIG figuran como nodos de especialización instrumental aplicada dentro de cada constelación (ej. *SIG Minero en EIA*, *MRV Satelital en Clima*, *Zonificación de Corredores en Biodiversidad*), siendo optativos sin bloquear otras vías.
4. **Mecánica de Desbloqueo Guiada por Certificación Real:**
   - Desbloqueo directo mediante vinculación de certificaciones externas (EDGE Expert, Diplomados, Registro RENCA), cursos en SERAM Academy o proyectos ejecutados.
5. **Interfaz Visual Cinemática:**
   - Gráfico de red estelar interactivo con líneas de energía resplandecientes, nodos circulares con iconos y estados (Desbloqueado, En Progreso, Bloqueado), contador de puntos invertidos por constelación y drawer lateral detallado para adjuntar comprobantes y simular progresión con persistencia en `localStorage`.

---

## 2. Archivos Afectados
1. `src/features/partner-portal/gamification/talentTreeData.js` (Nuevo: Base de datos estructurada con las 5 constelaciones, vías paralelas, nodos instrumentales SIG, tiers 1-4, descripciones técnicas y requisitos de certificación).
2. `src/features/partner-portal/gamification/TalentTreeConstellation.jsx` (Nuevo: Componente visual interactivo estilo RPG / Constelación con lienzo SVG reactivo, animaciones Framer Motion, filtros temáticos, selector de socio y drawer lateral de certificación con persistencia).
3. `src/features/partner-portal/PartnerProfileRPGModule.jsx` (Integración de `TalentTreeConstellation` en la vista de perfil de socios).
4. `src/features/partner-portal/gamification/TalentTreeStructured.jsx` (Actualización para armonizar con el nuevo modelo de datos).
