// OfficePathfinder.js - Motor de navegación por waypoints y grafo de pasillos
// Diseñado para la oficina panorámica 16:9 pixel-art de SERAM SRL.
// Evita colisiones con muebles, escritorios y paredes conectando estaciones con pasillos transitables.

/**
 * Puntos de anclaje de llegada (sillas) para cada una de las 13 salas de la oficina.
 * Incluye orientación visual ('up' | 'down' | 'left' | 'right') para la postura de sentado.
 */
export const ROOM_SEATS = {
  admin: {
    roomId: 'admin',
    x: 12,
    y: 24,
    facing: 'down',
    name: '01. ADMINISTRACIÓN',
    deskName: 'Mesa de Roles & Gobierno'
  },
  direction: {
    roomId: 'direction',
    x: 23.5,
    y: 30,
    facing: 'down',
    name: '02. DIRECCIÓN',
    deskName: 'Escritorio Ing. Diego Barrientos'
  },
  operations: {
    roomId: 'operations',
    x: 50,
    y: 34,
    facing: 'up',
    name: '03. OPERACIONES Y PLANIFICACIÓN',
    deskName: 'Estación Hidráulica Ing. Fernando Araujo'
  },
  commercial: {
    roomId: 'commercial',
    x: 87,
    y: 68,
    facing: 'left',
    name: '04. COMERCIAL',
    deskName: 'Mesa B2B & Licitaciones SICOES'
  },
  finances: {
    roomId: 'finances',
    x: 36,
    y: 22,
    facing: 'down',
    name: '05. FINANZAS',
    deskName: 'Bóveda de Socios & Retenciones'
  },
  marketing: {
    roomId: 'marketing',
    x: 14,
    y: 52,
    facing: 'right',
    name: '06. MARKETING Y VENTAS',
    deskName: 'Estación de Embudos & Campañas'
  },
  service: {
    roomId: 'service',
    x: 58,
    y: 36,
    facing: 'up',
    name: '07. SERVICE AMBIENTAL',
    deskName: 'Mesa de Teledetección & Monitoreo'
  },
  meeting: {
    roomId: 'meeting',
    x: 65,
    y: 62,
    facing: 'down',
    name: '08. SALA DE REUNIONES',
    deskName: 'Mesa Plenaria de Directorio'
  },
  recreation: {
    roomId: 'recreation',
    x: 28,
    y: 76,
    facing: 'up',
    name: '09. SALA RECREATIVA',
    deskName: 'Sillón Lounge & Barra de Café'
  },
  academy: {
    roomId: 'academy',
    x: 69,
    y: 82,
    facing: 'up',
    name: '10. ACADEMY',
    deskName: 'Aula de Capacitación & SIG'
  },
  experience: {
    roomId: 'experience',
    x: 82,
    y: 34,
    facing: 'up',
    name: '11. EXPERIENCIA Y CAMPO',
    deskName: 'Estación Drones Ing. Fabricio Orosco'
  },
  social_media: {
    roomId: 'social_media',
    x: 48,
    y: 72,
    facing: 'up',
    name: '12. SOCIAL MEDIA',
    deskName: 'Set Audiovisual & Cámaras'
  },
  research: {
    roomId: 'research',
    x: 92,
    y: 24,
    facing: 'left',
    name: '13. INVESTIGACIÓN',
    deskName: 'Laboratorio de Mercurio (Hg)'
  }
};

/**
 * Nodos del grafo de navegación transitables (pasillos principales este-oeste y norte-sur).
 */
export const WAYPOINTS = [
  // ── Pasillo central transversal este-oeste (y: 52%) ──
  { id: 'hw_12', x: 12, y: 52 },
  { id: 'hw_18', x: 18, y: 52 },
  { id: 'hw_24', x: 24, y: 52 },
  { id: 'hw_36', x: 36, y: 52 },
  { id: 'hw_44', x: 44, y: 52 },
  { id: 'hw_50', x: 50, y: 52 },
  { id: 'hw_58', x: 58, y: 52 },
  { id: 'hw_65', x: 65, y: 52 },
  { id: 'hw_74', x: 74, y: 52 },
  { id: 'hw_82', x: 82, y: 52 },
  { id: 'hw_88', x: 88, y: 52 },
  { id: 'hw_92', x: 92, y: 52 },

  // ── Pasillos Ala Izquierda (Admin, Dirección, Marketing, Lounge Café) ──
  { id: 'c_admin_1', x: 12, y: 38 },
  { id: 'c_admin_2', x: 12, y: 28 },
  { id: 'seat_admin', x: 12, y: 24 },

  { id: 'seat_marketing', x: 14, y: 52 },

  { id: 'c_dir_1', x: 24, y: 44 },
  { id: 'c_dir_2', x: 24, y: 36 },
  { id: 'seat_direction', x: 23.5, y: 30 },

  { id: 'c_rec_1', x: 24, y: 64 },
  { id: 'c_rec_2', x: 24, y: 76 },
  { id: 'seat_recreation', x: 28, y: 76 },

  // ── Pasillos Centro-Izquierda (Finanzas) ──
  { id: 'c_fin_1', x: 36, y: 42 },
  { id: 'c_fin_2', x: 36, y: 28 },
  { id: 'seat_finances', x: 36, y: 22 },

  // ── Pasillos Centrales (Operaciones, Social Media) ──
  { id: 'c_ops_1', x: 50, y: 44 },
  { id: 'c_ops_2', x: 50, y: 38 },
  { id: 'seat_operations', x: 50, y: 34 },

  { id: 'c_soc_1', x: 48, y: 64 },
  { id: 'seat_social_media', x: 48, y: 72 },

  // ── Pasillos Centro-Derecha (Service Ambiental, Sala de Reuniones, Academy) ──
  { id: 'c_srv_1', x: 58, y: 44 },
  { id: 'c_srv_2', x: 58, y: 39 },
  { id: 'seat_service', x: 58, y: 36 },

  { id: 'c_meet_1', x: 65, y: 58 },
  { id: 'seat_meeting', x: 65, y: 62 },

  { id: 'c_acad_1', x: 65, y: 68 },
  { id: 'c_acad_2', x: 69, y: 76 },
  { id: 'seat_academy', x: 69, y: 82 },

  // ── Pasillos Ala Derecha (Experiencia, Comercial, Investigación) ──
  { id: 'c_exp_1', x: 82, y: 44 },
  { id: 'c_exp_2', x: 82, y: 38 },
  { id: 'seat_experience', x: 82, y: 34 },

  { id: 'c_comm_1', x: 88, y: 60 },
  { id: 'seat_commercial', x: 87, y: 68 },

  { id: 'c_res_1', x: 92, y: 42 },
  { id: 'c_res_2', x: 92, y: 30 },
  { id: 'seat_research', x: 92, y: 24 }
];

/**
 * Conexiones bidireccionales entre waypoints (aristas de tránsito seguro).
 */
export const EDGES = [
  // Espina central transversal
  ['hw_12', 'hw_18'],
  ['hw_18', 'hw_24'],
  ['hw_24', 'hw_36'],
  ['hw_36', 'hw_44'],
  ['hw_44', 'hw_50'],
  ['hw_50', 'hw_58'],
  ['hw_58', 'hw_65'],
  ['hw_65', 'hw_74'],
  ['hw_74', 'hw_82'],
  ['hw_82', 'hw_88'],
  ['hw_88', 'hw_92'],

  // Rama Admin & Marketing
  ['hw_12', 'c_admin_1'],
  ['c_admin_1', 'c_admin_2'],
  ['c_admin_2', 'seat_admin'],
  ['hw_12', 'seat_marketing'],

  // Rama Dirección & Lounge Café
  ['hw_24', 'c_dir_1'],
  ['c_dir_1', 'c_dir_2'],
  ['c_dir_2', 'seat_direction'],
  ['hw_24', 'c_rec_1'],
  ['c_rec_1', 'c_rec_2'],
  ['c_rec_2', 'seat_recreation'],

  // Rama Finanzas
  ['hw_36', 'c_fin_1'],
  ['c_fin_1', 'c_fin_2'],
  ['c_fin_2', 'seat_finances'],

  // Rama Operaciones & Social Media
  ['hw_50', 'c_ops_1'],
  ['c_ops_1', 'c_ops_2'],
  ['c_ops_2', 'seat_operations'],
  ['hw_50', 'c_soc_1'],
  ['c_soc_1', 'seat_social_media'],

  // Rama Service Ambiental, Directorio & Academy
  ['hw_58', 'c_srv_1'],
  ['c_srv_1', 'c_srv_2'],
  ['c_srv_2', 'seat_service'],
  ['hw_65', 'c_meet_1'],
  ['c_meet_1', 'seat_meeting'],
  ['hw_65', 'c_acad_1'],
  ['c_acad_1', 'c_acad_2'],
  ['c_acad_2', 'seat_academy'],

  // Rama Experiencia, Comercial & Investigación
  ['hw_82', 'c_exp_1'],
  ['c_exp_1', 'c_exp_2'],
  ['c_exp_2', 'seat_experience'],
  ['hw_88', 'c_comm_1'],
  ['c_comm_1', 'seat_commercial'],
  ['hw_92', 'c_res_1'],
  ['c_res_1', 'c_res_2'],
  ['c_res_2', 'seat_research']
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
 * Encuentra el waypoint más cercano a un punto dado.
 * Puede excluir opcionalmente nodos de asientos terminales para evitar transitar por escritorios ajenos.
 */
function findClosestWaypoint(pos, excludeSeats = false) {
  let closest = null;
  let minDist = Infinity;

  for (const wp of WAYPOINTS) {
    if (excludeSeats && wp.id.startsWith('seat_')) continue;
    const d = distance(pos, wp);
    if (d < minDist) {
      minDist = d;
      closest = wp;
    }
  }

  return closest;
}

/**
 * Algoritmo Dijkstra / A* sobre el grafo de pasillos.
 * Retorna un array de objetos `{ x, y, id }`.
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
    // Extraer nodo no visitado con menor distancia
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

  // Reconstrucción del camino desde targetId hacia startId
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
 * Simplifica un camino eliminando puntos colineales redundantes o demasiado cercanos (< 1.2%).
 */
function simplifyPath(points) {
  if (!points || points.length <= 2) return points || [];

  const result = [points[0]];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = result[result.length - 1];
    const curr = points[i];
    const next = points[i + 1];

    // Si está demasiado cerca del punto anterior, saltarlo
    if (distance(prev, curr) < 1.0) continue;

    // Verificar colinealidad (mismo vector de dirección)
    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    const crossProduct = Math.abs(dx1 * dy2 - dy1 * dx2);
    const dotProduct = dx1 * dx2 + dy1 * dy2;

    // Si los vectores son paralelos y apuntan en la misma dirección, omitir curr
    if (crossProduct < 0.05 && dotProduct > 0) {
      continue;
    }

    result.push(curr);
  }

  result.push(points[points.length - 1]);
  return result;
}

/**
 * Función principal de navegación: calcula el camino óptimo continuo entre `startPos` y `targetPos`.
 * @param {{ x: number, y: number }} startPos - Posición inicial
 * @param {{ x: number, y: number }} targetPos - Posición destino
 * @returns {Array<{ x: number, y: number }>} Secuencia ordenada de waypoints
 */
export function findPath(startPos, targetPos) {
  if (!startPos || !targetPos) return [];

  const directDist = distance(startPos, targetPos);
  // Si la distancia es insignificante, no moverse
  if (directDist < 1.5) {
    return [{ x: targetPos.x, y: targetPos.y }];
  }

  // 1. Si ambos están en el pasillo principal central (|y - 52| < 3), línea recta directa
  if (Math.abs(startPos.y - 52) < 3 && Math.abs(targetPos.y - 52) < 3) {
    return [
      { x: startPos.x, y: startPos.y },
      { x: targetPos.x, y: targetPos.y }
    ];
  }

  // 2. Conectar inicio con el nodo de pasillo más cercano
  const startWaypoint = findClosestWaypoint(startPos, true);
  // Conectar destino con su waypoint más cercano (puede ser asiento si target está cerca de una silla)
  const targetWaypoint = findClosestWaypoint(targetPos, false);

  if (!startWaypoint || !targetWaypoint) {
    return [
      { x: startPos.x, y: startPos.y },
      { x: targetPos.x, y: targetPos.y }
    ];
  }

  // 3. Trazar ruta por pasillos con Dijkstra
  const corridorPath = dijkstra(startWaypoint.id, targetWaypoint.id);

  // 4. Ensamblar secuencia completa: startPos -> waypoints de pasillo -> targetPos
  const rawPoints = [{ x: startPos.x, y: startPos.y }];

  corridorPath.forEach(wp => {
    rawPoints.push({ x: wp.x, y: wp.y });
  });

  rawPoints.push({ x: targetPos.x, y: targetPos.y });

  // 5. Simplificar y retornar camino pulido
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
  // Límites generales de la oficina 16:9
  if (x < 8 || x > 94 || y < 18 || y > 88) return false;

  // Obstáculos conocidos (paredes divisorias gruesas o huecos de escaleras/ventanas si aplican)
  return true;
}

export default {
  ROOM_SEATS,
  WAYPOINTS,
  EDGES,
  findPath,
  getSeatForRoom,
  isPointWalkable
};
