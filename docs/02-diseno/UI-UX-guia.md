# Guía de Estilo Visual y UI/UX Cinematográfico - PROYECTO SERAM

Esta guía define las pautas visuales, paletas de colores, tipografías y la filosofía de animación necesarias para transformar la web de SERAM en una experiencia inmersiva cinematográfica inspirada en agencias de arte digital como **Resn (Corn Revolution)**.

---

## 1. Filosofía de Diseño: "La Browser-Movie"
El objetivo es que el usuario no sienta que está navegando por un panel de administración aburrido, sino presenciando una narrativa fluida sobre el medio ambiente.

### Reglas de Oro UI/UX:
* **Generosidad de Espacio:** El lujo digital es el espacio en blanco (o en este caso, oscuro). Evita comprimir tarjetas de texto; deja que los elementos respiren ampliamente.
* **Profundidad Física (Glassmorphism):** Superpón modales e interfaces usando un desenfoque de fondo profundo (`backdrop-filter: blur(16px)`) con bordes translúcidos reflectantes.
* **Transiciones Líquidas:** Ningún cambio de sección debe ser abrupto. Los elementos que salen deben desvanecerse o contraerse antes de que los nuevos entren.

---

## 2. Paleta de Colores Curada
Evitamos los verdes planos o brillantes "estándar". Usamos una paleta basada en HSL que evoca naturaleza, profundidad tecnológica y misticismo forestal.

```text
Fondo Primario (60%):    Slate Oscuro Profundo (HSL 224, 71%, 4%)   --> #010409
Fondo Secundario (30%):  Emerald muy oscuro (HSL 150, 80%, 2%)       --> #010a05
Acento Premium (10%):    Verde SERAM Electrónico (HSL 142, 100%, 44%) --> #00e03c
Borde/Detalles:          Blanco Translúcido (rgba(255,255,255,0.08))
```

---

## 3. Tipografía Expresiva
Para dar carácter e impacto, importaremos fuentes de Google Fonts en el archivo principal de estilos:

* **Titulares (Headline Font):** `Outfit` o `Syne` (Diseño geométrico, ancho y brutalista. Transmite modernidad técnica).
* **Cuerpo y Controles UI (Body Font):** `Inter` o `Plus Jakarta Sans` (Sleek, altamente legible a escalas pequeñas y en interfaces densas).

---

## 4. Animaciones y Wow-Factor (Resn Style)
Para recrear la fluidez e interacción de [Corn Revolution by Resn](https://cornrevolution.resn.global/#):

### A. Cursor Circular Personalizado (Custom Cursor)
* **Comportamiento:** Una pequeña bola verde que sigue al mouse con un leve retraso físico (inercia).
* **Hover de Acción:** Al pasar sobre una tarjeta de curso o proyecto, el cursor se expande y despliega la palabra "VER" o "PLAY" dentro de su circunferencia con color invertido.

### B. Scroll de Revelado (Scrollytelling with GSAP)
* **Texto Líquido:** Las palabras de los encabezados principales no aparecen de golpe; se revelan letra a letra deslizándose desde una máscara invisible inferior.
* **Fondo Reactivo:** A medida que el usuario hace scroll, las capas del fondo forestal se desplazan a diferentes velocidades (Efecto Parallax) y el brillo radial del fondo se desplaza siguiendo la rueda del ratón.

### C. Efecto Imán (Magnetic Interaction)
* Los botones interactivos de llamada a la acción (CTA) y el logotipo de SERAM tienen un "efecto imán". Cuando el puntero del mouse se acerca a menos de 40px del botón, el botón se desplaza suavemente de su eje atraído por la posición del cursor, dando una sensación orgánica y premium.
