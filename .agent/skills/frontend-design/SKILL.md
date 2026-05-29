---
name: frontend-design
description: Guidelines and design thinking for constructing visually premium, cinematic UIs in React, Vite, and Tailwind CSS. Focuses on animations (GSAP, Framer Motion), micro-interactions (custom cursors, magnet effect), typography scales, and responsive glassmorphic layouts.
---

# Cinematic Frontend Design System Skill

This skill provides step-by-step guidelines to execute **cinematographic frontend interfaces** that stand out, inspired by the top-tier creative studio **Resn (e.g., Corn Revolution)**.

---

## 1. Cinematic Visual Foundation (Tailwind & CSS)
To achieve a premium "interactive canvas" feel rather than a flat SaaS template:

* **Atmospheric Gradients & Noise:** Use subtle grain/noise overlays to give organic texture to the screen. Pair with slow-moving atmospheric radial gradients in the background.
* **Glassmorphism (Frosted Glass):**
  Use thin borders with high transparency and backdrop blurs to overlay UI components.
  ```html
  <div class="bg-slate-950/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
    <!-- Component Content -->
  </div>
  ```
* **Selection Highlighting:** Customize the browser selection color to match the brand accent:
  ```css
  selection:bg-emerald-500 selection:text-white
  ```

---

## 2. GSAP & Framer Motion (The Motion Engine)
Cinematic websites feel organic because elements interact with scrolling and movement dynamically.

### A. Scroll-Triggered Storytelling (GSAP ScrollTrigger)
Use GSAP to bind scrolling directly to animations (scaling backgrounds, staggered text reveals, horizontal scrolling sections):
```javascript
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Inside Component:
const textRef = useRef(null);
useEffect(() => {
  gsap.fromTo(textRef.current, 
    { opacity: 0, y: 100, rotateX: -20 },
    { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      scrollTrigger: {
        trigger: textRef.current,
        start: "top 80%",
        end: "top 20%",
        scrub: true
      }
    }
  );
}, []);
```

### B. Route Transitions (Framer Motion)
Keep transitions between tabs or pages seamless using `AnimatePresence`. No hard white flashes:
```javascript
import { motion } from 'framer-motion';

const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.02 }}
    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} // Custom cubic-bezier
  >
    {children}
  </motion.div>
);
```

---

## 3. Immersive Micro-Interactions
* **Circular Custom Cursor:** Replace the mouse cursor with a custom React element that tracks coordinates smoothly. When hovering over interactive objects (buttons, courses), make the cursor expand, invert colors, or display a floating text label (e.g. "EXPLORAR").
* **Magnetic Buttons:** Use a lightweight custom hook to pull buttons slightly towards the cursor when the user mouse gets close, giving a premium organic feel.
* **Mask Reveals on Text:** Reveal headings by animating a container with `overflow-hidden` or using CSS `clip-path`, making letters appear to slide out of nothing.

---

## 4. Typography & Layout Hierarchy
* **The "Syne" / "Outfit" Headline Vibe:** Headlines should be large, geometric, and distinct.
* **Golden Spacing:** Space elements generously. Luxury is whitespace. Give content room to breathe.
* **Readable Column Limits:** Limit text blocks to a maximum width of `max-w-2xl` or `max-w-3xl` for high scannability and cinematic look.
