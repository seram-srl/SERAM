/**
 * xpEngine.js — Motor de Gamificación y Niveles Meritocráticos de SERAM
 *
 * Reglas de Cálculo:
 * 1. Base XP = Horas reales registradas x 100 x Multiplicador de Dificultad
 *    - Baja / Rutinaria: 1.0x
 *    - Media / Operativa: 1.5x
 *    - Alta / Especializada: 2.0x
 *    - Crítica / Pericial Estratégica: 3.0x
 * 2. Bonus de Entrega Temprana: +10% de XP si se valida antes del plazo límite.
 * 3. Penalización Progresiva por Retraso:
 *    - 1 a 7 días de retraso: -25% de XP
 *    - 8 a 14 días de retraso: -50% de XP
 *    - 15 a 21 días de retraso: -75% de XP
 *    - > 21 días de retraso (4ta semana): -100% (0 XP ganado)
 * 4. Tiers & Multiplicador de Honorarios:
 *    - Nivel 1 (0 - 500 XP): "Aspirante Técnico" | Multiplicador: 1.0x
 *    - Nivel 2 (501 - 1,500 XP): "Especialista Ambiental" | Multiplicador: 1.25x
 *    - Nivel 3 (1,501 - 3,500 XP): "Consultor Perito Senior" | Multiplicador: 1.50x
 *    - Nivel 4 (3,501 - 7,000 XP): "Director de Proyectos" | Multiplicador: 1.75x
 *    - Nivel 5 (> 7,000 XP): "Socio Maestro / Partner Supremo" | Multiplicador: 2.00x
 */

export const DIFFICULTY_MULTIPLIERS = {
  Baja: 1.0,
  Media: 1.5,
  Alta: 2.0,
  Critica: 3.0,
  // Normalizaciones por compatibilidad con prioridades
  Normal: 1.5,
  Urgente: 2.5,
};

export const TIERS = [
  {
    level: 1,
    title: 'Aspirante Técnico',
    minXP: 0,
    maxXP: 500,
    feeMultiplier: 1.0,
    badgeColor: 'border-slate-500/30 text-slate-300 bg-slate-500/10',
    color: '#94a3b8',
    description: 'Fase de inducción y primeros entregables verificados.',
  },
  {
    level: 2,
    title: 'Especialista Ambiental',
    minXP: 501,
    maxXP: 1500,
    feeMultiplier: 1.25,
    badgeColor: 'border-emerald-500/30 text-emerald-300 bg-emerald-500/10',
    color: '#00e03c',
    description: 'Autonomía técnica comprobada en campo, gabinete y normativa.',
  },
  {
    level: 3,
    title: 'Consultor Perito Senior',
    minXP: 1501,
    maxXP: 3500,
    feeMultiplier: 1.5,
    badgeColor: 'border-blue-500/30 text-blue-300 bg-blue-500/10',
    color: '#3b82f6',
    description: 'Liderazgo pericial en proyectos de alta complejidad y licitaciones.',
  },
  {
    level: 4,
    title: 'Director de Proyectos',
    minXP: 3501,
    maxXP: 7000,
    feeMultiplier: 1.75,
    badgeColor: 'border-purple-500/30 text-purple-300 bg-purple-500/10',
    color: '#a855f7',
    description: 'Gestión integral de cartera B2B, clientes institucionales y control de calidad.',
  },
  {
    level: 5,
    title: 'Socio Maestro · Partner Supremo',
    minXP: 7001,
    maxXP: Infinity,
    feeMultiplier: 2.0,
    badgeColor: 'border-amber-500/30 text-amber-300 bg-amber-500/10',
    color: '#f59e0b',
    description: 'Máximo rango directivo. Visión holística, auditoría y equidad societaria.',
  },
];

/**
 * Calcula el XP ganado al aprobar un entregable o tarea.
 *
 * @param {Object} params
 * @param {number} params.hours - Horas reales registradas en la tarea
 * @param {string} [params.difficulty='Media'] - Dificultad ('Baja' | 'Media' | 'Alta' | 'Critica')
 * @param {string|Date} [params.deadline] - Plazo límite acordado (ISO string o 'YYYY-MM-DD')
 * @param {string|Date} [params.completedAt] - Fecha de entrega / aprobación
 * @returns {Object} Desglose completo del cálculo de XP
 */
export function calculateTaskXP({
  hours = 1,
  difficulty = 'Media',
  deadline = null,
  completedAt = new Date(),
}) {
  const safeHours = Math.max(0.25, Number(hours) || 1);
  const diffMultiplier = DIFFICULTY_MULTIPLIERS[difficulty] || 1.5;
  const baseXP = Math.round(safeHours * 100 * diffMultiplier);

  let bonusXP = 0;
  let penaltyXP = 0;
  let delayDays = 0;
  let isEarly = false;
  let isOverdue = false;

  if (deadline) {
    const deadlineDate = new Date(deadline);
    const finishDate = new Date(completedAt);

    if (!isNaN(deadlineDate.getTime()) && !isNaN(finishDate.getTime())) {
      const diffMs = finishDate.getTime() - deadlineDate.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        // Entrega a tiempo o anticipada -> Bonus +10%
        isEarly = true;
        bonusXP = Math.round(baseXP * 0.1);
      } else {
        // Entrega con retraso -> Penalización por semanas
        isOverdue = true;
        delayDays = diffDays;
        const weeksLate = Math.ceil(diffDays / 7);

        if (weeksLate === 1) {
          penaltyXP = Math.round(baseXP * 0.25);
        } else if (weeksLate === 2) {
          penaltyXP = Math.round(baseXP * 0.50);
        } else if (weeksLate === 3) {
          penaltyXP = Math.round(baseXP * 0.75);
        } else {
          // 4 o más semanas vencida -> 0 XP ganado
          penaltyXP = baseXP;
        }
      }
    }
  }

  const finalXP = Math.max(0, baseXP + bonusXP - penaltyXP);

  return {
    baseXP,
    bonusXP,
    penaltyXP,
    finalXP,
    isEarly,
    isOverdue,
    delayDays,
    diffMultiplier,
    hours: safeHours,
  };
}

/**
 * Obtiene el rango y tier de un socio en base a su XP acumulado.
 *
 * @param {number} totalXP
 * @returns {Object} Objeto del tier correspondiente con progreso relativo al siguiente nivel.
 */
export function getPartnerTier(totalXP = 0) {
  const safeXP = Math.max(0, Number(totalXP) || 0);
  const tier = TIERS.find(t => safeXP >= t.minXP && safeXP <= t.maxXP) || TIERS[TIERS.length - 1];
  const nextTier = TIERS.find(t => t.level === tier.level + 1) || null;

  let progressPercent = 100;
  let xpForNext = 0;

  if (nextTier) {
    const range = tier.maxXP - tier.minXP;
    const currentInRange = safeXP - tier.minXP;
    progressPercent = Math.min(100, Math.max(0, Math.round((currentInRange / range) * 100)));
    xpForNext = tier.maxXP + 1 - safeXP;
  }

  return {
    ...tier,
    currentXP: safeXP,
    progressPercent,
    nextTier,
    xpForNext,
  };
}

/**
 * Calcula el XP total acumulado por un socio en base a sus actividades aprobadas.
 *
 * @param {string} partnerName - Nombre completo del socio
 * @param {Array} activities - Lista de actividades del sistema
 * @param {Array} timeLogs - Registros de horas del socio
 * @returns {Object} Resumen de XP y tier
 */
export function calculatePartnerTotalXP(partnerName, activities = [], timeLogs = []) {
  if (!partnerName) return getPartnerTier(0);

  // 1. XP de actividades concluidas y aprobadas
  const partnerActs = (activities || []).filter(
    a => a.assignedPartner === partnerName && (a.status === 'Concluido' || a.status === 'Aprobado')
  );

  let activitiesXP = 0;
  partnerActs.forEach(act => {
    if (act.xp_awarded !== undefined && act.xp_awarded !== null) {
      activitiesXP += Number(act.xp_awarded) || 0;
    } else {
      // Cálculo retroactivo automático para tareas previas verificadas
      const hours = Number(act.estimatedHours) || Number(act.hours) || 2;
      const diff = act.priority === 'Alta' ? 'Alta' : (act.priority === 'Urgente' ? 'Critica' : 'Media');
      const calc = calculateTaskXP({
        hours,
        difficulty: diff,
        deadline: act.deadline,
        completedAt: act.completed_at || act.created_at,
      });
      activitiesXP += calc.finalXP;
    }
  });

  // 2. XP base por horas registradas en Time Tracker (50 XP por hora registrada verificada)
  const partnerLogs = (timeLogs || []).filter(
    l => l.partner_name === partnerName || l.partner_id?.includes(partnerName.split(' ')[1]?.toLowerCase() || '')
  );
  const timeTrackerHours = partnerLogs.reduce((acc, curr) => acc + (Number(curr.hours) || 0), 0);
  const timeTrackerXP = Math.round(timeTrackerHours * 50);

  const totalXP = activitiesXP + timeTrackerXP;

  return {
    ...getPartnerTier(totalXP),
    activitiesXP,
    timeTrackerXP,
    totalHours: timeTrackerHours,
    completedTasksCount: partnerActs.length,
  };
}

/**
 * Valida si un socio tiene permiso para aprobar una tarea (Anti-Cheat).
 * Regla de Oro: Nadie puede auto-aprobarse sus propias tareas.
 *
 * @param {Object} currentSocio - Socio conectado que intenta aprobar
 * @param {Object} task - Tarea que se busca validar
 * @returns {Object} { canApprove: boolean, reason: string }
 */
export function validateCrossApproval(currentSocio, task) {
  if (!currentSocio || !currentSocio.name) {
    return {
      canApprove: false,
      reason: 'Debes iniciar sesión como socio directivo para validar entregables.',
    };
  }

  if (task.assignedPartner === currentSocio.name) {
    return {
      canApprove: false,
      reason: 'Principio Anti-Cheat: No puedes auto-aprobar tus propias tareas. La validación debe ser efectuada por otro socio directivo.',
    };
  }

  return {
    canApprove: true,
    reason: 'Validación entre pares autorizada.',
  };
}
