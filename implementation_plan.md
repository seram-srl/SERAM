# Implementation Plan — Nivel Máximo 33 y Motor de Sinergias Interdisciplinarias (TASK-055)

## 1. Contexto y Objetivos
1. **Recalibración del Sistema de Niveles a Grado 33 (Max Level 33):**
   - Rediseñar la curva matemática de XP en `xpEngine.js` para expandir de 5 niveles a **33 Grados de Maestría Pericial**.
   - **Objetivo de Progresión:** Progresión diseñada para varios años de ejercicio profesional continuo (~615,000+ XP para Nivel 33), pero con incrementos accesibles en los primeros niveles (Nivel 1 al 5 en el primer mes, Nivel 6 al 15 en los primeros 1-2 años) para que el avance sea visible y gratificante en cada entregable.
   - **6 Órdenes de Maestría:**
     - Orden I: Semillero & Aspirantía (Niveles 1 a 5)
     - Orden II: Especialización & Autonomía (Niveles 6 a 11)
     - Orden III: Liderazgo Pericial & Dictamen (Niveles 12 a 17)
     - Orden IV: Dirección & Estrategia Societaria (Niveles 18 a 23)
     - Orden V: Consejo de Sabios & Maestría (Niveles 24 a 28)
     - Orden VI: Consejo Supremo & Legado (Niveles 29 a 32)
     - Cénit Supremo: Grado 33 · Arquitecto Planetario & Socio Emérito (Nivel 33)
   - Multiplicador de tarifa proporcional de 1.00x (Nivel 1) hasta 2.50x (Nivel 33).
   - Modal drawer interactivo en `PartnerProfileRPGModule.jsx` para explorar la "Escala de los 33 Grados de SERAM" con visualización del progreso del socio actual.

2. **Implementación de TASK-055: Motor de Sinergias y Combos Interdisciplinarios (Octalysis CD3 & CD5):**
   - Componente `InterdisciplinarySynergies.jsx` que calcula la resonancia entre los perfiles de los 3 socios según sus talentos y asignaciones en proyectos.
   - Catálogo de combos cooperativos activos (Blindaje Geo-Legal, Clima & Naturaleza 360°, Bioeconomía Circular, y el Raid Trinitario Apex).
   - Integración visual en el Portal de Socios para incentivar la concurrencia técnica y el trabajo en equipo en licitaciones y peritajes de impacto.

---

## 2. Archivos Afectados
1. `src/features/partner-portal/gamification/xpEngine.js`:
   - Definición de `LEVELS_33`, `MASTERY_ORDERS`, funciones actualizadas `getPartnerTier`, `calculateTaskXP`, y compatibilidad de campos existentes.
2. `src/features/partner-portal/PartnerProfileRPGModule.jsx`:
   - Integración del badge Nivel 33, indicador de orden de maestría, y botón/modal para consultar la escala completa de los 33 grados.
3. `src/features/partner-portal/gamification/InterdisciplinarySynergies.jsx` (Nuevo):
   - Motor y UI interactiva de sinergias y combos interdisciplinarios entre ramas.
4. `src/features/partner-portal/ActivitiesAndClientsModule.jsx`:
   - Widget de sinergia de equipo en la cabecera del módulo.
5. `tasks.json`:
   - Actualización de estado de `TASK-055` (pending -> completed).
