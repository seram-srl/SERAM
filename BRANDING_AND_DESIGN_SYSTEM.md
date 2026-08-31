# ESTRUCTURA DE MARCA, DESIGN SYSTEM Y BUYER PERSONAS DE SIG — SERAM CONSULTORA AMBIENTAL

> **Documento Oficial de Marca y Sistema de Diseño de SERAM**  
> *Versión: 2.0 | Ámbito: Socios Directores, Equipo Técnico, Desarrolladores y Marketing*  
> *Ubicación del archivo:* [`BRANDING_AND_DESIGN_SYSTEM.md`](file:///d:/SERAM/BRANDING_AND_DESIGN_SYSTEM.md)

---

## 📋 TABLA DE CONTENIDOS
1. [Identidad Estratégica de Marca (Brand Core)](#1-identidad-estratégica-de-marca-brand-core)
   - [Misión](#misión)
   - [Visión](#visión)
   - [Valores Fundamentales](#valores-fundamentales)
   - [Personalidad y Tono de Voz](#personalidad-y-tono-de-voz)
2. [Design System & Estilo Visual (Neuform System)](#2-design-system--estilo-visual-neuform-system)
   - [Paleta de Colores Oficial](#paleta-de-colores-oficial)
   - [Sistema Tipográfico](#sistema-tipográfico)
   - [Componentes UI / Glassmorphism](#componentes-ui--glassmorphism)
   - [Estándares Visuales para Cartografía y SIG](#estándares-visuales-para-cartografía-y-sig)
3. [Buyer Personas Específicos para Servicios SIG / GIS](#3-buyer-personas-específicos-para-servicios-sig--gis)
   - [Buyer Persona 1: Ing. Carlos Mendoza (Gerente de Proyectos de Infraestructura y Minería)](#buyer-persona-1-ing-carlos-mendoza)
   - [Buyer Persona 2: Arq. Roberto Arce (Director de Planificación Urbana y Catastro Municipal)](#buyer-persona-2-arq-roberto-arce)
   - [Buyer Persona 3: Ing. Fernando Camacho (Jefe de Sustentabilidad y Agro-SIG / Proyectos Agro-Forestales)](#buyer-persona-3-ing-fernando-camacho)
4. [Guía de Aplicación para Socios y Entregables](#4-guía-de-aplicación-para-socios-y-entregables)

---

## 1. IDENTIDAD ESTRATÉGICA DE MARCA (BRAND CORE)

### Misión
Proveer soluciones integrales de consultoría ambiental, ingeniería de información geográfica (SIG/GIS), auditorías ambientales y capacitación de vanguardia, fusionando precisión científica, rigor normativo y tecnología digital inmersiva para garantizar el desarrollo sostenible y la resiliencia territorial de nuestros clientes.

### Visión
Ser la consultora ambiental y geotecnológica de referencia en la región, reconocida por transformar la gestión ambiental tradicional en una experiencia digital transparente, cinemática y de alto impacto operativo mediante inteligencia espacial, sensores remotos y plataformas SaaS interactivas.

### Valores Fundamentales
1. **Rigor Científico y Normativo:** Cumplimiento irrestricto de la legislación ambiental y los estándares técnicos geográficos (OGC, ISO/TC 211).
2. **Innovación Tecnológica Disruptiva:** Uso de WebGIS, fotogrametría con drones, modelos 3D y plataformas de automatización para entregar datos espaciales vivos.
3. **Sostenibilidad Regenerativa:** Orientación hacia soluciones de impacto positivo que equilibren el desarrollo socioeconómico con la conservación ecosistémica.
4. **Transparencia Operativa:** Comunicación clara, trazable y accesible entre los socios directores, clientes corporativos y fiscalizadores ambientales.

### Personalidad y Tono de Voz
* **Arquetipo de Marca:** El Sabio Tecnológico + El Explorador Ambiental.
* **Tono de Voz:** Profesional, sofisticado, autoritario en conocimiento técnico pero moderno e inmersivo.
* **Vocabulario Clave:** *Inteligencia Territorial, Geodatabase, Monitoreo Multitemporal, Resiliencia Ambiental, Cartografía de Alta Precisión, Licenciamiento Ambiental, WebGIS.*

---

## 2. DESIGN SYSTEM & ESTILO VISUAL (NEUFORM SYSTEM)

Nuestra identidad visual combina la profundidad ambiental con la tecnología digital. Evitamos el verde corporativo plano tradicional y adoptamos una estética **cinemática, oscura y neomórfica-glassmorphic** ("Neuform").

### Paleta de Colores Oficial

| Rol de Color | Nombre técnico | Código HEX | Valores HSL / RGB | Uso Principal |
| :--- | :--- | :--- | :--- | :--- |
| **Fondo Primario** | Slate Profundo | `#010409` | `hsl(224, 71%, 4%)` | Fondo general de plataformas web y presentaciones oscuras. |
| **Fondo Canvas/Neuform** | Esmeralda Oscuro | `#0c1813` | `hsl(150, 80%, 4%)` | Contenedores base, dashboards y mapas oscuros. |
| **Acento Neón Primario** | Verde SERAM Electrónico | `#00e03c` | `hsl(142, 100%, 44%)` | Botones CTA, estados activos, cursores e indicadores clave. |
| **Acento Verde Bosque** | Verde Botánico | `#029907` | `hsl(122, 97%, 30%)` | Resaltados secundarios, insignias y bordes activos. |
| **Acento Dorado Premium** | Oro Técnico SERAM | `#c9a84c` | `hsl(44, 53%, 54%)` | Certificados, sellos de aprobación normativos y acentos B2B. |
| **Acento Alerta / Riesgo** | Naranja Cobre | `#C05621` | `hsl(21, 71%, 45%)` | Zonas de alto riesgo en mapas SIG y alertas de auditoría. |
| **Texto Principal** | Blanco Hielo | `#f8fafc` | `rgb(248, 250, 252)` | Titulares, cuerpo de texto y etiquetas legibles. |
| **Texto Muted** | Gris Translucido | `rgba(255,255,255,0.55)` | - | Subtítulos, descripciones secundarias y metadatos. |
| **Borde Glass** | Blanco Vidrio | `rgba(255,255,255,0.12)` | - | Bordes de tarjetas `.neuform-card` e interfaces flotantes. |

---

### Sistema Tipográfico

#### 1. Tipografía para Titulares y Encabezados (Display & Headings)
* **Fuente:** `Outfit` (Alternativa secundaria: `Syne`)
* **Estilo:** Geométrico, moderno, con peso Bold (700/800) y amplio espaciado entre letras (`letter-spacing: -0.02em` a `0.05em`).
* **Aplicación:** Títulos H1, H2, H3 en la web, portadas de informes SIG y títulos de dashboards.

#### 2. Tipografía para Cuerpo de Texto e Interfaces (Body & UI)
* **Fuente:** `Inter` (Alternativa secundaria: `Plus Jakarta Sans`)
* **Estilo:** Clean sans-serif de máxima legibilidad en pantallas oscuras. Peso Regular (400) y Medium (500).
* **Aplicación:** Párrafos, tablas de atributos SIG, menús de navegación, botones y descripciones.

#### 3. Tipografía Secundaria para Documentos Normativos y Legales
* **Fuente:** `Merriweather` (Serif)
* **Estilo:** Clásico y de autoridad legal/académica.
* **Aplicación:** Textos legales de Estudios de Impacto Ambiental, compendios normativos y certificados en PDF.

---

### Componentes UI / Glassmorphism

#### Tarjeta Neuform (`.neuform-card`)
```css
background: rgba(255, 255, 255, 0.12);
backdrop-filter: blur(20px);
border: 1px solid rgba(18, 108, 15, 0.2);
border-radius: 1.25rem; /* 20px */
box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 20px 40px rgba(0, 0, 0, 0.15);
```

#### Botón de Acción Principal (`.neuform-btn-primary`)
```css
background: rgba(0, 224, 60, 0.08);
border: 1px solid rgba(0, 224, 60, 0.4);
color: #ffffff;
font-family: 'Outfit', sans-serif;
font-weight: 800;
letter-spacing: 0.1em;
text-transform: uppercase;
border-radius: 9999px;
```

---

### Estándares Visuales para Cartografía y SIG

Cuando el equipo de SERAM elabore **mapas impresos, visores WebGIS o capas vectoriales**, se deben respetar los siguientes códigos de color:

* **Cobertura Vegetal / Bosque Conservado:** `#029907` / `#00e03c`
* **Cuerpos de Agua / Cuencas:** `#00b4d8` (Azul Cian)
* **Zonas Urbanas / Predios:** `#8d99ae` (Gris Neutro)
* **Áreas de Vulnerabilidad / Riesgo Ambiental:** `#C05621` (Naranja Cobre) / `#e63946` (Rojo Carmesí)
* **Líneas de Servidumbre / Vías / Infraestructura:** `#F6E05E` (Amarillo Técnico)
* **Tipografía en Mapas:** `Inter` o `Roboto` para los nombres de capas y leyendas cartográficas.

---

## 3. BUYER PERSONAS ESPECÍFICOS PARA SERVICIOS SIG / GIS

A continuación se presentan los **tres Buyer Personas varones** diseñados específicamente para el segmento de servicios de **Sistemas de Información Geográfica (SIG / GIS)** y consultoría ambiental que ofrece SERAM.

---

### BUYER PERSONA 1: Ing. Carlos Mendoza
> **Cargo:** Gerente de Proyectos de Infraestructura, Minería y Energía  
> **Sector:** Empresa Privada de Construcción / Extractiva (Mediana/Grande)  
> **Edad:** 44 años | **Ubicación:** Santa Cruz / La Paz / Operaciones en campo  

```
   ┌─────────────────────────────────────────────────────────────┐
   │ ING. CARLOS MENDOZA                                         │
   │ "Necesito datos espaciales precisos con drones y satélite   │
   │  para evitar retrasos en licencias ambientales y obras."    │
   └─────────────────────────────────────────────────────────────┘
```

#### 1. Perfil y Contexto Laboral
Carlos lidera la ejecución de proyectos de infraestructura civil (carreteras, puentes, líneas de transmisión) y proyectos mineros o hidrocarburíferos. Supervisa equipos multidisciplinarios de ingenieros civiles, geólogos y topógrafos. Es práctico, orientado a resultados y altamente sensible a los costos por retrasos en obra o multas ambientales.

#### 2. Tareas Diarias que requieren SIG / GIS
* Definir y validar trazados de líneas de servidumbre y vías de acceso a campamentos.
* Supervisar el avance físico de obras mediante ortofomapas y modelos digitales de terreno (MDT/MDS).
* Verificar la superposición predial y concesiones mineras/forestales antes de iniciar movimiento de tierras.
* Presentar reportes técnicos de avance espacial a la junta directiva y a los fiscalizadores ambientales estatales.

#### 3. Dolores y Frustraciones ("Pain Points")
* **Planos topográficos desactualizados o imprecisos** que generan errores en el cálculo de volúmenes de corte y relleno.
* **Demoras de meses en la obtención de Licencias Ambientales** por falta de mapas temáticos (cobertura vegetal, hidrología) ajustados a la normativa.
* **Proveedores tradicionales de cartografía que entregan PDFs estáticos inservibles** en lugar de geodatabases interactivas o visores WebGIS.
* **Falta de monitoreo multitemporal:** No poder demostrar fehacientemente qué impacto ambiental existía antes de que su empresa iniciara operaciones.

#### 4. Objetivos y Necesidades ("Gain Points")
* Obtener **levantamientos con Drones / Fotogrametría RTK y LIDAR** de alta precisión en tiempo récord.
* Disponer de un **visor WebGIS privado** donde pueda consultar capas de superposición predial, servidumbres e impacto ambiental desde su laptop o tablet en campo.
* Contar con un equipo de consultores que se encargue de todo el **expediente SIG para la Ficha Ambiental** sin observaciones por parte de la autoridad competente.

#### 5. Propuesta de Valor de SERAM para Carlos
* **Levantamiento Aero-fotogramétrico & LIDAR de Precisión:** Procesamiento de nubes de puntos y modelos 3D de terreno listos para CAD/GIS.
* **Plataforma WebGIS SERAM Services:** Entregables no solo en PDF, sino en un panel interactivo seguro (Supabase + Mapbox/Leaflet/3D) donde Carlos y sus clientes revisan avances en tiempo real.
* **Seguimiento Multitemporal Satelital (Sentinel/Planet):** Auditorías de línea base ambiental previas al proyecto para blindar a la empresa contra falsas denuncias de contaminación o deforestación.

#### 6. Estrategia de Comunicación y Cierre
* **Mensaje clave:** *"Transformamos tus datos de campo en un visor WebGIS en tiempo real. Cero observaciones en tu Licencia Ambiental y precisión centimétrica para tu obra."*
* **Canal preferido:** Reunión presencial / Presentación interactiva B2B en laptop, LinkedIn profesional, correo institucional.

---

### BUYER PERSONA 2: Arq. Roberto Arce
> **Cargo:** Director de Planificación Urbana, Catastro y Medio Ambiente  
> **Sector:** Gobierno Autónomo Municipal / Gobierno Departamental (Sector Público)  
> **Edad:** 48 años | **Ubicación:** Municipio Capital / Intermedio  

```
   ┌─────────────────────────────────────────────────────────────┐
   │ ARQ. ROBERTO ARCE                                           │
   │ "Necesitamos modernizar el catastro y la zonificación de    │
   │  riesgos del municipio con una Geodatabase unificada."      │
   └─────────────────────────────────────────────────────────────┘
```

#### 1. Perfil y Contexto Laboral
Roberto es el encargado de ordenar el crecimiento urbano del municipio, regularizar propiedades, controlar asentamientos humanos en zonas de riesgo y gestionar el Plan de Ordenamiento Territorial (PLOT/POUT). Enfrenta presiones políticas, presupuesto público fiscalizado y una constante demanda de transparencia por parte de la ciudadanía.

#### 2. Tareas Diarias que requieren SIG / GIS
* Actualización de la mancha urbana y delimitación de distritos y manzaneos.
* Identificación de zonas vulnerables a inundaciones, deslizamientos de tierra y riberas de ríos.
* Gestión del Catastro Urbano y Rural para la fiscalización y recaudación de impuestos prediales.
* Aprobación de planes de uso de suelo (PLUS) y licencias de construcción.

#### 3. Dolores y Frustraciones ("Pain Points")
* **Información geográfica fragmentada en múltiples formatos obsoletos** (Shapefiles dispersos en USBs, planos dwg desactualizados, archivos impresos en papel).
* **Falta de personal técnico capacitado internamente** para procesar análisis espacial complejo o mantener servidores GIS.
* **Desastres naturales repetitivos (inundaciones/riadas)** sin un mapa oficial de análisis multicriterio (AHP/GIS) de riesgos geotécnicos.
* **Conflictos de límites intermunicipales o vecinales** por falta de cartografía oficial georreferenciada.

#### 4. Objetivos y Necesidades ("Gain Points")
* Implementar un **Sistema de Información Geográfica Municipal (SIG-MUN)** centralizado en la nube.
* Disponer de **Estudios de Vulnerabilidad Climática y Mapas de Riesgo Ambiental** certificados para gestionar financiamiento externo o créditos de emergencia.
* Capacitar a su equipo técnico mediante un programa especializado (**SERAM Academy**) para dar sostenibilidad al sistema.

#### 5. Propuesta de Valor de SERAM para Roberto
* **Consultoría Integral de Ordenamiento Territorial & SIG:** Delimitación cartográfica, digitalización catastral y modelado de cuencas hidrológicas.
* **Infraestructura de Datos Espaciales (IDE) Municipal:** Implementación de geodatabases espaciales con estándares internacionales y visualización pública/privada.
* **Programa de Capacitación Institucional (SERAM Academy):** Cursos prácticos a medida para el personal técnico municipal en QGIS, ArcGIS Pro y teledetección.

#### 6. Estrategia de Comunicación y Cierre
* **Mensaje clave:** *"Modernice la gestión territorial de su municipio con una Geodatabase unificada y mapas de riesgo acreditados para proteger a la comunidad y maximizar la recaudación catastral."*
* **Canal preferido:** Presentación formal en Consejo Municipal/Alcaldía, licitaciones públicas, talleres institucionales.

---

### BUYER PERSONA 3: Ing. Fernando "Fer" Camacho
> **Cargo:** Jefe de Sustentabilidad, Agro-SIG y Certificación Forestal  
> **Sector:** Agroindustria / Sector Forestal / Proyectos de Carbono y Conservación  
> **Edad:** 36 años | **Ubicación:** Santa Cruz / Beni / Zona Agroindustrial  

```
   ┌─────────────────────────────────────────────────────────────┐
   │ ING. FERNANDO CAMACHO                                       │
   │ "Requiero monitoreo satelital en tiempo real para           │
   │  certificar producción sostenible y libre de deforestación." │
   └─────────────────────────────────────────────────────────────┘
```

#### 1. Perfil y Contexto Laboral
Fernando es un profesional joven, dinámico y tecnológicamente nativo. Se encarga de gestionar miles de hectáreas agrícolas o forestales, garantizando el cumplimiento de los Planes de Ordenamiento Predial (POP), la certificación de cero deforestación (exigida para exportación a la Unión Europea u otros mercados) y la medición de biomasa/captura de carbono.

#### 2. Tareas Diarias que requieren SIG / GIS
* Procesamiento de índices espectrales de vegetación (NDVI, NDWI, EVI) para evaluar la salud de los cultivos o bosques.
* Detección temprana de focos de calor, incendios forestales y cambio de uso de suelo no autorizado.
* Elaboración de mapas de aptitud mayor de la tierra y zonificación de servidumbres ecológicas.
* Elaboración de reportes de sostenibilidad para auditores internacionales de certificación (FSC, RTRS, Carbon Credits).

#### 3. Dolores y Frustraciones ("Pain Points")
* **Procesar imágenes satelitales toma demasiado tiempo informático y requiere computadoras de altísima gama** que su empresa no siempre actualiza.
* **Riesgo de perder certificaciones internacionales de exportación** si no demuestra la trazabilidad geográfica origen-destino de cada lote.
* **Dificultad para calcular el volumen de madera o carbono almacenado** con métodos tradicionales de inventarios de campo lentos y costosos.

#### 4. Objetivos y Necesidades ("Gain Points")
* Automatizar el **monitoreo satelital mensual de deforestación y salud vegetal** en sus predios.
* Contar con **mapas de biomasa y carbono forestal** calculados mediante sensores remotos y validación en campo.
* Contratar una consultora ágil que entienda la urgencia agropecuaria y entregue datos en formatos abiertos y compatibles con maquinaria agrícola (GPS/ISOBUS).

#### 5. Propuesta de Valor de SERAM para Fernando
* **Monitoreo Satelital Automatizado & Teledetección Agrícola:** Algoritmos de análisis multitemporal con Sentinel-2 y PlanetScope para índices NDVI/EVI en tiempo real.
* **Inventario Forestal & Estimación de Carbono por Teledetección:** Modelos de regresión espacial combinando datos LIDAR/Dron con parcelas de campo.
* **Plataforma de Trazabilidad Agro-SIG:** Mapas interactivos listos para auditorías de cumplimiento normativo ambiental europeo e internacional.

#### 6. Estrategia de Comunicación y Cierre
* **Mensaje clave:** *"Trazabilidad geográfica instantánea y monitoreo satelital NDVI para tus predios. Demuestra el cumplimiento de cero deforestación y protege tus exportaciones."*
* **Canal preferido:** WhatsApp Business, demostración directa de dashboard en vivo, eventos agrícolas y seminarios web técnicos.

---

## 4. GUÍA DE APLICACIÓN PARA SOCIOS Y ENTREGABLES

Para mantener la consistencia de marca en todos nuestros servicios y proyectos, los **3 Socios Directores** de SERAM debemos aplicar las siguientes reglas en cada material producido:

### A. Documentos Técnicos e Informes SIG (PDF)
1. **Carátula:** Utilizar el encabezado en `Outfit Bold`, fondo oscuro `#010409` o blanco limpio con franja lateral `#0c1813`, logotipo oficial de SERAM y código de proyecto.
2. **Mapas Adjuntos:** Todo mapa cartográfico producido por SERAM debe incluir:
   - Grilla de coordenadas geográficas/UTM (WGS-84).
   - Membrete oficial de SERAM con el logo, fecha, escala, proyección y nombre del profesional responsable.
   - Colores reglamentarios del Design System para capas vectoriales.
3. **Firmas y Sellos:** Usar el acento Dorado Técnico (`#c9a84c`) para los sellos de aprobación de auditoría y firmas digitales de los ingenieros socios.

### B. Presentaciones Comerciales y Cotizaciones (B2B)
1. **Formato:** Presentaciones en formato 16:9 con fondo oscuro cinemático (`#010409` con gradientes esmeralda).
2. **Propuestas SIG:** Enfocar siempre la propuesta en el **Buyer Persona** correspondiente (Carlos = Eficiencia y Cero Retrasos; Roberto = Ordenamiento y Solidez Institucional; Fernando = Trazabilidad y Tecnología Satelital).
3. **Inclusión de Demos Interactivas:** No mostrar solo diapositivas estáticas; abrir el mapa WebGIS o el portal de prueba en vivo para generar impacto visual ("Wow Factor").

### C. Plataforma Digital y WebGIS (Desarrollo Frontend)
1. **Tokens CSS:** Utilizar las clases consolidadas en `src/index.css` (`.neuform-card`, `.neuform-btn-primary`, `.neuform-badge`, `.cinematic-bg`).
2. **Modo de Visualización:** Priorizar la interfaz oscura Neuform con contraste de texto `#f8fafc` y acentos neón `#00e03c` para mapas interactivos.

---
> **Aprobado por los Socios Directores de SERAM Consultora Ambiental y Geotecnológica**
