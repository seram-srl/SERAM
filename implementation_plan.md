# Implementation Plan — Fase 2: Módulo de Misiones Flash Coyunturales Dinámicas en Tiempo Real (TASK-056)

## 1. Contexto y Objetivos
Alineado con los Core Drives 6 (Scarcity & Impatience) y 7 (Unpredictability & Curiosity) de Octalysis:
1. **Temporizadores de Cuenta Regresiva Reactivos en Vivo (72h - 96h):**
   - Implementar un cronómetro regresivo en tiempo real (`HH:MM:SS`) basado en `expiresAt` con actualización reactiva cada 1 segundo.
   - Tres estados de urgencia visual:
     - Normal ($>48\text{h}$ restantes): Verde Esmeralda (`#00e03c`).
     - Alerta Crítica ($24\text{h} - 48\text{h}$ restantes): Ámbar radiante (`#f59e0b`).
     - Urgencia Inminente ($<24\text{h}$ restantes): Neón rojo intermitente / pulso de advertencia (`#ef4444`).
   - Mecánica de Expiración (CD8 - Loss Avoidance): Si el reloj llega a 00:00:00, la misión expira y el cofre queda sellado.
2. **Generador Dinámico de Contingencias Ambientales Bolivianas:**
   - Crear motor `FlashMissionsEngine.js` con generador aleatorio de eventos coyunturales verosímiles del contexto pericial boliviano:
     - Licitaciones de emergencia SICOES (72h).
     - Decretos Supremos y resoluciones de sustancias peligrosas (48h).
     - Alertas biofísicas de crecidas y relaves en cuencas (96h).
     - Fiscalizaciones sorpresa de la AAC (48h).
     - Convocatorias express de biocréditos y carbono (72h).
   - Botón interactivo para simular/disparar nuevas contingencias espontáneas.
3. **Mecánica de Reclamo & Apertura de Cofres:**
   - Flujo: *Alerta Abierta* $\to$ *Asumir Desafío* $\to$ *Validar Entrega en Plazo* $\to$ *Apertura de Cofre Esmeralda con perks de racha y PIP*.
   - Integración nativa en `SpecialMissionsModule.jsx` con persistencia en `localStorage`.

---

## 2. Archivos Afectados
1. `src/features/partner-portal/gamification/FlashMissionsEngine.js` (Nuevo: Plantillas de contingencias, cálculo de tiempo regresivo y disparador).
2. `src/features/partner-portal/gamification/SpecialMissionsModule.jsx` (Integración de temporizadores reactivos, banner de alertas flash en vivo y botón generador de contingencias).
3. `tasks.json` (Actualización de `TASK-056` a `completed`).
4. `progress/TASK-056.md` (Documentación del progreso).
