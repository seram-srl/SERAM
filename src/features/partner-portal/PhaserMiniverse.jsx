import React, { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, BookOpenCheck, Globe, ShoppingBag, DollarSign,
  Shield, Check, X, ArrowUpRight, Clock, FileText, ExternalLink,
  Users, Activity, Sparkles, Send, RefreshCw, MapPin, Laptop,
  HelpCircle, Maximize2, Minimize2
} from 'lucide-react';

/**
 * Procedural Pixel Art Texture Generator
 * Creates crisp, retro pixel art textures dynamically so no external image loading can fail.
 */
function createPixelArtTextures(scene) {
  // 1. Wood Floor Tile (32x32)
  if (!scene.textures.exists('floor_parquet')) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Base warm wood
    ctx.fillStyle = '#261b14';
    ctx.fillRect(0, 0, 32, 32);

    // Parquet planks
    ctx.fillStyle = '#31231a';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillRect(16, 16, 16, 16);

    // Plank lines & grain
    ctx.fillStyle = '#1c130d';
    ctx.fillRect(0, 15, 32, 1);
    ctx.fillRect(15, 0, 1, 32);
    ctx.fillStyle = '#3d2b20';
    ctx.fillRect(2, 4, 12, 1);
    ctx.fillRect(18, 20, 12, 1);
    ctx.fillRect(4, 10, 8, 1);
    ctx.fillRect(20, 26, 8, 1);

    scene.textures.addCanvas('floor_parquet', canvas);
  }

  // 2. Wall Tile (32x32)
  if (!scene.textures.exists('wall_tile')) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#131920';
    ctx.fillRect(0, 0, 32, 32);
    ctx.fillStyle = '#1b2430';
    ctx.fillRect(0, 0, 32, 24);
    ctx.fillStyle = '#0b0f14';
    ctx.fillRect(0, 24, 32, 8); // baseboard
    ctx.fillStyle = '#00e03c';
    ctx.fillRect(0, 24, 32, 1); // neon trim

    scene.textures.addCanvas('wall_tile', canvas);
  }

  // 3. Desk Texture (80x48)
  if (!scene.textures.exists('desk_wood')) {
    const canvas = document.createElement('canvas');
    canvas.width = 80;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Desk surface
    ctx.fillStyle = '#4a3525';
    ctx.fillRect(0, 8, 80, 40);
    ctx.fillStyle = '#5c4330';
    ctx.fillRect(2, 10, 76, 36);

    // Desk edge / bevel
    ctx.fillStyle = '#332317';
    ctx.fillRect(0, 44, 80, 4);

    // Dual Monitors
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(14, 0, 24, 18);
    ctx.fillRect(42, 0, 24, 18);

    // Screen contents (green GIS / code)
    ctx.fillStyle = '#022c22';
    ctx.fillRect(16, 2, 20, 14);
    ctx.fillRect(44, 2, 20, 14);
    ctx.fillStyle = '#00e03c';
    ctx.fillRect(18, 5, 16, 2);
    ctx.fillRect(18, 9, 10, 2);
    ctx.fillRect(46, 5, 8, 2);
    ctx.fillRect(46, 9, 14, 2);

    // Laptop & Coffee
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(32, 26, 16, 12);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(66, 28, 6, 6);

    scene.textures.addCanvas('desk_wood', canvas);
  }

  // 4. Character Sprites: Diego Barrientos (Services - Executive Suit)
  if (!scene.textures.exists('sprite_diego')) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Hair
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(10, 4, 12, 6);
    // Face
    ctx.fillStyle = '#fbcfe8';
    ctx.fillRect(10, 10, 12, 8);
    // Glasses
    ctx.fillStyle = '#00e03c';
    ctx.fillRect(11, 12, 4, 2);
    ctx.fillRect(17, 12, 4, 2);
    // Suit & Tie
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, 18, 16, 18);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(14, 18, 4, 12);
    ctx.fillStyle = '#f59e0b'; // Gold tie
    ctx.fillRect(15, 20, 2, 8);
    // Legs
    ctx.fillStyle = '#020617';
    ctx.fillRect(10, 36, 5, 10);
    ctx.fillRect(17, 36, 5, 10);

    scene.textures.addCanvas('sprite_diego', canvas);
  }

  // 5. Character: Fernando Araujo (Hidráulica - Engineer)
  if (!scene.textures.exists('sprite_fernando')) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Hair
    ctx.fillStyle = '#292524';
    ctx.fillRect(10, 4, 12, 6);
    // Face
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(10, 10, 12, 8);
    // Blue Polo
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(8, 18, 16, 18);
    // Blueprint roll in hand
    ctx.fillStyle = '#e0f2fe';
    ctx.fillRect(5, 24, 3, 10);
    // Pants
    ctx.fillStyle = '#334155';
    ctx.fillRect(10, 36, 5, 10);
    ctx.fillRect(17, 36, 5, 10);

    scene.textures.addCanvas('sprite_fernando', canvas);
  }

  // 6. Character: Fabricio Orosco (Experience - Outdoor Expeditioner)
  if (!scene.textures.exists('sprite_fabricio')) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Expedition Cap
    ctx.fillStyle = '#d97706';
    ctx.fillRect(8, 4, 16, 5);
    // Face
    ctx.fillStyle = '#fcd34d';
    ctx.fillRect(10, 9, 12, 8);
    // Outdoor Vest
    ctx.fillStyle = '#15803d';
    ctx.fillRect(8, 17, 16, 18);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(13, 17, 6, 16);
    // Cargo pants
    ctx.fillStyle = '#78350f';
    ctx.fillRect(10, 35, 5, 11);
    ctx.fillRect(17, 35, 5, 11);

    scene.textures.addCanvas('sprite_fabricio', canvas);
  }

  // 7. Character: Tutor IA (Academy)
  if (!scene.textures.exists('sprite_tutor')) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Graduation Cap
    ctx.fillStyle = '#4f46e5';
    ctx.fillRect(6, 2, 20, 4);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(22, 6, 2, 5);
    // Face
    ctx.fillStyle = '#e0e7ff';
    ctx.fillRect(10, 8, 12, 8);
    // Robe
    ctx.fillStyle = '#312e81';
    ctx.fillRect(8, 16, 16, 20);
    ctx.fillStyle = '#a5b4fc';
    ctx.fillRect(14, 16, 4, 18);
    // Feet
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(10, 36, 5, 10);
    ctx.fillRect(17, 36, 5, 10);

    scene.textures.addCanvas('sprite_tutor', canvas);
  }

  // 8. Character: Store Bot (SERAM Store)
  if (!scene.textures.exists('sprite_store_bot')) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Antenna
    ctx.fillStyle = '#e11d48';
    ctx.fillRect(15, 2, 2, 5);
    // Metallic Head
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(9, 7, 14, 10);
    // Cyan Visor / Eyes
    ctx.fillStyle = '#06b6d4';
    ctx.fillRect(11, 10, 10, 4);
    // Chassis
    ctx.fillStyle = '#475569';
    ctx.fillRect(8, 18, 16, 17);
    ctx.fillStyle = '#00e03c';
    ctx.fillRect(13, 22, 6, 6); // Core light
    // Track / Rollers
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(8, 36, 16, 10);

    scene.textures.addCanvas('sprite_store_bot', canvas);
  }

  // 9. Golden Vault & Dividend Safe (Finanzas)
  if (!scene.textures.exists('vault_finanzas')) {
    const canvas = document.createElement('canvas');
    canvas.width = 48;
    canvas.height = 54;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    ctx.fillStyle = '#78350f';
    ctx.fillRect(4, 8, 40, 42);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(6, 10, 36, 38);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(8, 12, 32, 34);

    // Dial lock
    ctx.fillStyle = '#fef3c7';
    ctx.beginPath();
    ctx.arc(24, 29, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.fillRect(23, 23, 2, 12);
    ctx.fillRect(18, 28, 12, 2);

    // Floating hologram chart
    ctx.fillStyle = '#00e03c';
    ctx.fillRect(12, 2, 4, 6);
    ctx.fillRect(18, 0, 4, 8);
    ctx.fillRect(24, 1, 4, 7);
    ctx.fillRect(30, -2, 4, 10);

    scene.textures.addCanvas('vault_finanzas', canvas);
  }

  // 10. Player Avatar (Gather.town style)
  if (!scene.textures.exists('sprite_player')) {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Hair
    ctx.fillStyle = '#44403c';
    ctx.fillRect(10, 4, 12, 6);
    // Face
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(10, 10, 12, 8);
    // Green hoodie (SERAM brand)
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(8, 18, 16, 18);
    ctx.fillStyle = '#86efac';
    ctx.fillRect(14, 20, 4, 12);
    // Jeans
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(10, 36, 5, 10);
    ctx.fillRect(17, 36, 5, 10);

    scene.textures.addCanvas('sprite_player', canvas);
  }
}

/**
 * Phaser Miniverse Component
 */
export default function PhaserMiniverse({
  activeServices = [],
  courses = [],
  timeLogs = [],
  currentSocio,
  onNavigateModule,
  onOpenMeritocracy
}) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [n8nStatus, setN8nStatus] = useState('idle'); // idle, syncing, synced
  const [playerCoordinates, setPlayerCoordinates] = useState({ x: 480, y: 320 });

  // Departments Config
  const DEPARTMENTS = {
    services: {
      id: 'services',
      name: 'SERAM SERVICES',
      subtitle: 'Ingeniería Ambiental, SIG & Proyectos B2B',
      lead: 'Ing. Diego Barrientos',
      role: 'Socio Fundador · Dirección General',
      color: 'blue',
      badge: 'B2B & Minería',
      desc: 'Formulación y ejecución de líneas base hidrogeoquímicas, monitoreo de mercurio (Hg), cartografía satelital y trámites ante ministerios y municipios.',
      stats: [
        { label: 'Proyectos Activos', value: activeServices.length },
        { label: 'Caso Principal', value: activeServices[0]?.client || 'G.A.M. Palos Blancos' },
        { label: 'Código', value: activeServices[0]?.code || 'SRM-2026-B2B-01' },
        { label: 'Presupuesto', value: `Bs. ${(activeServices[0]?.budget || 68000).toLocaleString()}` },
      ],
      pdfUrl: activeServices[0]?.pdfUrl || '/assets/documents/ejemplo_propuesta_tecnica_seram.pdf',
      pdfName: activeServices[0]?.pdfName || 'TDR_Monitoreo_Palos_Blancos.pdf',
      targetModule: 'services'
    },
    operations: {
      id: 'operations',
      name: 'HIDRÁULICA & RIEGO',
      subtitle: 'Ingeniería de Obras & Modelación de Redes',
      lead: 'Ing. Fernando Araujo',
      role: 'Socio Directivo · Hidráulica & Obras',
      color: 'sky',
      badge: 'CROPWAT & EPANET',
      desc: 'Cálculo de redes hidráulicas presurizadas, aforos de caudales, dimensionamiento de obras de toma y balances hídricos para riego tecnificado.',
      stats: [
        { label: 'Horas Hoy', value: '3.5h / 4.5h' },
        { label: 'Software', value: 'EPANET · CROPWAT' },
        { label: 'Zona Prioritaria', value: 'Alto Beni / Caranavi' },
      ],
      targetModule: 'services'
    },
    academy: {
      id: 'academy',
      name: 'SERAM ACADEMY',
      subtitle: 'Campus Virtual & Capacitación Especializada',
      lead: 'Tutor IA · Google Earth Engine & SIG',
      role: 'Ecosistema de Formación Profesional',
      color: 'purple',
      badge: 'Educación & Cursos',
      desc: 'Capacitación intensiva en QGIS, ArcGIS Pro, Google Earth Engine y legislación ambiental boliviana (Ley 1333).',
      stats: [
        { label: 'Cursos Activos', value: courses.length },
        { label: 'Curso Destacado', value: courses[0]?.title ? courses[0].title.slice(0, 32) + '...' : 'SIG Ambiental' },
        { label: 'Inscritos', value: `${courses[0]?.students || 28} alumnos` },
        { label: 'Precio', value: `Bs. ${courses[0]?.price || 350}` }
      ],
      pdfUrl: courses[0]?.pdfUrl || '/assets/documents/ejemplo_propuesta_tecnica_seram.pdf',
      pdfName: courses[0]?.pdfName || 'Syllabus_SIG_Ambiental.pdf',
      targetModule: 'academy'
    },
    experience: {
      id: 'experience',
      name: 'SERAM EXPERIENCE',
      subtitle: 'Expediciones Científicas & Ecoturismo de Altura',
      lead: 'Ing. Fabricio Orosco',
      role: 'Socio Directivo · Calidad & Expansión',
      color: 'amber',
      badge: 'Campo & LiDAR',
      desc: 'Logística de salidas de campo de alta precisión, vuelos fotogramétricos con drones, nubes de puntos LiDAR y turismo científico.',
      stats: [
        { label: 'Próxima Salida', value: 'Valle de las Agujas' },
        { label: 'Cupos Registrados', value: '14 / 20' },
        { label: 'Equipo', value: 'Drones DJI + GPS Diferencial' }
      ],
      targetModule: 'experience'
    },
    store: {
      id: 'store',
      name: 'SERAM STORE',
      subtitle: 'Equipamiento Técnico & Instrumentos de Campo',
      lead: 'Bot Store & Logística',
      role: 'Suministros Científicos B2B',
      color: 'rose',
      badge: 'Sensores & Hardware',
      desc: 'Showroom y provisión de sondas multiparamétricas in-situ (pH, turbidez, OD, Hg), drones de mapeo y reactivos químicos autorizados.',
      stats: [
        { label: 'Categorías', value: 'Sensores · Drones · Libros' },
        { label: 'Despacho', value: 'A todo el país' },
        { label: 'Facturación', value: 'Oficial SERAM SRL' }
      ],
      targetModule: 'store'
    },
    finanzas: {
      id: 'finanzas',
      name: 'DIRECCIÓN & MERITOCRACIA',
      subtitle: 'Gobernanza Financiera & Time Tracker de Socios',
      lead: 'Consejo de Socios Directivos',
      role: 'Regla de Oro: Quien trabaja más, gana más',
      color: 'emerald',
      badge: 'Transparencia Total',
      desc: 'Cómputo en tiempo real del Time Tracker, meta mínima de 4.5 horas diarias por socio y distribución proporcional de honorarios.',
      stats: [
        { label: 'Meta Diaria', value: '4.5 horas / socio' },
        { label: 'Fondo Disponible', value: 'Bs. 35,000' },
        { label: 'Ing. Diego Barrientos', value: '4.2h hoy (46.5h ciclo)' },
        { label: 'Ing. Fernando Araujo', value: '3.5h hoy (32.0h ciclo)' },
      ],
      targetModule: 'finances'
    }
  };

  // Synchronize with n8n Webhook
  const handleSyncN8N = (deptKey) => {
    setN8nStatus('syncing');
    setTimeout(() => {
      setN8nStatus('synced');
      setTimeout(() => setN8nStatus('idle'), 3500);
    }, 900);
  };

  // Trigger modal when an agent/station is selected
  const handleOpenDepartment = useCallback((deptKey) => {
    const dept = DEPARTMENTS[deptKey] || DEPARTMENTS.services;
    setSelectedDept(dept);
    handleSyncN8N(deptKey);
  }, []);

  // Initialize Phaser 3 Game Engine
  useEffect(() => {
    if (!containerRef.current) return;

    let player;
    let cursors;
    let wasd;
    let stations = [];
    let targetPos = null;

    const config = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 960,
      height: 560,
      pixelArt: true,
      backgroundColor: '#0a0d12',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false
        }
      },
      scene: {
        preload: function () {
          // Preload or generate pixel art textures
          createPixelArtTextures(this);
        },
        create: function () {
          const scene = this;

          // 1. Tiled Parquet Floor (30x18 grid of 32x32 tiles)
          for (let x = 0; x < 960; x += 32) {
            for (let y = 0; y < 560; y += 32) {
              const tile = scene.add.image(x + 16, y + 16, 'floor_parquet');
              if (y < 48) {
                tile.setTint(0x334455); // Top wall shadow
              }
            }
          }

          // 2. North Wall & Windows
          for (let x = 0; x < 960; x += 32) {
            scene.add.image(x + 16, 16, 'wall_tile');
          }

          // Large SERAM Logo Banner on North Wall
          const bannerBg = scene.add.rectangle(480, 24, 280, 28, 0x051b11, 0.9);
          bannerBg.setStrokeStyle(1, 0x00e03c, 0.8);
          const bannerText = scene.add.text(480, 24, '🏛️ SERAM SRL · OFICINA CENTRAL VIRTUAL', {
            fontSize: '11px',
            fontFamily: 'monospace',
            color: '#00e03c',
            fontStyle: 'bold'
          }).setOrigin(0.5);

          // 3. Stations Configuration in Pixel Space
          const STATIONS_LAYOUT = [
            {
              id: 'services',
              x: 480,
              y: 270,
              deskX: 480,
              deskY: 270,
              sprite: 'sprite_diego',
              name: 'Ing. Diego Barrientos',
              dept: 'SERAM SERVICES',
              color: 0x00e03c,
              badge: 'B2B & Minería'
            },
            {
              id: 'operations',
              x: 180,
              y: 290,
              deskX: 180,
              deskY: 290,
              sprite: 'sprite_fernando',
              name: 'Ing. Fernando Araujo',
              dept: 'HIDRÁULICA & RIEGO',
              color: 0x38bdf8,
              badge: 'EPANET / CROPWAT'
            },
            {
              id: 'experience',
              x: 780,
              y: 290,
              deskX: 780,
              deskY: 290,
              sprite: 'sprite_fabricio',
              name: 'Ing. Fabricio Orosco',
              dept: 'SERAM EXPERIENCE',
              color: 0xf59e0b,
              badge: 'Expediciones & LiDAR'
            },
            {
              id: 'academy',
              x: 320,
              y: 110,
              deskX: 320,
              deskY: 110,
              sprite: 'sprite_tutor',
              name: 'Tutor IA Academy',
              dept: 'SERAM ACADEMY',
              color: 0xa855f7,
              badge: 'Cursos & Campus'
            },
            {
              id: 'store',
              x: 640,
              y: 110,
              deskX: 640,
              deskY: 110,
              sprite: 'sprite_store_bot',
              name: 'Bot Store',
              dept: 'SERAM STORE',
              color: 0xf43f5e,
              badge: 'Sensores & Hardware'
            },
            {
              id: 'finanzas',
              x: 480,
              y: 460,
              deskX: 480,
              deskY: 460,
              sprite: 'vault_finanzas',
              name: 'Gobernanza Meritocrática',
              dept: 'FINANZAS (4.5h/día)',
              color: 0xeab308,
              badge: 'Time Tracker'
            }
          ];

          // 4. Render Desks, Characters, and Interactive Hitboxes
          STATIONS_LAYOUT.forEach(st => {
            // Desk Object (except vault which has its own sprite)
            if (st.sprite !== 'vault_finanzas') {
              const desk = scene.add.image(st.deskX, st.deskY + 8, 'desk_wood');
              desk.setDepth(st.deskY);
            }

            // Character / Vault Sprite
            const charSprite = scene.add.sprite(st.x, st.y - 14, st.sprite);
            charSprite.setDepth(st.y + 1);
            charSprite.setInteractive({ useHandCursor: true });

            // Interactive Pulsing Base Circle
            const pulseCircle = scene.add.circle(st.x, st.y + 18, 22, st.color, 0.2);
            pulseCircle.setDepth(1);
            scene.tweens.add({
              targets: pulseCircle,
              scale: { from: 0.8, to: 1.3 },
              alpha: { from: 0.35, to: 0.05 },
              duration: 1500,
              repeat: -1
            });

            // Name Tag Pill
            const tagBg = scene.add.rectangle(st.x, st.y - 48, 120, 20, 0x0a0e14, 0.85);
            tagBg.setStrokeStyle(1, st.color, 0.9);
            tagBg.setDepth(st.y + 10);

            const tagText = scene.add.text(st.x, st.y - 48, `● ${st.dept}`, {
              fontSize: '9px',
              fontFamily: 'monospace',
              color: '#ffffff',
              fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(st.y + 11);

            // Hover effects (Gather / RollerCoin style)
            charSprite.on('pointerover', function () {
              charSprite.setTint(0x44ff44); // Green glow
              tagBg.setFillStyle(0x00e03c, 0.9);
              tagText.setColor('#05130b');
              scene.game.canvas.style.cursor = 'pointer';
            });

            charSprite.on('pointerout', function () {
              charSprite.clearTint();
              tagBg.setFillStyle(0x0a0e14, 0.85);
              tagText.setColor('#ffffff');
              scene.game.canvas.style.cursor = 'default';
            });

            // Click interaction -> bridge to React Modal
            charSprite.on('pointerdown', function () {
              handleOpenDepartment(st.id);
            });

            stations.push({ ...st, spriteRef: charSprite });
          });

          // 5. Gather.town Style Controllable Player Avatar
          player = scene.physics.add.sprite(480, 360, 'sprite_player');
          player.setCollideWorldBounds(true);
          player.setDepth(360);

          const playerTag = scene.add.text(player.x, player.y - 30, '👤 TÚ (Socio)', {
            fontSize: '9px',
            fontFamily: 'monospace',
            color: '#34d399',
            backgroundColor: '#000000aa',
            padding: { x: 4, y: 2 }
          }).setOrigin(0.5).setDepth(400);

          // Keyboard controls (WASD & Arrows)
          cursors = scene.input.keyboard.createCursorKeys();
          wasd = {
            up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            interact: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)
          };

          // Click to walk (Gather.town / RollerCoin style)
          scene.input.on('pointerdown', function (pointer) {
            // Check if clicking directly on a character (already handled)
            const clickedStation = stations.find(st => {
              const dist = Phaser.Math.Distance.Between(pointer.x, pointer.y, st.x, st.y);
              return dist < 36;
            });

            if (!clickedStation) {
              targetPos = { x: pointer.x, y: pointer.y };
            }
          });

          // Store references in scene for update loop
          scene.playerRef = player;
          scene.playerTagRef = playerTag;
          scene.stationsRef = stations;
        },
        update: function () {
          const scene = this;
          const p = scene.playerRef;
          const tag = scene.playerTagRef;
          if (!p) return;

          let vx = 0;
          let vy = 0;
          const speed = 140;

          // Keyboard Movement
          if (cursors.left.isDown || wasd.left.isDown) vx = -speed;
          else if (cursors.right.isDown || wasd.right.isDown) vx = speed;

          if (cursors.up.isDown || wasd.up.isDown) vy = -speed;
          else if (cursors.down.isDown || wasd.down.isDown) vy = speed;

          // Click to walk movement
          if (targetPos) {
            const dist = Phaser.Math.Distance.Between(p.x, p.y, targetPos.x, targetPos.y);
            if (dist > 6) {
              const angle = Phaser.Math.Angle.Between(p.x, p.y, targetPos.x, targetPos.y);
              vx = Math.cos(angle) * speed;
              vy = Math.sin(angle) * speed;
            } else {
              targetPos = null;
            }
          }

          p.setVelocity(vx, vy);
          p.setDepth(p.y + 10);
          tag.setPosition(p.x, p.y - 30);
          tag.setDepth(p.y + 15);

          // Update React state coordinates occasionally
          if (p.body.speed > 0) {
            setPlayerCoordinates({ x: Math.round(p.x), y: Math.round(p.y) });
          }

          // Check proximity to any department
          scene.stationsRef.forEach(st => {
            const dist = Phaser.Math.Distance.Between(p.x, p.y, st.x, st.y);
            if (dist < 48) {
              st.spriteRef.setTint(0x66ff66);
              if (Phaser.Input.Keyboard.JustDown(wasd.interact)) {
                handleOpenDepartment(st.id);
              }
            } else {
              st.spriteRef.clearTint();
            }
          });
        }
      }
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [handleOpenDepartment]);

  return (
    <div className="relative w-full space-y-4">
      {/* Top Status Bar & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white/[0.04] border border-white/[0.08] rounded-2xl text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00e03c] animate-pulse" />
          <span className="font-extrabold text-white">Miniverso Pixel Art Activo (Phaser 3 Engine)</span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            [Posición: X:{playerCoordinates.x} Y:{playerCoordinates.y}]
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-slate-400 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10 font-mono">
            Controles: [W,A,S,D] o Clic para caminar · [Espacio] interactuar
          </span>
          {n8nStatus === 'syncing' && (
            <span className="flex items-center gap-1 text-[10px] text-amber-300 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
              <RefreshCw className="w-3 h-3 animate-spin" /> n8n Sincronizando...
            </span>
          )}
          {n8nStatus === 'synced' && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
              <Check className="w-3 h-3" /> n8n Webhook OK
            </span>
          )}
        </div>
      </div>

      {/* Phaser Canvas Container */}
      <div
        id="dashboard-container"
        ref={containerRef}
        className="w-full h-[560px] bg-[#0a0d12] rounded-2xl overflow-hidden border border-white/[0.12] shadow-2xl relative flex items-center justify-center select-none"
      >
        {/* Floating Interactive Guide Overlay */}
        <div className="absolute top-3 left-3 z-10 pointer-events-none flex items-center gap-2 bg-slate-950/80 border border-white/15 px-3 py-1.5 rounded-xl backdrop-blur-md text-[11px] text-white">
          <span className="text-[#00e03c] font-black">● GATHER STYLE</span>
          <span className="text-slate-400">| Haz clic en cualquier socio o escritorio para gestionar</span>
        </div>
      </div>

      {/* CAPA DE NEGOCIO (HTML/CSS/DOM) - MODAL MODERNO CONECTADO A BASE DE DATOS */}
      <AnimatePresence>
        {selectedDept && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-2xl bg-[#0f172a]/95 border border-white/20 rounded-3xl p-6 shadow-2xl relative space-y-5 text-left text-white"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-white/[0.08] border border-white/15 text-[#00e03c]">
                    {selectedDept.id === 'services' && <Briefcase className="w-6 h-6" />}
                    {selectedDept.id === 'operations' && <Activity className="w-6 h-6" />}
                    {selectedDept.id === 'academy' && <BookOpenCheck className="w-6 h-6" />}
                    {selectedDept.id === 'experience' && <Globe className="w-6 h-6" />}
                    {selectedDept.id === 'store' && <ShoppingBag className="w-6 h-6" />}
                    {selectedDept.id === 'finanzas' && <DollarSign className="w-6 h-6 text-amber-400" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black tracking-tight">{selectedDept.name}</h3>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00e03c]/20 text-[#00e03c] border border-[#00e03c]/30 font-bold uppercase">
                        {selectedDept.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{selectedDept.subtitle}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedDept(null)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Responsable & Descripción */}
              <div className="p-3.5 bg-white/[0.03] border border-white/[0.08] rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold">Líder / Proponente:</span>
                  <span className="text-[#00e03c] font-black">{selectedDept.lead}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold">Rol Operativo:</span>
                  <span className="text-slate-200">{selectedDept.role}</span>
                </div>
                <p className="text-xs text-slate-300 pt-1 leading-relaxed border-t border-white/5">
                  {selectedDept.desc}
                </p>
              </div>

              {/* Live Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {selectedDept.stats?.map((st, idx) => (
                  <div key={idx} className="p-3 bg-white/[0.04] border border-white/10 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block truncate">{st.label}</span>
                    <span className="text-xs font-black text-white mt-1 block truncate">{st.value}</span>
                  </div>
                ))}
              </div>

              {/* Documento Técnico en PDF (si aplica) */}
              {selectedDept.pdfUrl && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="text-xs font-bold text-emerald-200 block">Documento Técnico Oficial (PDF)</span>
                      <span className="text-[10px] text-emerald-400/80 font-mono">{selectedDept.pdfName}</span>
                    </div>
                  </div>
                  <a
                    href={selectedDept.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-xl font-black text-xs flex items-center gap-1.5 hover:bg-emerald-400 transition-colors shadow-md shadow-emerald-500/20"
                  >
                    <span>Ver PDF</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

              {/* Action Buttons & Integration */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => handleSyncN8N(selectedDept.id)}
                  className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold text-slate-300 flex items-center gap-2 transition-colors"
                >
                  <Send className="w-3.5 h-3.5 text-blue-400" />
                  <span>Sincronizar n8n Webhook</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedDept(null)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 rounded-xl text-xs font-bold transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      const mod = selectedDept.targetModule;
                      setSelectedDept(null);
                      if (onNavigateModule) onNavigateModule(mod);
                    }}
                    className="px-4 py-2 bg-[#00e03c] hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-500/20"
                  >
                    <span>Abrir Módulo Completo</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
