# Progreso — TASK-053: Árbol de Talentos Gamificado tipo Constelación RPG (TalentTreeConstellation.jsx)

**Fecha:** 2026-10-11  
**Estado:** Completed  
**Responsable:** Agente Líder & Implementador  

## 1. Contexto y Objetivos Cumplidos
Alineado con las directrices directivas, principios de gamificación RPG y la referencia visual de constelaciones (`media_1791755248283_0d262b6a.png`):
- Se investigaron syllabi globales de Ingeniería Ambiental y Ciencias Ecológicas (Stanford, UC Berkeley, ETH Zurich, Wageningen, IEMA/ISEP, IFC EDGE, Verra, Protocolo GHG, Kunming-Montreal 30x30).
- Se reformularon las ramas troncales para superar clasificaciones estrechas y reflejar la amplitud moderna de la profesión.
- Se eliminaron cuellos de botella y prerrequisitos secuenciales forzados: cualquier socio puede desbloquear especialidades (ej. Certificación EDGE Expert o Mercados de Carbono) acreditando su capacitación o diplomado real sin bloqueos artificiales de auditorías previas o silvicultura.
- Se reubicaron los Sistemas de Información Geográfica (SIG) y Teledetección como competencias metodológicas transversales e instrumentales aplicadas en cada rama, evitando penalizar perfiles legales, corporativos o biológicos.

---

## 2. Las 5 Constelaciones Canónicas Implementadas
1. **Rama I: Evaluación de Impacto Ambiental & Riesgo (EIA)** (`#00e03c`)
   - Fundamentos regulatorios, SIG ambiental aplicado a faenas mineras e hidrocarburos, auditoría/fiscalización ambiental, análisis cuantitativo de riesgos (HAZOP/What-If) y Peritaje Judicial Ambiental (Apex).
2. **Rama II: Gestión Ambiental, Sostenibilidad & EDGE** (`#f59e0b`)
   - Sistemas de gestión ISO 14001/5001, Consultoría Certificada EDGE Expert (IFC/GBCI), Seguridad y Salud Ocupacional (SYSO/ISO 45001), y Dirección de Sostenibilidad Corporativa & ESG (Apex).
3. **Rama III: Cambio Climático & Mercados de Carbono** (`#00c0ff`)
   - Inventarios GEI (ISO 14064 / GHG Protocol), Monitoreo Satelital MRV (Sentinel/Landsat), Formulación de Proyectos de Carbono (Art. 6 / Verra VCS), Modelos de Riesgo Climático TCFD, y Estructuración de Finanzas Climáticas (Apex).
4. **Rama IV: Conservación de Biodiversidad, Restauración & NbS** (`#10b981`)
   - Ecología de comunidades, zonificación 30x30, créditos de naturaleza y biocréditos, ingeniería ecológica / bioingeniería de taludes, Soluciones Basadas en la Naturaleza (NbS - UICN) y Dirección de Capital Natural (Apex).
5. **Rama V: Economía Circular, Bioprocesos & Residuos** (`#a855f7`)
   - Planes municipales GIRSU (Ley 755), biotecnología ambiental y compostaje/lombricultura industrial, Análisis de Ciclo de Vida (ACV / ISO 14040), diseño de Plantas PTAR/Biorremediación, y Arquitectura de Economía Circular Industrial (Apex).

---

## 3. Arquitectura Técnica y Componentes Creados
1. **`src/features/partner-portal/gamification/talentTreeData.js`**:
   - Modelo de datos completo con 26 nodos distribuidos en 4 Tiers (Operativo, Especialista, Estratégico y Apex), coordenadas espaciales `(x, y)` optimizadas para proyección de constelación, conductos de energía (`TALENT_CONNECTIONS`) y 3 puentes de sinergia transversal inter-ramal (`isCrossBridge`).
   - Helpers de persistencia en `localStorage` (`getSavedTalentState`, `saveTalentStatus`).
2. **`src/features/partner-portal/gamification/TalentTreeConstellation.jsx`**:
   - Canvas SVG interactivo con filtros SVG de resplandor (`feGaussianBlur`, `feMerge`), líneas con partículas luminosas animadas (`animateMotion`), orbes estelares y rombos Apex magistrales.
   - Nodos SIG instrumentales con anillos de radar satelital discontinuo (`stroke-dasharray="3,3"`).
   - HUD gamificado superior con Puntos de Talento (TP), Maestría Activa (%), Arquetipo dinámico y contadores de inversión por constelación inspirados en la interfaz de referencia.
   - Barra de filtros por constelación para aislar o contrastar ramas.
   - Modal Drawer lateral con información técnica exhaustiva, impacto y facturación en SERAM, certificaciones sugeridas, vinculación a SERAM Academy, formulario de registro de folio/URL y switch de validación administrativa.
3. **`src/features/partner-portal/PartnerProfileRPGModule.jsx`**:
   - **Desacoplamiento Ergonómico:** Se separó el Árbol de Talentos del espacio estrecho del análisis multidimensional.
   - **Columna Izquierda:** Tarjeta de personaje RPG, atuendo, insignias, expediente (CV, SIB, RENCA) y ahora la **Biografía & Trayectoria Profesional**.
   - **Columna Derecha:** Radar Pentagonal algorítmico, desglose de los 5 ejes, enlace directo al árbol y el **Dictamen de Idoneidad Técnica según el Radar** posicionado directamente debajo del radar.
   - **Gran Bloque Inferior 100% Ancho:** El Árbol de Talentos ahora disfruta de un lienzo panorámico independiente (tipo Oficina Virtual), con altura ampliada (780px - 960px), botón de **Pantalla Completa**, titulares estelares en el cénit para cada constelación y badges con fondo oscuro para máxima nitidez de código y especialidad.

---

## 4. Verificación y Resultados
- **Build de producción:** `npm run build` ejecutado exitosamente con 0 errores (2907 módulos transformados).
- **Verificación Live DevTools:** Validado en `http://localhost:5173/dashboard` en la pestaña *Perfil y Habilidades*, comprobando la nitidez de etiquetas, el botón de Pantalla Completa y el dictamen bajo el radar.
- **Integridad:** Compatibilidad con Neuform Tokens, paleta de colores oficial y preservación total de la arquitectura de la aplicación.

---

## 5. Refinamiento Interactivo de Navegación, Pan, Zoom y Modo Pantalla Completa (Fase 2)
1. **Navegación Pan & Zoom Fluida:**
   - Arrastre interactivo (`isDragging`, `cursor-grab` / `cursor-grabbing`) para explorar libremente el mapa estelar.
   - Zoom con rueda del ratón (`wheel`) y soporte multitáctil (pinch-to-zoom en móviles/tablets), acotado entre 0.5x y 2.4x con animación suave.
   - Dock flotante de navegación (inferior derecho): controles de `+`, `-`, indicador de escala (`%`), botón **Centrar** (`RotateCcw`), botón de autoenfoque a la base **Raíz / TRONCO-00** (`Crosshair`), y maximizar/minimizar.
   - Enfoque cinemático automático al pulsar cualquiera de las 5 constelaciones en la barra de filtros (pan y zoom a 1.35x centrado en la constelación seleccionada).
   - Discriminación entre arrastre y clic: el desplazamiento durante el paneo no dispara accidentalmente la apertura de fichas técnicas.

2. **Modo Pantalla Completa 100% Inmersivo (Lienzo Limpio):**
   - Implementado mediante `ReactDOM.createPortal(..., document.body)` con capa superior `z-[150]`, evitando que stacking contexts intermedios del dashboard recorten o sobrepongan elementos.
   - Bloqueo automático del scroll de fondo (`document.body.style.overflow = 'hidden'`).
   - Ocultamiento de tarjetas voluminosas superiores en modo fullscreen para maximizar el lienzo estelar (`100vw x 100vh`).
   - HUD superior flotante translúcido con badge del socio, puntos de talento (TP), selector rápido de constelaciones y botón para salir de pantalla completa.
   - Atajos de teclado: tecla `Escape` cierra primero cualquier modal abierto, o sale limpiamente del modo pantalla completa.

3. **Ficha Técnica en Modal Centrado:**
   - Modal flotante centrado (`z-[160]`) con backdrop blur para consultar o gestionar evidencia sin estorbar la navegación visual del mapa estelar.
   - Tooltip calibrado en espacio de coordenadas SVG que se desplaza y escala milimétricamente junto al lienzo.

---

## 6. Ampliación de Espaciado, Fondo Galáctico Animado, Tipografía Aumentada y Carga de Certificados en PDF (Fase 3)
1. **Separación Generosa de Nodos y Ramas (`1500x950`):**
   - Sistema de coordenadas ampliado a `viewBox="0 0 1500 950"` en `talentTreeData.js`.
   - Distribución horizontal desahogada de las 5 ramas principales a lo largo de 1500px, eliminando cualquier estrechez o solapamiento entre nodos contiguos (distancia mínima > 100px-200px entre nodos de la misma rama).
   - Tronco común `TRONCO-00` reubicado y centrado en `(750, 840)`.

2. **Fondo Galáctico Dinámico y Sutil:**
   - Tres nebulosas profundas con gradientes radiales difusos (esmeralda, oro y cian) con animación suave de respiración (`nebulaBreathe`).
   - Dos galaxias espirales lejanas con rotación ultra lenta (`galaxySpinSlow` a 180s y 220s).
   - 85 estrellas cósmicas deterministas con centelleo orgánico desfasado (`starTwinkle`) que no interfieren con la legibilidad técnica de los nodos.

3. **Tipografía Aumentada y Alta Legibilidad en la Ficha Técnica:**
   - Escala tipográfica incrementada en badges, título principal (`text-2xl sm:text-3xl font-black`), descripciones técnicas (`text-base leading-relaxed`) y módulos de formación.
   - Alto contraste garantizado bajo la paleta Neuform.

4. **Vincular Certificados y Diplomas en Formato PDF:**
   - Integración de zona de subida drag-and-drop para archivos `.pdf` (hasta 8 MB).
   - Conversión y almacenamiento local seguro mediante DataURL (`FileReader`), extrayendo el nombre del archivo y tamaño formateado (KB/MB).
   - Acciones interactivas para "Ver PDF" en nueva pestaña del navegador y "Quitar archivo".
   - Persistencia vinculada a la clave del socio en `localStorage`.

