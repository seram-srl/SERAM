# Documento de Requerimientos Técnicos (TRD) - PROYECTO SERAM

Este documento especifica la infraestructura, arquitectura de código, seguridad y herramientas necesarias para el desarrollo e implementación del **PROYECTO SERAM**.

---

## 1. Stack Tecnológico

### Frontend:
* **Entorno de Compilación:** Vite (Rápido y de recarga en caliente ultrarrápida).
* **Biblioteca Principal:** React 18.x.
* **Estilado:** Tailwind CSS v3.x (para maquetación ágil) + CSS Vanilla personalizado (para efectos de canvas y cursores).
* **Bibliotecas de Animación:**
  * **GSAP (GreenSock Animation Platform) + ScrollTrigger:** Para control absoluto de líneas de tiempo de animación complejas asociadas al scroll.
  * **Framer Motion:** Para transiciones de rutas fluidas y animaciones de modales e interfaces de usuario básicas.
  * **Lucide React:** Para iconografía técnica y minimalista.

### Backend & Base de Datos (Serverless BaaS):
* **Plataforma:** **Supabase** (PostgreSQL).
* **Servicios Utilizados:**
  * **Database:** Base de datos relacional Postgres para el almacenamiento de cursos, perfiles, horas y proyectos.
  * **Authentication:** Gestión de registro e inicio de sesión de usuarios (incluyendo acceso de socios directores).
  * **Storage:** Repositorio en la nube seguro para la carga de PDFs de auditorías ambientales y assets de vídeo.

---

## 2. Especificación de Seguridad

### A. Políticas de Row Level Security (RLS) en Postgres
Para proteger la información relacional, RLS se activará en todas las tablas de Supabase. El acceso a los datos se evaluará a través de roles definidos en la tabla `profiles`:

```sql
-- Estudiante de Academy:
-- Solo puede leer registros de 'enrollments' donde su auth.uid() coincida con el id del alumno.
-- No puede ver proyectos corporativos en absoluto.

-- Cliente Corporativo:
-- Solo puede leer registros en la tabla 'projects' donde su client_id sea igual a su auth.uid().

-- Socio Directivo (Admin):
-- Cuenta con un bypass de seguridad o política 'FOR ALL' que le permite crear, editar y eliminar cualquier registro de proyectos, cursos o horas en el sistema.
```

### B. Control de Origen (CORS)
El backend de Supabase y las funciones servidoras asociadas limitarán el acceso cruzado restringiendo las cabeceras CORS:
* **Producción:** Solo se aceptan peticiones HTTP desde `https://seram-platform.vercel.app` y `https://seram.com`.
* **Desarrollo:** Permite únicamente peticiones locales desde `http://localhost:5173`.
* Cualquier intento de consultar la API de base de datos desde una web copia o herramienta de scripting externa será cancelado por el motor de red.

### C. Cabeceras de Seguridad (Security Headers)
Al desplegar el frontend en **Vercel** o **Netlify**, se configurará un archivo de encabezados (`vercel.json` o `netlify.toml`) que inyectará las siguientes cabeceras en el navegador del usuario:
1. `Content-Security-Policy (CSP):` Previene ataques XSS forzando la carga de scripts únicamente desde dominios autorizados (ej. Supabase, Stripe).
2. `X-Frame-Options: DENY:` Evita ataques de clickjacking (embebido de la web en marcos invisibles).
3. `Strict-Transport-Security (HSTS):` Fuerza al navegador a usar conexiones cifradas SSL (HTTPS) de forma perpetua.

---

## 3. Integración de Servicios Cloud "Small Business"
Para emular la capacidad operativa de un gran ERP/SaaS comercial con costes mínimos:
* **Pasarela de Pago Stripe:** Se integra mediante Stripe Checkout. Al recibir el webhook de pago aprobado, se dispara un trigger en la base de datos para habilitar la matrícula del curso al estudiante de forma automática.
* **Time Tracker Interno:** Una interfaz dedicada registra la marca de tiempo (timestamp) de inicio y fin cuando un socio trabaja en un proyecto. Estos datos se consolidan en la tabla `time_logs` y alimentan un panel de métricas de coste de horas directivas.
