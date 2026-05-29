# Documento de Requerimientos de Producto (PRD) - PROYECTO SERAM

Este documento define la visión del producto, objetivos de negocio, perfiles de usuario y las especificaciones funcionales para la plataforma digital unificada de **SERAM (Servicios Ambientales)**.

---

## 1. Visión General del Producto
El **PROYECTO SERAM** es una plataforma web y SaaS modular que integra tres pilares estratégicos en una única experiencia inmersiva:
1. **SERAM ACADEMY (E-Learning):** Capacitación y cursos ambientales premium.
2. **SERAM SERVICES (B2B):** Seguimiento y descarga de auditorías, cartografía y consultoría corporativa.
3. **SERAM EXPERIENCE (B2C/B2B):** Gestión de voluntariados, ecoturismo y eventos regenerativos.
4. **PORTAL DE SOCIOS (Intranet):** Área directiva secreta para el control de tiempo, facturación, CRM y métricas operativas de la empresa.

---

## 2. Objetivos Estratégicos
* **Cinematografía Visual:** Ofrecer una experiencia visual que rompa la estética clásica corporativa, inspirada en estándares creativos tridimensionales e interactivos (estilo Resn).
* **Escalabilidad y Seguridad:** Proteger la propiedad intelectual de los cursos y la confidencialidad de los estudios de impacto ambiental de clientes corporativos usando Supabase y Row Level Security (RLS).
* **Replicabilidad de Módulos:** Crear código modular e independiente (Single Responsibility Principle) para que los módulos puedan ser reutilizados en otros emprendimientos del grupo.

---

## 3. Perfiles de Usuario (Personas)
La plataforma interactúa con cuatro audiencias claramente diferenciadas:

| Rol | Descripción | Permisos Clave |
| :--- | :--- | :--- |
| **Socio Director (Admin)** | Los 3 ingenieros fundadores de SERAM. | Control total, métricas del negocio, CRM, aprobación de proyectos, registro de horas. |
| **Cliente Corporativo** | Empresas que contratan consultorías (ej. Mineras, Municipios). | Ver avance de sus proyectos contratados, descargar Auditorías en PDF aprobadas. |
| **Alumno (Academy)** | Estudiantes, profesionales o docentes de medio ambiente. | Comprar cursos, ver videoclases, descargar certificados digitales en PDF. |
| **Visitante General** | Público interesado en la marca o voluntariados. | Explorar la web pública, tienda de merchandise ecológico y registrarse a eventos. |

---

## 4. Especificación de Módulos (Requerimientos Funcionales)

### 4.1 Módulo 1: Experiencia Cinematográfica (Home & Marca)
* **Narrativa Visual:** Scroll interactivo (scrollytelling) que narre el propósito de SERAM con animaciones dinámicas de textos y fondos orgánicos.
* **Acceso Directivo:** Un portal secreto activable mediante un patrón o combinación no evidente en el frontend (ej. clicks rápidos en el logotipo) que despliegue el modal de inicio de sesión de Socios.

### 4.2 Módulo 2: SERAM Academy
* **Pasarela de Cursos:** Catálogo inmersivo con filtros de categoría.
* **Control de Acceso:** Clases gratuitas accesibles con registro básico. Clases Premium bloqueadas a nivel de base de datos hasta confirmación de pago.
* **Generación de PDFs:** Emisión de certificados automáticos con metadatos del alumno al concluir los cursos.

### 4.3 Módulo 3: SERAM Services
* **Panel del Cliente:** Interfaz segura donde cada cliente corporativo ve una barra de progreso de su consultoría en tiempo real.
* **Descarga Segura:** Repositorio de archivos PDF (estudios de impacto, mapas) protegidos para descarga exclusiva del cliente autorizado.

### 4.4 Módulo 4: Portal Directivo (CRM & Control de Negocio)
* **CRM e Ingresos:** Gráficos intuitivos con el total de ventas (Academy + Tienda) y cotizaciones de servicios en curso.
* **Seguimiento de Proyectos:** Asignación de ingenieros líderes a proyectos específicos.
* **Time Tracker:** Registro de tiempo aplicado por cada socio a cada proyecto para control de costos operativos.
