import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

/**
 * Generador procedural de texturas Pixel Art de oficina
 * Genera texturas ricas estilo pixel art idénticas a la imagen de referencia (madera, escritorios, plantas, alfombras, etc.)
 * directamente en canvas HTML5 en memoria, SIN necesidad de crear decenas de archivos PNG externos.
 */
function generarTexturasOficina(scene) {
  // 1. Suelo de Parquet de Madera Cálida (32x32)
  if (!scene.textures.exists('suelo_parquet')) {
    const cv = document.createElement('canvas');
    cv.width = 32;
    cv.height = 32;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#b89368'; // Tono base madera cálida
    ctx.fillRect(0, 0, 32, 32);

    // Listones de parquet entrelazados
    ctx.fillStyle = '#cbab84';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillRect(16, 16, 16, 16);

    // Líneas de unión y vetas de madera
    ctx.fillStyle = '#9b764f';
    ctx.fillRect(0, 15, 32, 1);
    ctx.fillRect(15, 0, 1, 32);
    ctx.fillRect(0, 31, 32, 1);
    ctx.fillRect(31, 0, 1, 32);

    // Detalle de vetas finas
    ctx.fillStyle = '#dbbfa0';
    ctx.fillRect(2, 4, 12, 1);
    ctx.fillRect(18, 20, 12, 1);
    ctx.fillRect(4, 10, 8, 1);
    ctx.fillRect(20, 26, 8, 1);

    scene.textures.addCanvas('suelo_parquet', cv);
  }

  // 2. Suelo Baldosa Comercial / Claro (32x32)
  if (!scene.textures.exists('suelo_baldosa')) {
    const cv = document.createElement('canvas');
    cv.width = 32;
    cv.height = 32;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#d6cbbe';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#ebe3d9';
    ctx.fillRect(1, 1, 30, 30);
    ctx.fillStyle = '#baa996';
    ctx.fillRect(0, 31, 32, 1);
    ctx.fillRect(31, 0, 1, 32);

    scene.textures.addCanvas('suelo_baldosa', cv);
  }

  // 3. Suelo de Moqueta Azul / Ejecutivo (32x32)
  if (!scene.textures.exists('suelo_moqueta')) {
    const cv = document.createElement('canvas');
    cv.width = 32;
    cv.height = 32;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#2b3a4a';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#344659';
    ctx.fillRect(1, 1, 30, 30);
    ctx.fillStyle = '#3d5267';
    ctx.fillRect(4, 4, 24, 24);

    scene.textures.addCanvas('suelo_moqueta', cv);
  }

  // 4. Escritorio Ejecutivo de Madera con Monitor (64x40)
  if (!scene.textures.exists('mueble_escritorio')) {
    const cv = document.createElement('canvas');
    cv.width = 64;
    cv.height = 40;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Sombra proyectada
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(2, 6, 62, 34);

    // Tablero principal madera nogal
    ctx.fillStyle = '#6e492b';
    ctx.fillRect(0, 4, 60, 32);
    ctx.fillStyle = '#8b5e39';
    ctx.fillRect(2, 6, 56, 28);
    ctx.fillStyle = '#a67448';
    ctx.fillRect(3, 7, 54, 3); // Brillo superior

    // Monitor LED
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(22, 0, 20, 16);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(24, 2, 16, 12);
    // Pantalla encendida (gráfico de cuencas/código)
    ctx.fillStyle = '#059669';
    ctx.fillRect(25, 3, 14, 10);
    ctx.fillStyle = '#34d399';
    ctx.fillRect(27, 5, 10, 2);
    ctx.fillRect(27, 8, 7, 2);

    // Teclado y alfombrilla
    ctx.fillStyle = '#334155';
    ctx.fillRect(23, 18, 18, 7);
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(25, 20, 14, 3);

    // Taza de café / papeles
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(48, 12, 6, 8);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(8, 16, 8, 10);

    scene.textures.addCanvas('mueble_escritorio', cv);
  }

  // 5. Puesto Técnico con Doble Monitor (72x40)
  if (!scene.textures.exists('mueble_tecnico')) {
    const cv = document.createElement('canvas');
    cv.width = 72;
    cv.height = 40;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Tablero madera
    ctx.fillStyle = '#5c3a21';
    ctx.fillRect(0, 4, 72, 32);
    ctx.fillStyle = '#7a4e2d';
    ctx.fillRect(2, 6, 68, 28);

    // Doble monitor
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(10, 0, 22, 15);
    ctx.fillRect(36, 0, 22, 15);

    // Pantalla 1 (SIG / QGIS mapa satelital)
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(12, 2, 18, 11);
    ctx.fillStyle = '#60a5fa';
    ctx.fillRect(14, 4, 14, 2);
    ctx.fillStyle = '#34d399';
    ctx.fillRect(16, 7, 10, 4);

    // Pantalla 2 (Hidráulica / Telemetría)
    ctx.fillStyle = '#14532d';
    ctx.fillRect(38, 2, 18, 11);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(40, 4, 14, 2);
    ctx.fillRect(40, 8, 9, 3);

    scene.textures.addCanvas('mueble_tecnico', cv);
  }

  // 6. Mesa Grande de Reuniones Ovalada / Directorio (90x48)
  if (!scene.textures.exists('mesa_reuniones')) {
    const cv = document.createElement('canvas');
    cv.width = 90;
    cv.height = 48;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Sombra
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(4, 6, 82, 40);

    // Madera caoba oscura
    ctx.fillStyle = '#4a2511';
    ctx.fillRect(2, 4, 86, 40);
    ctx.fillStyle = '#633418';
    ctx.fillRect(4, 6, 82, 36);
    ctx.fillStyle = '#7a4220';
    ctx.fillRect(6, 8, 78, 4);

    // Dispositivo de conferencia / micrófonos en el centro
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(40, 20, 10, 8);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(44, 23, 2, 2);

    // Carpetas y cuadernos alrededor
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(12, 14, 8, 6);
    ctx.fillRect(70, 14, 8, 6);
    ctx.fillRect(24, 30, 8, 6);
    ctx.fillRect(58, 30, 8, 6);

    scene.textures.addCanvas('mesa_reuniones', cv);
  }

  // 7. Estantería con Libros / Archivero (48x28)
  if (!scene.textures.exists('estanteria_libros')) {
    const cv = document.createElement('canvas');
    cv.width = 48;
    cv.height = 28;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#3d2413';
    ctx.fillRect(0, 0, 48, 28);
    ctx.fillStyle = '#52321b';
    ctx.fillRect(2, 2, 44, 24);

    // Balda 1
    ctx.fillStyle = '#2c190c';
    ctx.fillRect(2, 12, 44, 2);

    // Libros de colores
    const bookColors = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#0284c7', '#ea580c'];
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = bookColors[i % bookColors.length];
      ctx.fillRect(4 + i * 6, 3, 5, 9);
      ctx.fillStyle = bookColors[(i + 3) % bookColors.length];
      ctx.fillRect(4 + i * 6, 14, 5, 11);
    }

    scene.textures.addCanvas('estanteria_libros', cv);
  }

  // 8. Planta de Oficina / Ficus en Maceta (24x30)
  if (!scene.textures.exists('planta_ficus')) {
    const cv = document.createElement('canvas');
    cv.width = 24;
    cv.height = 30;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Maceta de terracota
    ctx.fillStyle = '#9a3412';
    ctx.fillRect(5, 16, 14, 13);
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(6, 17, 12, 4);

    // Hojas frondosas verdes
    ctx.fillStyle = '#14532d';
    ctx.fillRect(2, 4, 20, 12);
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(4, 2, 16, 10);
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(6, 0, 12, 6);
    ctx.fillRect(8, 6, 4, 3);
    ctx.fillRect(14, 7, 4, 3);

    scene.textures.addCanvas('planta_ficus', cv);
  }

  // 9. Silla Ergonómica Giratoria (20x20)
  if (!scene.textures.exists('silla_oficina')) {
    const cv = document.createElement('canvas');
    cv.width = 20;
    cv.height = 20;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(4, 4, 12, 12);
    ctx.fillStyle = '#334155';
    ctx.fillRect(5, 5, 10, 10);
    ctx.fillStyle = '#475569';
    ctx.fillRect(6, 2, 8, 4); // Respaldo

    scene.textures.addCanvas('silla_oficina', cv);
  }

  // 10. Alfombra Decorativa Geométrica (60x36)
  if (!scene.textures.exists('alfombra_decorativa')) {
    const cv = document.createElement('canvas');
    cv.width = 60;
    cv.height = 36;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(0, 0, 60, 36);
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(3, 3, 54, 30);
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(6, 6, 48, 24);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(10, 10, 40, 16);

    scene.textures.addCanvas('alfombra_decorativa', cv);
  }

  // 11. Mostrador Largo de Atención / Showroom Comercial (120x32)
  if (!scene.textures.exists('mostrador_comercial')) {
    const cv = document.createElement('canvas');
    cv.width = 120;
    cv.height = 32;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#261b14';
    ctx.fillRect(0, 4, 120, 28);
    ctx.fillStyle = '#452c1e';
    ctx.fillRect(2, 6, 116, 24);
    ctx.fillStyle = '#6b4530';
    ctx.fillRect(4, 8, 112, 4);

    // Muestrarios de sensores y drones
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(12, 14, 16, 8); // Sonda multiparamétrica
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(44, 13, 20, 10); // Drone kit
    ctx.fillStyle = '#eab308';
    ctx.fillRect(80, 14, 14, 8); // Caja de reactivos

    scene.textures.addCanvas('mostrador_comercial', cv);
  }

  // 12. Bóveda / Caja Fuerte Finanzas (36x36)
  if (!scene.textures.exists('boveda_finanzas')) {
    const cv = document.createElement('canvas');
    cv.width = 36;
    cv.height = 36;
    const ctx = cv.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 36, 36);
    ctx.fillStyle = '#334155';
    ctx.fillRect(2, 2, 32, 32);
    ctx.fillStyle = '#475569';
    ctx.fillRect(4, 4, 28, 28);

    // Rueda de combinación dorada
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.arc(18, 18, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(16, 16, 4, 4);

    // Indicador digital verde
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(8, 6, 8, 3);

    scene.textures.addCanvas('boveda_finanzas', cv);
  }
}

const MiniversoSERAM = ({ openModal }) => {
  const gameRef = useRef(null);
  const openModalRef = useRef(openModal);

  useEffect(() => {
    openModalRef.current = openModal;
  }, [openModal]);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 1024,
      height: 768,
      parent: gameRef.current,
      backgroundColor: '#1b1714',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      scene: {
        preload: preload,
        create: create
      }
    };

    const game = new Phaser.Game(config);

    function preload() {
      // Generar automáticamente todas las texturas pixel art en memoria
      generarTexturasOficina(this);
    }

    function create() {
      const scene = this;

      // Suelo general de pasillos de la oficina
      for (let x = 0; x < 1024; x += 32) {
        for (let y = 0; y < 768; y += 32) {
          const tile = scene.add.image(x + 16, y + 16, 'suelo_parquet');
          tile.setTint(0x776655); // Tono más oscuro para pasillos
        }
      }

      // Definición de las 11 zonas basadas en el croquis exacto
      const zones = [
        {
          id: 'admin',
          name: 'Administración',
          icon: '📋',
          x: 100, y: 100, w: 200, h: 150,
          color: 0x4a90e2,
          floor: 'suelo_parquet',
          furniture: [
            { type: 'estanteria_libros', ox: 100, oy: 20 },
            { type: 'mueble_escritorio', ox: 90, oy: 60 },
            { type: 'silla_oficina', ox: 90, oy: 88 },
            { type: 'planta_ficus', ox: 25, oy: 25 }
          ]
        },
        {
          id: 'direccion',
          name: 'Dirección',
          icon: '🏛️',
          x: 320, y: 100, w: 200, h: 250,
          color: 0x9013fe,
          floor: 'suelo_parquet',
          furniture: [
            { type: 'estanteria_libros', ox: 100, oy: 20 },
            { type: 'alfombra_decorativa', ox: 100, oy: 120 },
            { type: 'mueble_escritorio', ox: 100, oy: 110 },
            { type: 'silla_oficina', ox: 100, oy: 140 },
            { type: 'planta_ficus', ox: 30, oy: 26 },
            { type: 'planta_ficus', ox: 170, oy: 26 }
          ]
        },
        {
          id: 'reuniones',
          name: 'Sala de Reuniones',
          icon: '🤝',
          x: 100, y: 270, w: 200, h: 150,
          color: 0xd0021b,
          floor: 'suelo_moqueta',
          furniture: [
            { type: 'mesa_reuniones', ox: 100, oy: 75 },
            { type: 'silla_oficina', ox: 40, oy: 75 },
            { type: 'silla_oficina', ox: 160, oy: 75 },
            { type: 'silla_oficina', ox: 100, oy: 42 },
            { type: 'silla_oficina', ox: 100, oy: 108 },
            { type: 'planta_ficus', ox: 25, oy: 25 }
          ]
        },
        {
          id: 'service',
          name: 'Service',
          icon: '🛰️',
          x: 320, y: 370, w: 200, h: 150,
          color: 0xf5a623,
          floor: 'suelo_parquet',
          furniture: [
            { type: 'mueble_tecnico', ox: 100, oy: 65 },
            { type: 'silla_oficina', ox: 100, oy: 95 },
            { type: 'estanteria_libros', ox: 150, oy: 20 },
            { type: 'planta_ficus', ox: 25, oy: 25 }
          ]
        },
        {
          id: 'academy',
          name: 'Academy',
          icon: '🎓',
          x: 100, y: 440, w: 200, h: 150,
          color: 0x7ed321,
          floor: 'suelo_parquet',
          furniture: [
            { type: 'estanteria_libros', ox: 60, oy: 20 },
            { type: 'estanteria_libros', ox: 140, oy: 20 },
            { type: 'mueble_escritorio', ox: 100, oy: 75 },
            { type: 'silla_oficina', ox: 100, oy: 105 },
            { type: 'planta_ficus', ox: 25, oy: 120 }
          ]
        },
        {
          id: 'experience',
          name: 'Experience',
          icon: '⛰️',
          x: 100, y: 610, w: 200, h: 120,
          color: 0x417505,
          floor: 'suelo_parquet',
          furniture: [
            { type: 'mueble_escritorio', ox: 85, oy: 55 },
            { type: 'silla_oficina', ox: 85, oy: 85 },
            { type: 'planta_ficus', ox: 170, oy: 35 },
            { type: 'planta_ficus', ox: 25, oy: 35 }
          ]
        },
        {
          id: 'operaciones',
          name: 'Operaciones',
          icon: '⚙️',
          x: 540, y: 100, w: 250, h: 250,
          color: 0x8b572a,
          floor: 'suelo_parquet',
          furniture: [
            { type: 'mueble_tecnico', ox: 80, oy: 70 },
            { type: 'silla_oficina', ox: 80, oy: 100 },
            { type: 'mueble_tecnico', ox: 170, oy: 70 },
            { type: 'silla_oficina', ox: 170, oy: 100 },
            { type: 'estanteria_libros', ox: 125, oy: 20 },
            { type: 'planta_ficus', ox: 30, oy: 215 },
            { type: 'planta_ficus', ox: 220, oy: 215 }
          ]
        },
        {
          id: 'marketing',
          name: 'Marketing y Ventas',
          icon: '📣',
          x: 540, y: 370, w: 250, h: 150,
          color: 0xbd10e0,
          floor: 'suelo_parquet',
          furniture: [
            { type: 'mueble_escritorio', ox: 90, oy: 65 },
            { type: 'silla_oficina', ox: 90, oy: 95 },
            { type: 'alfombra_decorativa', ox: 180, oy: 75 },
            { type: 'planta_ficus', ox: 220, oy: 28 }
          ]
        },
        {
          id: 'social',
          name: 'Social Media',
          icon: '📱',
          x: 320, y: 540, w: 200, h: 190,
          color: 0x50e3c2,
          floor: 'suelo_parquet',
          furniture: [
            { type: 'mueble_escritorio', ox: 100, oy: 85 },
            { type: 'silla_oficina', ox: 100, oy: 115 },
            { type: 'planta_ficus', ox: 30, oy: 30 },
            { type: 'planta_ficus', ox: 170, oy: 30 }
          ]
        },
        {
          id: 'finanzas',
          name: 'Finanzas',
          icon: '💰',
          x: 540, y: 540, w: 250, h: 190,
          color: 0xf8e71c,
          floor: 'suelo_moqueta',
          furniture: [
            { type: 'boveda_finanzas', ox: 200, oy: 50 },
            { type: 'mueble_escritorio', ox: 90, oy: 85 },
            { type: 'silla_oficina', ox: 90, oy: 115 },
            { type: 'planta_ficus', ox: 30, oy: 30 }
          ]
        },
        {
          id: 'comercial',
          name: 'Comercial',
          icon: '🛒',
          x: 810, y: 100, w: 200, h: 630,
          color: 0xb8e986,
          floor: 'suelo_baldosa',
          furniture: [
            { type: 'mostrador_comercial', ox: 100, oy: 80 },
            { type: 'silla_oficina', ox: 60, oy: 115 },
            { type: 'silla_oficina', ox: 140, oy: 115 },
            { type: 'alfombra_decorativa', ox: 100, oy: 230 },
            { type: 'mueble_escritorio', ox: 100, oy: 320 },
            { type: 'silla_oficina', ox: 100, oy: 350 },
            { type: 'mostrador_comercial', ox: 100, oy: 470 },
            { type: 'planta_ficus', ox: 35, oy: 40 },
            { type: 'planta_ficus', ox: 165, oy: 40 },
            { type: 'planta_ficus', ox: 35, oy: 580 },
            { type: 'planta_ficus', ox: 165, oy: 580 }
          ]
        }
      ];

      // Cartel superior del Miniverso SERAM
      const topBanner = scene.add.rectangle(512, 45, 520, 36, 0x14100c, 0.95);
      topBanner.setStrokeStyle(1.5, 0xc9a84c);
      scene.add.text(512, 45, '🏛️ SERAM SRL · MINIVERSO CORPORATIVO & OFICINA CENTRAL', {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#facc15',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      // Renderizar cada una de las 11 habitaciones con estética detallada
      zones.forEach(z => {
        const cx = z.x + z.w / 2;
        const cy = z.y + z.h / 2;
        const rw = z.w - 10;
        const rh = z.h - 10;

        // 1. Pavimento de la habitación según su textura
        const floorTilesGroup = scene.add.container(0, 0);
        for (let fx = z.x + 5; fx < z.x + z.w - 15; fx += 32) {
          for (let fy = z.y + 5; fy < z.y + z.h - 15; fy += 32) {
            const tile = scene.add.image(fx + 16, fy + 16, z.floor);
            tile.setDepth(1);
            floorTilesGroup.add(tile);
          }
        }

        // Tinte ambiental sutil del departamento para que tenga su identidad de color
        const ambientTint = scene.add.rectangle(cx, cy, rw, rh, z.color, 0.14);
        ambientTint.setDepth(2);

        // 2. Muros perimetrales y zócalos de madera (estilo Imagen 2)
        const wallBorder = scene.add.rectangle(cx, cy, rw, rh);
        wallBorder.setFillStyle(0x000000, 0.0);
        wallBorder.setStrokeStyle(4, 0x3d271d); // Madera oscura
        wallBorder.setDepth(5);

        // Moldura interior fina dorada
        const innerBorder = scene.add.rectangle(cx, cy, rw - 6, rh - 6);
        innerBorder.setFillStyle(0x000000, 0.0);
        innerBorder.setStrokeStyle(1, 0x664632);
        innerBorder.setDepth(6);

        // 3. Muebles y detalles decorativos colocados en cada habitación
        z.furniture.forEach(item => {
          const itemX = z.x + item.ox;
          const itemY = z.y + item.oy;
          const furn = scene.add.image(itemX, itemY, item.type);
          furn.setDepth(8);
        });

        // 4. Placa identificadora elegante del departamento (Pill superior)
        const badgeWidth = Math.min(rw - 20, 160);
        const badgeY = z.y + 16;
        const badgeBg = scene.add.rectangle(cx, badgeY, badgeWidth, 22, 0x0f172a, 0.92);
        badgeBg.setStrokeStyle(1, z.color, 0.9);
        badgeBg.setDepth(20);

        const badgeText = scene.add.text(cx, badgeY, `${z.icon} ${z.name}`, {
          fontFamily: 'sans-serif',
          fontSize: '11px',
          color: '#ffffff',
          fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(21);

        // 5. Hitbox interactivo transparente que cubre toda la habitación
        const roomHitbox = scene.add.rectangle(cx, cy, rw, rh, 0xffffff, 0.0001)
          .setInteractive({ useHandCursor: true })
          .setDepth(30);

        // Resplandor de selección hover (halo brillante blanco/dorado)
        const hoverGlow = scene.add.rectangle(cx, cy, rw, rh);
        hoverGlow.setFillStyle(0xffffff, 0.0);
        hoverGlow.setStrokeStyle(0, 0xffffff);
        hoverGlow.setDepth(25);

        // Eventos Hover: Iluminar habitación y agrandar placa
        roomHitbox.on('pointerover', () => {
          hoverGlow.setStrokeStyle(3, 0xffffff);
          ambientTint.setFillStyle(z.color, 0.28);
          badgeBg.setFillStyle(z.color, 0.95);
          badgeText.setColor('#0f172a');
        });

        roomHitbox.on('pointerout', () => {
          hoverGlow.setStrokeStyle(0, 0xffffff);
          ambientTint.setFillStyle(z.color, 0.14);
          badgeBg.setFillStyle(0x0f172a, 0.92);
          badgeText.setColor('#ffffff');
        });

        // Evento Click: Apertura del modal en React y Time Tracker
        roomHitbox.on('pointerdown', () => {
          // Pulso visual al hacer clic
          scene.tweens.add({
            targets: ambientTint,
            alpha: { from: 0.5, to: 0.14 },
            duration: 350,
            ease: 'Power2'
          });

          if (openModalRef.current) openModalRef.current(z.name);
          iniciarTimeTracker(z.name);
        });
      });
    }

    return () => {
      game.destroy(true);
    };
  }, []);

  // Función para registrar el inicio de actividad en Supabase/N8N
  const iniciarTimeTracker = (departamento) => {
    fetch('https://tu-webhook-n8n.com/webhook/time-tracker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        socio: 'Socio_Activo',
        area: departamento,
        accion: 'iniciar_reloj',
        timestamp: new Date().toISOString()
      })
    }).catch(err => {
      console.warn('[n8n Webhook] time-tracker emitido para:', departamento);
    });
  };

  return (
    <div
      ref={gameRef}
      style={{
        width: '1024px',
        margin: '0 auto',
        border: '2px solid #443224',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
      }}
    />
  );
};

export default MiniversoSERAM;
