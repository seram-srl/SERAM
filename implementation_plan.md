# Plan de Implementación Integral — TASK-103

## Título de la Tarea
**TASK-103: Purga Integral de Accesos, Perfil y Rastro del Ex-Socio Fabricio Sebastian Orosco Larrea y Reestructuración a Dirección Bipartita (Ing. Diego Barrientos e Ing. Fernando Araujo)**

---

## 1. Contexto y Objetivos
En conformidad con la aprobación del plan de contingencia societaria:
1. Revocar de forma irreversible cualquier acceso directivo, privilegios administrativos y presencia de Fabricio Sebastian Orosco Larrea (`sebastiansbs51@gmail.com`).
2. Consolidar la estructura de liderazgo de SERAM S.R.L. en sus dos socios fundadores leales: **Ing. Diego Barrientos** (Dirección General / SIG) e **Ing. Fernando Araujo** (Dirección de Proyectos y Regulación).
3. Purgar perfiles RPG, avatares en la Oficina Virtual, asignaciones en actividades y referencias en cursos de Academy.

---

## 2. Matriz de Archivos Afectados

| Archivo | Ubicación | Modificaciones Planificadas |
|---|---|---|
| `ProtectedRoute.jsx` | `src/components/shared/ProtectedRoute.jsx` | Reducir `PARTNER_EMAILS` exclusivamente a Diego y Fernando. |
| `SecretAuthModal.jsx` | `src/components/ui/SecretAuthModal.jsx` | Eliminar a Fabricio de `PARTNERS_LIST`. |
| `AppContext.jsx` | `src/context/AppContext.jsx` | Eliminar de `registeredUsers`, `validEmails`, reasignar actividades iniciales y cuotas de horas, purgar avatar y limpiar reglas anti-cheat. |
| `PartnerDashboard.jsx` | `src/features/partner-portal/PartnerDashboard.jsx` | Reestructurar directiva a 2 socios fundadores en métricas, selectores y textos narrativos. |
| `ActivitiesAndClientsModule.jsx` | `src/features/partner-portal/ActivitiesAndClientsModule.jsx` | Purgar de `ENG_OPTIONS`, actualizar contador a "2 Socios Fundadores" y actualizar texto anti-cheat. |
| `ClientsModule.jsx` | `src/features/partner-portal/ClientsModule.jsx` | Eliminar opción en selector de ingenieros. |
| `VirtualOfficeView.jsx` | `src/features/partner-portal/VirtualOfficeView.jsx` | Eliminar avatar NPC, convertir Despacho 11 a Estación de Operaciones Técnicas, eliminar waypoints de asiento. |
| `OfficePathfinder.js` | `src/features/partner-portal/OfficePathfinder.js` | Renombrar estación de trabajo a "Estación Central de Drones y Monitoreo". |
| `PartnerProfileRPGModule.jsx` | `src/features/partner-portal/PartnerProfileRPGModule.jsx` | Purgar perfil RPG de Fabricio. |
| `avatarCatalog.js` | `src/features/partner-portal/avatar/avatarCatalog.js` | Purgar configuración predeterminada de avatar. |
| `SpecialMissionsModule.jsx` | `src/features/partner-portal/gamification/SpecialMissionsModule.jsx` | Reasignar misiones y descripciones de 3 a 2 socios. |
| `TalentTreeConstellation.jsx` / `Radial.jsx` / `Structured.jsx` / `talentTreeData.js` | `src/features/partner-portal/gamification/` | Limpiar `unlockedFor` y reasignar responsabilidades periciales. |
| `AcademyPage.jsx` | `src/features/academy/AcademyPage.jsx` | Reasignar instructor de cursos a "Equipo Técnico SERAM". |

---

## 3. Verificación
- Cero errores en `npm run build` y `npx eslint`.
- `git grep -i "sebastiansbs51"` y `git grep -i "Fabricio"` sin referencias directivas activas en `src/`.
- Commit atómico y push a `origin/main`.
