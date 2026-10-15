// OfficePathfinder.js - Motor de navegación por waypoints y grafo de pasillos
// Calibrado para la oficina híbrida panorámica 16:9 con mamparas de madera y cristal de SERAM SRL.
// Evita colisiones con mamparas, escritorios y paredes conectando despachos a través de puertas de acceso transitables.

/**
 * Puntos de anclaje de llegada (sillas) para cada una de las 13 salas de la oficina.
 * Incluye orientación visual ('up' | 'down' | 'left' | 'right') para la postura de sentado.
 */
export const ROOM_SEATS = {
  admin: {
    roomId: 'admin',
    x: 12,
    y: 53,
    facing: 'right',
    name: '01. ADMINISTRACIÓN',
    deskName: 'Mesa de Roles & Gobierno'
  },
  direction: {
    roomId: 'direction',
    x: 16,
    y: 24,
    facing: 'down',
    name: '02. DIRECCIÓN',
    deskName: 'Escritorio Ing. Diego Barrientos'
  },
  operations: {
    roomId: 'operations',
    x: 91,
    y: 31,
    facing: 'down',
    name: '03. OPERACIONES Y PLANIFICACIÓN',
    deskName: 'Estación Hidráulica Ing. Fernando Araujo'
  },
  commercial: {
    roomId: 'commercial',
    x: 80,
    y: 73,
    facing: 'up',
    name: '04. COMERCIAL',
    deskName: 'Mesa B2B & Licitaciones SICOES'
  },
  finances: {
    roomId: 'finances',
    x: 77,
    y: 73,
    facing: 'up',
    name: '05. FINANZAS',
    deskName: 'Bóveda de Socios & Retenciones'
  },
  marketing: {
    roomId: 'marketing',
    x: 18,
    y: 44,
    facing: 'right',
    name: '06. MARKETING Y VENTAS',
    deskName: 'Estación de Embudos & Campañas'
  },
  service: {
    roomId: 'service',
    x: 14,
    y: 52,
    facing: 'up',
    name: '07. SERVICE AMBIENTAL',
    deskName: 'Mesa de Teledetección & Monitoreo'
  },
  meeting: {
    roomId: 'meeting',
    x: 57,
    y: 33,
    facing: 'down',
    name: '08. SALA DE REUNIONES',
    deskName: 'Mesa Plenaria de Directorio'
  },
  recreation: {
    roomId: 'recreation',
    x: 28,
    y: 80,
    facing: 'up',
    name: '09. SALA RECREATIVA',
    deskName: 'Sillón Lounge & Barra de Café'
  },
  academy: {
    roomId: 'academy',
    x: 85,
    y: 73,
    facing: 'up',
    name: '10. ACADEMY',
    deskName: 'Aula de Capacitación & SIG'
  },
  experience: {
    roomId: 'experience',
    x: 91,
    y: 54,
    facing: 'left',
    name: '11. EXPERIENCIA Y CAMPO',
    deskName: 'Estación Drones Ing. Fabricio Orosco'
  },
  social_media: {
    roomId: 'social_media',
    x: 50,
    y: 76,
    facing: 'up',
    name: '12. SOCIAL MEDIA',
    deskName: 'Set Audiovisual & Cámaras'
  },
  research: {
    roomId: 'research',
    x: 85,
    y: 22,
    facing: 'down',
    name: '13. INVESTIGACIÓN',
    deskName: 'Laboratorio de Mercurio (Hg)'
  }
};

/**
 * Segmentos de mamparas divisorias sólidas (madera noble y cristal).
 * Los vanos o gaps entre segmentos representan las puertas de acceso abiertas.
 */
export const WALL_SEGMENTS = [
  // ── Mampara vertical izquierda: x=32, segmentos [12 a 33] y [37 a 68] (puerta Dirección en y: 33-37, puerta Admin en y: 50-55) ──
  { id: 'w_v_left_dir_top', p1: { x: 32, y: 12 }, p2: { x: 32, y: 33 } },
  { id: 'w_v_left_dir_mid', p1: { x: 32, y: 37 }, p2: { x: 32, y: 50 } },
  { id: 'w_v_left_admin_bot', p1: { x: 32, y: 56 }, p2: { x: 32, y: 68 } },

  // ── Mampara horizontal entre Dir y Admin: y=40, segmento x de [6 a 32] ──
  { id: 'w_h_dir_admin', p1: { x: 6, y: 40 }, p2: { x: 32, y: 40 } },

  // ── Mampara horizontal entre Admin y Lounge: y=68, segmento x de [6 a 32] ──
  { id: 'w_h_admin_lounge', p1: { x: 6, y: 68 }, p2: { x: 32, y: 68 } },

  // ── Mamparas de la Sala de Directorio (caja acristalada central) ──
  // Pared izquierda: x=44, y de [15 a 68]
  { id: 'w_meet_left', p1: { x: 44, y: 15 }, p2: { x: 44, y: 68 } },
  // Pared derecha: x=68, y de [15 a 68]
  { id: 'w_meet_right', p1: { x: 68, y: 15 }, p2: { x: 68, y: 68 } },
  // Pared norte: y=15, x de [44 a 68]
  { id: 'w_meet_north', p1: { x: 44, y: 15 }, p2: { x: 68, y: 15 } },
  // Pared sur: y=68, segmentos x de [44 a 52] y [58 a 68] (puerta central en x: 52-58)
  { id: 'w_meet_south_1', p1: { x: 44, y: 68 }, p2: { x: 52, y: 68 } },
  { id: 'w_meet_south_2', p1: { x: 58, y: 68 }, p2: { x: 68, y: 68 } },

  // ── Mampara vertical derecha: x=72, segmentos [12 a 29], [33 a 52], [56 a 66] y [70 a 95] ──
  // Gaps transitables: Puerta Operaciones (29-33), Puerta Experiencia (52-56), Puerta Servidores (66-70)
  { id: 'w_v_right_top', p1: { x: 72, y: 12 }, p2: { x: 72, y: 29 } },
  { id: 'w_v_right_mid1', p1: { x: 72, y: 33 }, p2: { x: 72, y: 52 } },
  { id: 'w_v_right_mid2', p1: { x: 72, y: 56 }, p2: { x: 72, y: 66 } },
  { id: 'w_v_right_bot', p1: { x: 72, y: 70 }, p2: { x: 72, y: 95 } },

  // ── Mampara horizontal Ops/Exp: y=42, x de [72 a 95] ──
  { id: 'w_h_ops_exp', p1: { x: 72, y: 42 }, p2: { x: 95, y: 42 } },

  // ── Mampara horizontal Exp/Servidores: y=66, x de [72 a 95] ──
  { id: 'w_h_exp_serv', p1: { x: 72, y: 66 }, p2: { x: 95, y: 66 } }
];

/**
 * Cajas delimitadoras de mobiliario y obstáculos sólidos donde NUNCA se debe caminar encima.
 */
export const OBSTACLE_BOXES = [
  // Mesa ovalada de reuniones Directorio (evita que el avatar se pare encima de la mesa)
  { id: 'meeting_table', minX: 48, maxX: 64, minY: 37, maxY: 55 },
  // Barra de café & espresso
  { id: 'coffee_bar', minX: 5, maxX: 19, minY: 70, maxY: 94 },
  // Mesa centro lounge
  { id: 'lounge_table', minX: 30, maxX: 37, minY: 84, maxY: 91 },
  // Escritorio Dirección
  { id: 'dir_desk', minX: 8, maxX: 25, minY: 26, maxY: 36 },
  // Estación Operaciones
  { id: 'ops_desk', minX: 81, maxX: 95, minY: 25, maxY: 37 },
  // Estación Experiencia
  { id: 'exp_desk', minX: 81, maxX: 95, minY: 48, maxY: 60 },
  // Servidores y Bóveda
  { id: 'servers_vault', minX: 74, maxX: 95, minY: 75, maxY: 95 }
];

/**
 * Intersección matemática precisa entre dos segmentos 2D (p1-p2 con w1-w2).
 */
export function lineIntersectsSegment(p1, p2, w1, w2) {
  const ccw = (A, B, C) => (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
  return (ccw(p1, w1, w2) !== ccw(p2, w1, w2)) && (ccw(p1, p2, w1) !== ccw(p1, p2, w2));
}

/**
 * Evalúa si una línea recta entre dos puntos corta cualquier mampara divisoria sólida.
 */
export function lineIntersectsAnyWall(p1, p2) {
  if (!p1 || !p2) return false;
  return WALL_SEGMENTS.some(wall => lineIntersectsSegment(p1, p2, wall.p1, wall.p2));
}

/**
 * Distancia euclídea mínima de un punto p a un segmento 2D [a, b].
 */
export function pointDistanceToSegment(p, a, b) {
  const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = a.x + t * (b.x - a.x);
  const projY = a.y + t * (b.y - a.y);
  return Math.hypot(p.x - projX, p.y - projY);
}

/**
 * Verifica si un punto cae dentro de alguna caja de obstáculo sólido.
 */
export function isPointInsideObstacle(x, y) {
  return OBSTACLE_BOXES.some(box => (
    x >= box.minX && x <= box.maxX && y >= box.minY && y <= box.maxY
  ));
}

/**
 * Verifica si el punto coincide con una silla designada de trabajo/reunión.
 */
export function isNearSeat(x, y, radius = 1.8) {
  return Object.values(ROOM_SEATS).some(seat => (
    Math.hypot(seat.x - x, seat.y - y) <= radius
  ));
}

/**
 * Puertas de acceso designadas para ingresar y salir de cada despacho acristalado.
 */
export const DOOR_NODES = [
  { id: 'door_direction', x: 32, y: 35, roomId: 'direction' },
  { id: 'door_admin', x: 32, y: 53, roomId: 'admin' },
  { id: 'door_operations', x: 72, y: 31, roomId: 'operations' },
  { id: 'door_experience', x: 72, y: 54, roomId: 'experience' },
  { id: 'door_meeting', x: 55, y: 68, roomId: 'meeting' },
  { id: 'door_recreation', x: 34, y: 76, roomId: 'recreation' },
  { id: 'door_commercial', x: 72, y: 68, roomId: 'commercial' },
  { id: 'door_research', x: 72, y: 15, roomId: 'research' }
];

/**
 * Verifica si el punto está dentro de un vano de puerta transitable.
 */
export function isNearDoor(x, y, radius = 2.4) {
  return DOOR_NODES.some(door => (
    Math.hypot(door.x - x, door.y - y) <= radius
  ));
}

/**
 * Si un clic o punto cae dentro de un obstáculo (como la mesa de directorio),
 * lo proyecta al borde libre más próximo para que sea transitable.
 */
export function projectOutOfObstacle(pos) {
  if (!pos) return { x: 50, y: 50 };
  const { x, y } = pos;
  if (!isPointInsideObstacle(x, y)) return { x, y };
  if (isNearSeat(x, y)) return { x, y };

  const box = OBSTACLE_BOXES.find(b => x >= b.minX && x <= b.maxX && y >= b.minY && y <= b.maxY);
  if (!box) return { x, y };

  const candidates = [
    { x: box.minX - 2.0, y },
    { x: box.maxX + 2.0, y },
    { x, y: box.minY - 2.0 },
    { x, y: box.maxY + 2.0 }
  ];

  let best = null;
  let minD = Infinity;

  for (const cand of candidates) {
    if (cand.x >= 6 && cand.x <= 95 && cand.y >= 14 && cand.y <= 94) {
      if (!isPointInsideObstacle(cand.x, cand.y)) {
        const d = Math.hypot(cand.x - x, cand.y - y);
        if (d < minD) {
          minD = d;
          best = cand;
        }
      }
    }
  }

  return best || { x, y };
}

/**
 * Valida si una coordenada está dentro del área transitable de la oficina.
 * Impide pisar mamparas o subirse a muebles sólidos (mesa de reuniones, escritorios, barra de café).
 */
export function isPointWalkable(x, y) {
  if (typeof x !== 'number' || typeof y !== 'number') return false;

  // 1. Límites generales de la oficina
  if (x < 6 || x > 95 || y < 14 || y > 94) return false;

  // 2. Obstáculos sólidos (a menos que sea la silla de llegada)
  if (isPointInsideObstacle(x, y) && !isNearSeat(x, y)) {
    return false;
  }

  // 3. Si está transitando por el umbral de una puerta abierta, permitir paso
  if (isNearDoor(x, y)) {
    return true;
  }

  // 4. Distancia mínima de seguridad a cualquier mampara (1.2%)
  for (const wall of WALL_SEGMENTS) {
    if (pointDistanceToSegment({ x, y }, wall.p1, wall.p2) < 1.2) {
      return false;
    }
  }

  return true;
}

/**
 * Nodos del pasillo principal transitable libre de obstáculos (mamparas y escritorios).
 */
export const CORRIDOR_NODES = [
  // ── Pasillo central vertical izquierdo (x: 36%, entre y: 20% y 76%) ──
  { id: 'cor_v_left_20', x: 36, y: 20 },
  { id: 'cor_v_left_35', x: 36, y: 35 },
  { id: 'cor_v_left_45', x: 36, y: 45 },
  { id: 'cor_v_left_53', x: 36, y: 53 },
  { id: 'cor_v_left_60', x: 36, y: 60 },
  { id: 'cor_v_left_76', x: 36, y: 76 },

  // ── Pasillo central vertical derecho (x: 70%, entre y: 20% y 76%) ──
  { id: 'cor_v_right_20', x: 70, y: 20 },
  { id: 'cor_v_right_31', x: 70, y: 31 },
  { id: 'cor_v_right_45', x: 70, y: 45 },
  { id: 'cor_v_right_54', x: 70, y: 54 },
  { id: 'cor_v_right_60', x: 70, y: 60 },
  { id: 'cor_v_right_68', x: 70, y: 68 },
  { id: 'cor_v_right_76', x: 70, y: 76 },

  // ── Pasillo transversal superior (norte de Directorio, y: 20%) ──
  { id: 'cor_h_top_54', x: 54, y: 20 },

  // ── Pasillo transversal inferior (sur, y: 76%) ──
  { id: 'cor_h_bot_28', x: 28, y: 76 },
  { id: 'cor_h_bot_50', x: 50, y: 76 },
  { id: 'cor_h_bot_55', x: 55, y: 76 }
];

/**
 * Zonas acotadas de cada despacho delimitado por mamparas.
 * Garantiza que cualquier punto interior siempre pase por su puerta para entrar/salir.
 */
export const ROOM_ZONES = [
  {
    id: 'direction',
    doorId: 'door_direction',
    minX: 6, maxX: 32, minY: 14, maxY: 40,
    innerNodeId: 'dir_inner'
  },
  {
    id: 'admin',
    doorId: 'door_admin',
    minX: 6, maxX: 32, minY: 41, maxY: 66,
    innerNodeId: 'admin_inner'
  },
  {
    id: 'recreation',
    doorId: 'door_recreation',
    minX: 16, maxX: 42, minY: 74, maxY: 96,
    innerNodeId: 'seat_recreation'
  },
  {
    id: 'meeting',
    doorId: 'door_meeting',
    minX: 44, maxX: 68, minY: 15, maxY: 68,
    innerNodeId: 'meet_south'
  },
  {
    id: 'operations',
    doorId: 'door_operations',
    minX: 72, maxX: 96, minY: 15, maxY: 42,
    innerNodeId: 'ops_inner'
  },
  {
    id: 'experience',
    doorId: 'door_experience',
    minX: 72, maxX: 96, minY: 43, maxY: 65,
    innerNodeId: 'exp_inner'
  },
  {
    id: 'commercial',
    doorId: 'door_commercial',
    minX: 72, maxX: 96, minY: 66, maxY: 92,
    innerNodeId: 'comm_inner'
  }
];

/**
 * Nodos del grafo completo de navegación (pasillos, puertas y anclajes interiores).
 */
export const WAYPOINTS = [
  ...CORRIDOR_NODES,
  ...DOOR_NODES,

  // ── Nodos interiores y puestos de trabajo en Dirección ──
  { id: 'dir_inner', x: 20, y: 35 },
  { id: 'seat_direction', x: 16, y: 24 },

  // ── Nodos interiores y puestos en Operaciones ──
  { id: 'ops_inner', x: 80, y: 31 },
  { id: 'seat_operations', x: 91, y: 31 },

  // ── Nodos interiores y puestos en Experiencia & Campo ──
  { id: 'exp_inner', x: 80, y: 54 },
  { id: 'seat_experience', x: 91, y: 54 },

  // ── Nodos interiores en Directorio (Rodeando la mesa de reuniones) ──
  { id: 'meet_south', x: 55, y: 62 },
  { id: 'meet_left', x: 46, y: 46 },
  { id: 'meet_right', x: 66, y: 46 },
  { id: 'meet_north', x: 57, y: 31 },
  { id: 'seat_meeting', x: 57, y: 33 },

  // ── Nodos interiores en Café & Lounge ──
  { id: 'seat_recreation', x: 28, y: 80 },
  { id: 'rec_spot_2', x: 39, y: 80 },
  { id: 'rec_spot_3', x: 27, y: 92 },

  // ── Nodos interiores en Área Comercial / Archivo / Servidores ──
  { id: 'comm_inner', x: 77, y: 70 },
  { id: 'seat_commercial', x: 80, y: 73 },
  { id: 'seat_finances', x: 77, y: 73 },
  { id: 'seat_academy', x: 85, y: 73 },

  // ── Nodos interiores en Despacho Administración / Service / Marketing ──
  { id: 'admin_inner', x: 20, y: 53 },
  { id: 'seat_admin', x: 12, y: 53 },
  { id: 'seat_service', x: 14, y: 52 },
  { id: 'seat_marketing', x: 18, y: 44 },

  // ── Laboratorio de Investigación ──
  { id: 'seat_research', x: 85, y: 22 },

  // ── Social Media (Set en pasillo inferior) ──
  { id: 'seat_social_media', x: 50, y: 76 }
];

/**
 * Conexiones bidireccionales entre waypoints (aristas de tránsito seguro).
 */
export const EDGES = [
  // ── Espina vertical izquierda (x: 36%) ──
  ['cor_v_left_20', 'cor_v_left_35'],
  ['cor_v_left_35', 'cor_v_left_45'],
  ['cor_v_left_45', 'cor_v_left_53'],
  ['cor_v_left_53', 'cor_v_left_60'],
  ['cor_v_left_60', 'cor_v_left_76'],

  // ── Espina vertical derecha (x: 70%) ──
  ['cor_v_right_20', 'cor_v_right_31'],
  ['cor_v_right_31', 'cor_v_right_45'],
  ['cor_v_right_45', 'cor_v_right_54'],
  ['cor_v_right_54', 'cor_v_right_60'],
  ['cor_v_right_60', 'cor_v_right_68'],
  ['cor_v_right_68', 'cor_v_right_76'],

  // ── Pasillo transversal superior (y: 20%) ──
  ['cor_v_left_20', 'cor_h_top_54'],
  ['cor_h_top_54', 'cor_v_right_20'],

  // ── Pasillo transversal inferior (y: 76%) ──
  ['cor_h_bot_28', 'door_recreation'],
  ['door_recreation', 'cor_v_left_76'],
  ['cor_v_left_76', 'cor_h_bot_50'],
  ['cor_h_bot_50', 'cor_h_bot_55'],
  ['cor_h_bot_55', 'cor_v_right_76'],

  // ── Pasillo transversal medio frente a Directorio (y: 68-76%) ──
  ['door_meeting', 'cor_h_bot_55'],
  ['door_meeting', 'cor_v_right_68'],
  ['cor_v_left_60', 'cor_h_bot_50'],

  // ── Conexiones de Puertas a Pasillos Principales ──
  ['door_direction', 'cor_v_left_35'],
  ['door_admin', 'cor_v_left_53'],
  ['door_operations', 'cor_v_right_31'],
  ['door_experience', 'cor_v_right_54'],
  ['door_commercial', 'cor_v_right_68'],
  ['door_research', 'cor_v_right_20'],

  // ── Despacho Dirección (Diego) ──
  ['door_direction', 'dir_inner'],
  ['dir_inner', 'seat_direction'],

  // ── Despacho Administración (Admin, Service, Marketing) ──
  ['door_admin', 'admin_inner'],
  ['admin_inner', 'seat_admin'],
  ['admin_inner', 'seat_service'],
  ['admin_inner', 'seat_marketing'],

  // ── Despacho Operaciones (Fernando) ──
  ['door_operations', 'ops_inner'],
  ['ops_inner', 'seat_operations'],

  // ── Despacho Experiencia & Campo (Fabricio) ──
  ['door_experience', 'exp_inner'],
  ['exp_inner', 'seat_experience'],

  // ── Sala de Directorio (Rodeando mesa ovalada de reuniones) ──
  ['door_meeting', 'meet_south'],
  ['meet_south', 'meet_left'],
  ['meet_south', 'meet_right'],
  ['meet_left', 'meet_north'],
  ['meet_right', 'meet_north'],
  ['meet_north', 'seat_meeting'],

  // ── Café & Lounge de Descanso ──
  ['door_recreation', 'seat_recreation'],
  ['door_recreation', 'rec_spot_2'],
  ['seat_recreation', 'rec_spot_3'],

  // ── Comercial, Finanzas & Academy ──
  ['door_commercial', 'comm_inner'],
  ['comm_inner', 'seat_commercial'],
  ['comm_inner', 'seat_finances'],
  ['comm_inner', 'seat_academy'],

  // ── Laboratorio de Investigación ──
  ['door_research', 'seat_research'],

  // ── Set de Social Media ──
  ['cor_h_bot_50', 'seat_social_media']
];

/** Mapa de consulta rápida de nodos por id */
const WAYPOINT_MAP = new Map(WAYPOINTS.map(w => [w.id, w]));

/** Distancia euclídea entre dos puntos (en porcentaje) */
function distance(p1, p2) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.hypot(dx, dy);
}

/** Construye la lista de adyacencia del grafo con pesos de distancia euclídea */
function buildAdjacencyList() {
  const adj = new Map();
  WAYPOINTS.forEach(w => adj.set(w.id, []));

  EDGES.forEach(([idA, idB]) => {
    const nodeA = WAYPOINT_MAP.get(idA);
    const nodeB = WAYPOINT_MAP.get(idB);
    if (nodeA && nodeB) {
      const dist = distance(nodeA, nodeB);
      adj.get(idA).push({ id: idB, weight: dist });
      adj.get(idB).push({ id: idA, weight: dist });
    }
  });

  return adj;
}

const GRAPH_ADJACENCY = buildAdjacencyList();

/**
 * Identifica a qué zona/despacho delimitado pertenece un punto.
 * Si está en pasillos abiertos, retorna null.
 */
export function getRoomForPoint(pos) {
  if (!pos) return null;
  return ROOM_ZONES.find(zone => (
    pos.x >= zone.minX && pos.x <= zone.maxX &&
    pos.y >= zone.minY && pos.y <= zone.maxY
  )) || null;
}

/**
 * Encuentra el waypoint más cercano a un punto dentro de un subconjunto de candidatos.
 */
function findClosestFromCandidates(pos, candidates) {
  let closest = null;
  let minDist = Infinity;

  for (const wp of candidates) {
    const d = distance(pos, wp);
    if (d < minDist) {
      minDist = d;
      closest = wp;
    }
  }

  return closest;
}

/**
 * Encuentra el nodo del grafo más apropiado para iniciar o terminar la ruta.
 * Respeta la pertenencia a salas delimitadas para evitar atajos a través de cristales.
 */
function resolveWaypointForPosition(pos, isStart = false) {
  const room = getRoomForPoint(pos);

  if (room) {
    // Si la posición está dentro de un despacho, buscar únicamente entre los nodos de esa sala o su puerta
    const roomWaypoints = WAYPOINTS.filter(w => {
      if (w.id === room.doorId) return true;
      if (w.id === room.innerNodeId) return true;
      if (room.id === 'meeting' && (w.id === 'meet_south' || w.id === 'meet_left' || w.id === 'meet_right' || w.id === 'meet_north')) return true;
      if (w.id.startsWith('seat_')) {
        const seat = ROOM_SEATS[room.id];
        return seat && Math.hypot(seat.x - w.x, seat.y - w.y) < 1;
      }
      return false;
    });

    const candidate = findClosestFromCandidates(pos, roomWaypoints);
    if (candidate) return candidate;
    return WAYPOINT_MAP.get(room.doorId);
  }

  // Si está en el pasillo, buscar entre nodos de pasillo y puertas de acceso exteriores
  const corridorCandidates = [
    ...CORRIDOR_NODES,
    ...DOOR_NODES
  ];

  return findClosestFromCandidates(pos, corridorCandidates);
}

/**
 * Algoritmo Dijkstra sobre el grafo de navegación.
 * Retorna un array ordenado de nodos { id, x, y }.
 */
function dijkstra(startId, targetId) {
  if (startId === targetId) {
    const node = WAYPOINT_MAP.get(startId);
    return node ? [node] : [];
  }

  const distances = new Map();
  const previous = new Map();
  const unvisited = new Set();

  WAYPOINTS.forEach(wp => {
    distances.set(wp.id, Infinity);
    unvisited.add(wp.id);
  });

  distances.set(startId, 0);

  while (unvisited.size > 0) {
    let currentId = null;
    let minD = Infinity;
    for (const id of unvisited) {
      const d = distances.get(id);
      if (d < minD) {
        minD = d;
        currentId = id;
      }
    }

    if (!currentId || minD === Infinity) break;
    if (currentId === targetId) break;

    unvisited.delete(currentId);

    const neighbors = GRAPH_ADJACENCY.get(currentId) || [];
    for (const { id: neighborId, weight } of neighbors) {
      if (!unvisited.has(neighborId)) continue;
      const alt = distances.get(currentId) + weight;
      if (alt < distances.get(neighborId)) {
        distances.set(neighborId, alt);
        previous.set(neighborId, currentId);
      }
    }
  }

  // Reconstrucción del camino
  const path = [];
  let curr = targetId;
  while (curr) {
    const wp = WAYPOINT_MAP.get(curr);
    if (wp) path.unshift(wp);
    curr = previous.get(curr);
    if (curr === startId) {
      const startWp = WAYPOINT_MAP.get(startId);
      if (startWp) path.unshift(startWp);
      break;
    }
  }

  return path;
}

/**
 * Simplifica un camino eliminando puntos colineales redundantes o excesivamente cercanos (< 1.0%),
 * verificando que el segmento directo simplificado no corte ninguna mampara.
 */
function simplifyPath(points) {
  if (!points || points.length <= 1) return points || [];
  if (points.length === 2) {
    return distance(points[0], points[1]) < 0.5 ? [points[1]] : points;
  }

  const result = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = result[result.length - 1];
    const curr = points[i];
    const next = points[i + 1];

    if (distance(prev, curr) < 0.8) continue;

    // Si cortar de prev a next atraviesa una mampara o mueble, mantener curr
    if (lineIntersectsAnyWall(prev, next)) {
      result.push(curr);
      continue;
    }

    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    const crossProduct = Math.abs(dx1 * dy2 - dy1 * dx2);
    const dotProduct = dx1 * dx2 + dy1 * dy2;

    if (crossProduct < 0.05 && dotProduct > 0) {
      continue;
    }

    result.push(curr);
  }

  const lastPoint = points[points.length - 1];
  if (distance(result[result.length - 1], lastPoint) >= 0.5) {
    result.push(lastPoint);
  }

  return result;
}

/**
 * Función principal de navegación: calcula el camino transitable continuo entre `startPos` y `targetPos`.
 * Utiliza nodos de puerta obligatorios para entrar o salir de despachos con mamparas de vidrio.
 * Si el destino cae dentro de un obstáculo, lo proyecta fuera de él automáticamente.
 *
 * @param {{ x: number, y: number }} startPos - Posición inicial en %
 * @param {{ x: number, y: number }} targetPos - Posición destino en %
 * @returns {Array<{ x: number, y: number }>} Secuencia ordenada de waypoints
 */
export function findPath(startPos, targetPos) {
  if (!startPos || !targetPos) return [];

  // Proyectar si cae en un obstáculo sólido y no es una silla de llegada
  const safeTarget = isPointInsideObstacle(targetPos.x, targetPos.y) && !isNearSeat(targetPos.x, targetPos.y)
    ? projectOutOfObstacle(targetPos)
    : { x: targetPos.x, y: targetPos.y };

  const directDist = distance(startPos, safeTarget);
  if (directDist < 1.0) {
    return [{ x: safeTarget.x, y: safeTarget.y }];
  }

  const startRoom = getRoomForPoint(startPos);
  const targetRoom = getRoomForPoint(safeTarget);
  const lineBlocked = lineIntersectsAnyWall(startPos, safeTarget);

  // 1. Si la línea directa NO corta ninguna mampara y están en la misma sala o ambos en pasillo abierto
  if (!lineBlocked) {
    if ((startRoom && targetRoom && startRoom.id === targetRoom.id) || (!startRoom && !targetRoom)) {
      return [
        { x: startPos.x, y: startPos.y },
        { x: safeTarget.x, y: safeTarget.y }
      ];
    }
  }

  // 2. Resolver los waypoints de anclaje de salida y llegada adecuados
  const startWp = resolveWaypointForPosition(startPos, true);
  const targetWp = resolveWaypointForPosition(safeTarget, false);

  if (!startWp || !targetWp) {
    return [
      { x: startPos.x, y: startPos.y },
      { x: safeTarget.x, y: safeTarget.y }
    ];
  }

  // 3. Trazar ruta por pasillos y puertas con Dijkstra
  const corridorPath = dijkstra(startWp.id, targetWp.id);

  // 4. Ensamblar secuencia completa: startPos -> waypoints -> safeTarget sin duplicados
  const rawPoints = [{ x: startPos.x, y: startPos.y }];

  corridorPath.forEach(wp => {
    const prev = rawPoints[rawPoints.length - 1];
    if (!prev || distance(prev, wp) >= 0.5) {
      rawPoints.push({ x: wp.x, y: wp.y });
    }
  });

  const lastPrev = rawPoints[rawPoints.length - 1];
  if (!lastPrev || distance(lastPrev, safeTarget) >= 0.5) {
    rawPoints.push({ x: safeTarget.x, y: safeTarget.y });
  }

  // 5. Simplificar y devolver ruta libre de mamparas
  return simplifyPath(rawPoints);
}

/**
 * Obtiene la silla y datos de anclaje de una sala específica.
 */
export function getSeatForRoom(roomId) {
  return ROOM_SEATS[roomId] || ROOM_SEATS.direction;
}

export default {
  ROOM_SEATS,
  WALL_SEGMENTS,
  OBSTACLE_BOXES,
  CORRIDOR_NODES,
  DOOR_NODES,
  ROOM_ZONES,
  WAYPOINTS,
  EDGES,
  findPath,
  getSeatForRoom,
  getRoomForPoint,
  isPointWalkable,
  isPointInsideObstacle,
  projectOutOfObstacle,
  lineIntersectsSegment,
  lineIntersectsAnyWall,
  pointDistanceToSegment
};
