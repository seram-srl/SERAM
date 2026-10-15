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

  // ── Pasillo central vertical derecho (x: 72%, entre y: 20% y 76%) ──
  { id: 'cor_v_right_20', x: 72, y: 20 },
  { id: 'cor_v_right_31', x: 72, y: 31 },
  { id: 'cor_v_right_45', x: 72, y: 45 },
  { id: 'cor_v_right_54', x: 72, y: 54 },
  { id: 'cor_v_right_60', x: 72, y: 60 },
  { id: 'cor_v_right_68', x: 72, y: 68 },
  { id: 'cor_v_right_76', x: 72, y: 76 },

  // ── Pasillo transversal superior (norte de Directorio, y: 20%) ──
  { id: 'cor_h_top_54', x: 54, y: 20 },

  // ── Pasillo transversal inferior (sur, y: 76%) ──
  { id: 'cor_h_bot_28', x: 28, y: 76 },
  { id: 'cor_h_bot_50', x: 50, y: 76 },
  { id: 'cor_h_bot_55', x: 55, y: 76 }
];

/**
 * Puertas de acceso designadas para ingresar y salir de cada despacho acristalado.
 */
export const DOOR_NODES = [
  { id: 'door_direction', x: 28, y: 35, roomId: 'direction' },
  { id: 'door_operations', x: 76, y: 31, roomId: 'operations' },
  { id: 'door_experience', x: 76, y: 54, roomId: 'experience' },
  { id: 'door_meeting', x: 55, y: 60, roomId: 'meeting' },
  { id: 'door_recreation', x: 34, y: 76, roomId: 'recreation' },
  { id: 'door_commercial', x: 74, y: 68, roomId: 'commercial' },
  { id: 'door_admin', x: 28, y: 53, roomId: 'admin' },
  { id: 'door_research', x: 76, y: 22, roomId: 'research' }
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
    minX: 38, maxX: 70, minY: 22, maxY: 59,
    innerNodeId: 'meet_inner'
  },
  {
    id: 'operations',
    doorId: 'door_operations',
    minX: 74, maxX: 96, minY: 15, maxY: 42,
    innerNodeId: 'ops_inner'
  },
  {
    id: 'experience',
    doorId: 'door_experience',
    minX: 74, maxX: 96, minY: 43, maxY: 65,
    innerNodeId: 'exp_inner'
  },
  {
    id: 'commercial',
    doorId: 'door_commercial',
    minX: 73, maxX: 96, minY: 66, maxY: 92,
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
  { id: 'ops_inner', x: 84, y: 31 },
  { id: 'seat_operations', x: 91, y: 31 },

  // ── Nodos interiores y puestos en Experiencia & Campo ──
  { id: 'exp_inner', x: 84, y: 54 },
  { id: 'seat_experience', x: 91, y: 54 },

  // ── Nodos interiores en Directorio (Mesa oval de reuniones) ──
  { id: 'meet_inner', x: 56, y: 46 },
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

  // ── Espina vertical derecha (x: 72%) ──
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

  // ── Pasillo transversal medio frente a Directorio (y: 60%) ──
  ['cor_v_left_60', 'door_meeting'],
  ['door_meeting', 'cor_v_right_60'],
  ['door_meeting', 'cor_h_bot_55'],

  // ── Conexiones de Puertas a Pasillos Principales ──
  ['door_direction', 'cor_v_left_35'],
  ['door_operations', 'cor_v_right_31'],
  ['door_experience', 'cor_v_right_54'],
  ['door_commercial', 'cor_v_right_68'],
  ['door_admin', 'cor_v_left_53'],
  ['door_research', 'cor_v_right_20'],

  // ── Despacho Dirección (Diego) ──
  ['door_direction', 'dir_inner'],
  ['dir_inner', 'seat_direction'],

  // ── Despacho Operaciones (Fernando) ──
  ['door_operations', 'ops_inner'],
  ['ops_inner', 'seat_operations'],

  // ── Despacho Experiencia & Campo (Fabricio) ──
  ['door_experience', 'exp_inner'],
  ['exp_inner', 'seat_experience'],

  // ── Sala de Directorio (Directorio) ──
  ['door_meeting', 'meet_inner'],
  ['meet_inner', 'seat_meeting'],

  // ── Café & Lounge de Descanso ──
  ['door_recreation', 'seat_recreation'],
  ['door_recreation', 'rec_spot_2'],
  ['seat_recreation', 'rec_spot_3'],

  // ── Comercial, Finanzas & Academy ──
  ['door_commercial', 'comm_inner'],
  ['comm_inner', 'seat_commercial'],
  ['comm_inner', 'seat_finances'],
  ['comm_inner', 'seat_academy'],

  // ── Administración, Servicios Ambientales & Marketing ──
  ['door_admin', 'admin_inner'],
  ['admin_inner', 'seat_admin'],
  ['admin_inner', 'seat_service'],
  ['admin_inner', 'seat_marketing'],

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
 * Simplifica un camino eliminando puntos colineales redundantes o excesivamente cercanos (< 1.0%).
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
 *
 * @param {{ x: number, y: number }} startPos - Posición inicial en %
 * @param {{ x: number, y: number }} targetPos - Posición destino en %
 * @returns {Array<{ x: number, y: number }>} Secuencia ordenada de waypoints
 */
export function findPath(startPos, targetPos) {
  if (!startPos || !targetPos) return [];

  const directDist = distance(startPos, targetPos);
  if (directDist < 1.2) {
    return [{ x: targetPos.x, y: targetPos.y }];
  }

  const startRoom = getRoomForPoint(startPos);
  const targetRoom = getRoomForPoint(targetPos);

  // 1. Si ambos puntos están dentro de la misma sala cerrada, desplazarse directamente
  if (startRoom && targetRoom && startRoom.id === targetRoom.id) {
    return [
      { x: startPos.x, y: startPos.y },
      { x: targetPos.x, y: targetPos.y }
    ];
  }

  // 2. Resolver los waypoints de anclaje de salida y llegada adecuados
  const startWp = resolveWaypointForPosition(startPos, true);
  const targetWp = resolveWaypointForPosition(targetPos, false);

  if (!startWp || !targetWp) {
    return [
      { x: startPos.x, y: startPos.y },
      { x: targetPos.x, y: targetPos.y }
    ];
  }

  // 3. Trazar ruta por pasillos y puertas con Dijkstra
  const corridorPath = dijkstra(startWp.id, targetWp.id);

  // 4. Ensamblar secuencia completa: startPos -> waypoints -> targetPos sin duplicados
  const rawPoints = [{ x: startPos.x, y: startPos.y }];

  corridorPath.forEach(wp => {
    const prev = rawPoints[rawPoints.length - 1];
    if (!prev || distance(prev, wp) >= 0.5) {
      rawPoints.push({ x: wp.x, y: wp.y });
    }
  });

  const lastPrev = rawPoints[rawPoints.length - 1];
  if (!lastPrev || distance(lastPrev, targetPos) >= 0.5) {
    rawPoints.push({ x: targetPos.x, y: targetPos.y });
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

/**
 * Valida si una coordenada está dentro del área transitable de la oficina.
 */
export function isPointWalkable(x, y) {
  if (typeof x !== 'number' || typeof y !== 'number') return false;
  if (x < 6 || x > 95 || y < 14 || y > 94) return false;
  return true;
}

export default {
  ROOM_SEATS,
  CORRIDOR_NODES,
  DOOR_NODES,
  ROOM_ZONES,
  WAYPOINTS,
  EDGES,
  findPath,
  getSeatForRoom,
  getRoomForPoint,
  isPointWalkable
};
