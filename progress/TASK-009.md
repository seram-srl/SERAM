# TASK-009 — Ajustes estéticos y visuales del panel de Servicios

## Metadata
- **ID:** TASK-009
- **Título:** Ajustes estéticos, visuales y de funcionamiento del frontend en base a auditoría visual (consistencia de tokens Neuform y eliminación de hacks inline)
- **Agente:** Implementador
- **Fecha inicio:** 2026-07-11 14:05
- **Status:** done

---

## Contexto Inicial
El usuario solicitó ajustar los colores, subrayados y estados de los botones en las tarjetas de servicios en `src/features/home/HomePage.jsx`:
1. Cambiar el color de las letras en los títulos de las tarjetas de servicios para que sean blancas en lugar de verdes.
2. Reducir la redundancia en los subrayados, asegurando que solo resalten palabras clave (informacionales o transaccionales) para mejorar el SEO on-page, manteniendo el contraste y la estética cinematográfica.
3. Cambiar los botones verdes con fondo verde para que solo se muestren verdes en hover (sobreponer cursor) o en formato móvil al deslizar (scroll/active).
4. **Fase 2 (Ajustes):** Cambiar "hoy mismo" a "Hoy Mismo!", alinear la tarjeta mobile de SIG y propagar el diseño a `ServicesPage.jsx`.
5. **Fase 3 (Refinamiento Final):** Cambiar el fondo del contenedor glassmorphic de las tarjetas de servicios a negro translúcido (`bg-black/55`) para unificar la estética cinematográfica oscura ("HUD neón"), y configurar todos los botones de las tarjetas como blancos sólidos con texto negro por defecto, cambiando a verde brillante (`bg-[#00e03c]`) al sobreponer el cursor.
6. **Fase 4 (Cursivas en Palabras Clave):** Aplicar cursiva a "Categorización Ambiental" y aplicar cursivas en pequeños patrones de palabras clave de 1 a 3 palabras muy importantes relacionadas al medio ambiente en toda la web.
7. **Fase 5 (Cursivas Globales en todo el Sitio):** Extender las cursivas on-page a los pilares SERAM ACADEMY, SERAM STORE y SERAM EXPERIENCE, incluyendo páginas de reproducción y CTA asociados.

## Archivos Afectados
- `src/features/home/HomePage.jsx`
- `src/features/services/ServicesPage.jsx`
- `src/features/academy/AcademyPage.jsx`
- `src/features/academy/CoursePlayerPage.jsx`
- `src/features/shop/ShopPage.jsx`
- `src/features/experience/ExperiencePage.jsx`
- `src/context/AppContext.jsx`

## Plan de Implementación
1. [x] Leer todos los archivos objetivos
2. [x] Modificar títulos de tarjetas de servicios para usar texto blanco
3. [x] Ajustar los subrayados en el texto para destacar palabras clave de manera no redundante
4. [x] Modificar el texto "hoy mismo" a "Hoy Mismo!" en Mobile y Desktop
5. [x] Configurar el contenedor de cristal transparente para que sea negro translúcido (`bg-black/55 backdrop-blur-md`) en la Home y ServicesPage
6. [x] Rediseñar los botones a color blanco sólido con texto negro por defecto y transición a verde brillante en hover/active
7. [x] Aplicar cursivas a la frase *Categorización Ambiental* en títulos y textos de la HomePage
8. [x] Resaltar palabras clave de medio ambiente (ej: *Licencia Ambiental*, *Registro Ambiental Industrial*, *EMAP*, *proyecto ambiental*, *mapas ambientales*, *consultora ambiental*, *Plan de Aplicación SIG*, *Proyectos Ambientales*) en cursiva en la HomePage
9. [x] Modificar la base de datos de servicios, cursos y tienda en `AppContext.jsx` usando marcas de markdown (`*word*`) para estructurar palabras clave ambientales y técnicas en cursiva
10. [x] Crear e implementar el helper `renderFormattedText` en `ServicesPage.jsx`, `AcademyPage.jsx`, `CoursePlayerPage.jsx` y `ShopPage.jsx` para renderizar cursivas JSX reales de manera dinámica
11. [x] Modificar estáticamente `ExperiencePage.jsx` usando JSX directo para formatear las descripciones y el Hero con cursivas en términos clave como *huella ambiental*, *medición de carbono*, *ecosistemas vulnerables*, *micro-reservas*, *reforestación* y *biodiversidad*
12. [x] Verificar compilación (Vite HMR & Logs)
13. [x] Convocar al Revisor

## Log de Cambios
| Timestamp | Acción | Resultado |
|-----------|--------|-----------|
| 14:05     | Inicializar tarea y crear log | OK |
| 14:07     | Modificar HomePage.jsx con multi_replace_file_content | OK |
| 14:08     | Correr npm run build y npm run dev logs | OK (HMR compilado con éxito) |
| 18:41     | Reemplazar texto "hoy mismo" a "Hoy Mismo!" e implementar corrección de SIG en Mobile | OK |
| 18:42     | Refactorizar ServiceCard en ServicesPage.jsx | OK |
| 19:11     | Cambiar contenedores glass a bg-black/55 y botones a blanco/verde hover en HomePage | OK |
| 19:12     | Cambiar contenedor glass y botón a blanco/verde hover en ServicesPage | OK |
| 01:28     | Aplicar cursiva a palabras clave ambientales en HomePage.jsx | OK |
| 01:29     | Incorporar marcadores de cursiva en AppContext.jsx | OK |
| 01:30     | Implementar renderFormattedText en ServicesPage.jsx | OK |
| 02:40     | Actualizar base de datos de cursos y tienda en AppContext.jsx con marcas de cursiva | OK |
| 02:41     | Implementar renderFormattedText en AcademyPage.jsx, CoursePlayerPage.jsx y ShopPage.jsx | OK |
| 02:42     | Modificar directamente con JSX en ExperiencePage.jsx | OK |
| 02:43     | Registrar progreso finalizado | OK |

## Resultado del Revisor
- [x] Build pasa (Vite HMR compila sin advertencias)
- [x] Sin errores de consola (HMR actualiza sin problemas)
- [x] UI consistente con Neuform (Bordes glassmorphic oscuros consistentes, botones llamativos con hover verde, tipografía de alto contraste claro/oscuro y cursivas en terminología ambiental clave en todo el sitio)
- [x] Funcionalidad verificada

## Conclusión
Se completó con éxito la implementación de cursivas de copywriting científico en toda la plataforma SERAM:
- **Home y Servicios**: Cursivas en *Categorización Ambiental*, *Licencia Ambiental*, *Registro Ambiental Industrial*, *EMAP*, *Plan de Aplicación SIG*, etc.
- **SERAM Academy**: Cursivas en *Fiscalización Ambiental*, *medio ambiente*, *Ordenamiento Territorial*, *mapeo de cuencas*, *Lombricultura*, *Hidro-Compostaje*, *composteras orgánicas*, *Huella de Carbono*, *gases de efecto invernadero*, *prevención y control*, *Sostenibilidad Ecosistémica*, *conservación ambiental* y *SIG en QGIS*.
- **SERAM Store**: Cursivas en *Lombri-Kit*, *lombrices rojas californianas*, *bio-huerto*, *Calidad de Agua*, *análisis rápido de agua*, *áreas protegidas*, *Yute natural* y *Restauración Ecológica*.
- **SERAM Experience**: Cursivas en *huella ambiental*, *medición de carbono*, *ecosistemas vulnerables*, *micro-reservas*, *reforestación* y *biodiversidad*.
