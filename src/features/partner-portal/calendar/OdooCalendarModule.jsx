/**
 * @file OdooCalendarModule.jsx
 * @description Módulo de Calendario y Planificación Horaria inspirado en Odoo Calendar para SERAM SRL.
 * Incluye:
 * - Escalas de visualización: Mes, Semana, Día y Agenda Lineal.
 * - Control de Capacidad de Teletrabajo de Socios: 4.5 hrs/día (Fase Temprana) conmutable a 8.0 hrs/día (Fase Intensiva).
 * - Reprogramación fluida Drag & Drop entre días y franjas horarias con recálculo automático de carga horaria.
 * - Sistema de Etiquetas Libres personalizables por cada socio (Plan de Ventas Telefónicas, Formato Vertical, Lead Magnets, SIG, etc.).
 * - Cierre y Entrega Rápida en el Día: registra horas reales en el Time Tracker, publica en el Chatter del CRM y acredita XP.
 * - Motor de Sincronización y Alertas en Segundo Plano hacia Google Calendar mediante Google Apps Script (doPost) y/o n8n Webhook
 *   para Socio A (Ing. Diego Barrientos) y Socio B (Ing. Fernando Araujo), más exportación directa .ics y Google Calendar URL.
 *
 * Directrices: Cero emoticones, 100% en español, modales en document.body (z-[9999]).
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight,
  CheckCircle2, AlertCircle, X, Check, User, Users, Building2,
  Tag, Send, ExternalLink, Download, Copy, Settings, RefreshCw,
  Phone, FileText, Zap, ShieldCheck, Layers, List, LayoutGrid,
  Search, Trash2, ArrowRight, Bell, Terminal
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { armService } from '../../../services/armService';

// ── SOCIOS PRINCIPALES PARA SINCRONIZACIÓN CON GOOGLE CALENDAR ──────────────
const PARTNERS_CONFIG = [
  {
    id: 'socio_a',
    name: 'Ing. Diego Barrientos',
    shortName: 'Diego Barrientos (Socio A)',
    initials: 'DB',
    email: 'barrientoso2401@gmail.com',
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  },
  {
    id: 'socio_b',
    name: 'Ing. Fernando Araujo',
    shortName: 'Fernando Araujo (Socio B)',
    initials: 'FA',
    email: 'fernandoaraujo1912@gmail.com',
    color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
  }
];

// ── PALETA NEUFORM PARA ETIQUETAS LIBRES DE LOS SOCIOS ──────────────────────
const FREE_TAG_COLOR_PALETTE = [
  { id: 'emerald', label: 'Verde SERAM', className: 'bg-[#00e03c]/15 text-[#00e03c] border-[#00e03c]/40' },
  { id: 'amber', label: 'Oro / Ámbar', className: 'bg-amber-500/15 text-amber-300 border-amber-500/40' },
  { id: 'cyan', label: 'Cian Técnico', className: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40' },
  { id: 'purple', label: 'Púrpura Inbound', className: 'bg-purple-500/15 text-purple-300 border-purple-500/40' },
  { id: 'rose', label: 'Coral / Urgente', className: 'bg-rose-500/15 text-rose-300 border-rose-500/40' },
  { id: 'blue', label: 'Azul Corporativo', className: 'bg-blue-500/15 text-blue-300 border-blue-500/40' }
];

const DEFAULT_FREE_TAGS = [
  { id: 'tag-ventas-tel', name: 'Seguimiento Telefónico BANT', colorId: 'emerald' },
  { id: 'tag-video-vert', name: 'Content Marketing Vertical / Reels', colorId: 'purple' },
  { id: 'tag-lead-magnet', name: 'Lead Magnet Inbound', colorId: 'amber' },
  { id: 'tag-cierre', name: 'Cierre Comercial Directo', colorId: 'rose' },
  { id: 'tag-sig', name: 'Gabinete SIG & Modelación', colorId: 'cyan' },
  { id: 'tag-reunion', name: 'Reunión de Socios / Directorio', colorId: 'blue' }
];

const STORAGE_KEYS = {
  TELEWORK_CAP: 'seram_calendar_telework_cap_v1',
  FREE_TAGS: 'seram_calendar_free_tags_v1',
  CUSTOM_EVENTS: 'seram_calendar_custom_events_v1',
  SYNC_CONFIG: 'seram_calendar_sync_config_v1',
  SYNC_LOGS: 'seram_calendar_sync_logs_v1'
};

// ── CÓDIGO LISTO PARA COPIAR: GOOGLE APPS SCRIPT (CUENTA SERAM) ─────────────
const GOOGLE_APPS_SCRIPT_CODE = `/**
 * SERAM SRL — Puente Automático de Notificaciones y Google Calendar (Code.gs)
 * Instrucciones:
 * 1. Abre https://script.google.com con la cuenta institucional de SERAM.
 * 2. Pega este código en Code.gs y haz clic en "Implementar" -> "Nueva implementación".
 * 3. Selecciona tipo "Aplicación web", Ejecutar como: "Yo", Acceso: "Cualquier persona".
 * 4. Copia la URL generada y pégala en el campo "URL Web App Google Apps Script" en SERAM.
 */

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var cal = CalendarApp.getDefaultCalendar();

    var title = "[SERAM] " + (payload.title || "Actividad Programada");
    var startDate = new Date(payload.startDate + "T" + (payload.startTime || "08:30") + ":00");
    var endDate = new Date((payload.dueDate || payload.startDate) + "T" + (payload.endTime || "10:00") + ":00");

    // Si la fecha final es menor o igual a la inicial, sumar horas estimadas
    if (endDate <= startDate) {
      var hours = Number(payload.estimatedHours) || 1.5;
      endDate = new Date(startDate.getTime() + hours * 3600 * 1000);
    }

    var guestsList = payload.guests || "barrientoso2401@gmail.com,fernandoaraujo1912@gmail.com";
    var description = [
      "Sistema Odoo Calendar & ARM — SERAM SRL",
      "Acción: " + (payload.eventType || "programacion"),
      "Responsable: " + (payload.responsible || "Socio SERAM"),
      "Cliente / Oportunidad: " + (payload.clientName || "Gestión Interna"),
      "Dedicación Estimada: " + (payload.estimatedHours || 1.5) + " hrs (Meta Teletrabajo: " + (payload.dailyCap || 4.5) + " hrs/día)",
      "Etiquetas: " + ((payload.tags || []).join(", ") || "General"),
      "Notas / Descripción: " + (payload.description || "Sin descripción adicional")
    ].join("\\n");

    var event = cal.createEvent(title, startDate, endDate, {
      description: description,
      location: payload.location || "Teletrabajo SERAM / Virtual",
      guests: guestsList,
      sendInvites: true
    });

    event.addPopupReminder(30);
    event.addPopupReminder(10);
    event.addEmailReminder(60);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, eventId: event.getId(), status: "scheduled" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

// ── WORKFLOW JSON LISTO PARA IMPORTAR EN N8N ────────────────────────────────
const N8N_WORKFLOW_TEMPLATE = JSON.stringify(
  {
    name: 'SERAM — Sincronización Automática de Actividades a Google Calendar (Socio A y Socio B)',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'seram-calendar-sync',
          responseMode: 'onReceived',
          options: {}
        },
        name: 'Webhook Calendario SERAM',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [240, 300]
      },
      {
        parameters: {
          calendar: 'barrientoso2401@gmail.com',
          start: '={{$json["startIso"]}}',
          end: '={{$json["endIso"]}}',
          additionalFields: {
            summary: '=[SERAM] {{$json["title"]}}',
            description: '=Responsable: {{$json["responsible"]}} | Cliente: {{$json["clientName"]}} | Horas: {{$json["estimatedHours"]}}h',
            attendees: ['barrientoso2401@gmail.com', 'fernandoaraujo1912@gmail.com'],
            sendUpdates: 'all'
          }
        },
        name: 'Google Calendar Socios SERAM',
        type: 'n8n-nodes-base.googleCalendar',
        typeVersion: 1,
        position: [520, 300]
      }
    ],
    connections: {
      'Webhook Calendario SERAM': {
        main: [[{ node: 'Google Calendar Socios SERAM', type: 'main', index: 0 }]]
      }
    }
  },
  null,
  2
);

// ── HELPERS DE FECHA Y CALENDARIO ───────────────────────────────────────────
function toIsoDateStr(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(dateStr, days) {
  const parts = String(dateStr).split('-').map(Number);
  if (parts.length !== 3) return dateStr;
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  dt.setDate(dt.getDate() + days);
  return toIsoDateStr(dt);
}

function isDateBetween(dayStr, startStr, endStr) {
  const s = startStr || endStr;
  const e = endStr || startStr;
  if (!s) return false;
  return dayStr >= s && dayStr <= e;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const DAY_NAMES_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

export default function OdooCalendarModule({ currentSocio, compactMode = false, onNavigate }) {
  const {
    activities = [],
    clients = [],
    activeServices = [],
    handleAddActivity,
    handleUpdateActivityStatus,
    handleAddTimeLog,
    triggerToast
  } = useApp();

  // ── 1. CONFIGURACIÓN DE CAPACIDAD DIARIA (4.5 HRS TEMPRANA <-> 8.0 HRS INTENSIVA) ──
  const [dailyCapHours, setDailyCapHours] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TELEWORK_CAP);
      return saved ? parseFloat(saved) : 4.5;
    } catch {
      return 4.5;
    }
  });

  const handleToggleDailyCap = (newCap) => {
    setDailyCapHours(newCap);
    try {
      localStorage.setItem(STORAGE_KEYS.TELEWORK_CAP, String(newCap));
    } catch {
      // Ignorar error de almacenamiento
    }
    triggerToast?.(
      `Meta de teletrabajo ajustada a ${newCap} hrs/día por socio (${newCap === 4.5 ? 'Fase Temprana' : 'Fase Intensiva Escalada'})`,
      'success'
    );
  };

  // ── 2. NAVEGACIÓN Y ESCALAS DEL CALENDARIO ODOO ──
  const [activeSection, setActiveSection] = useState('calendar'); // 'calendar' | 'sales_plan' | 'tags' | 'automation'
  const [scaleMode, setScaleMode] = useState('month'); // 'month' | 'week' | 'day' | 'agenda'
  const [cursorDate, setCursorDate] = useState(() => new Date());
  const [partnerFilter, setPartnerFilter] = useState('all'); // 'all' | 'Ing. Diego Barrientos' | 'Ing. Fernando Araujo'
  const [tagFilter, setTagFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ── 3. ETIQUETAS LIBRES PERSONALIZADAS POR LOS SOCIOS ──
  const [freeTags, setFreeTags] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FREE_TAGS);
      return saved ? JSON.parse(saved) : DEFAULT_FREE_TAGS;
    } catch {
      return DEFAULT_FREE_TAGS;
    }
  });
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('emerald');

  // ── 4. METADATOS LOCALES DE CALENDARIO Y EVENTOS RÁPIDOS ──
  const [calendarOverrides, setCalendarOverrides] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOM_EVENTS);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const saveCalendarOverrides = useCallback((nextOverrides) => {
    setCalendarOverrides(nextOverrides);
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_EVENTS, JSON.stringify(nextOverrides));
    } catch {
      // Ignorar cuota
    }
  }, []);

  // ── 5. DATOS DEL CRM (LEADS Y MISIONES) ──
  const [crmLeads, setCrmLeads] = useState([]);
  const [crmActivities, setCrmActivities] = useState([]);

  const refreshCrmItems = useCallback(async () => {
    const loadedLeads = await armService.getLeads(clients);
    setCrmLeads(loadedLeads || []);
    setCrmActivities(armService.getAllLeadActivities() || []);
  }, [clients]);

  useEffect(() => {
    refreshCrmItems();
  }, [refreshCrmItems]);

  // ── 6. CONFIGURACIÓN Y MOTOR DE NOTIFICACIONES EN SEGUNDO PLANO (GOOGLE APPS SCRIPT & N8N) ──
  const [syncConfig, setSyncConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SYNC_CONFIG);
      return saved
        ? JSON.parse(saved)
        : {
            appsScriptUrl: '',
            n8nWebhookUrl: '',
            autoSyncOnCreate: true,
            autoSyncOnReschedule: true,
            autoSyncOnComplete: true,
            notifySocioA: true,
            notifySocioB: true,
            socioAEmail: 'barrientoso2401@gmail.com',
            socioBEmail: 'fernandoaraujo1912@gmail.com'
          };
    } catch {
      return {
        appsScriptUrl: '',
        n8nWebhookUrl: '',
        autoSyncOnCreate: true,
        autoSyncOnReschedule: true,
        autoSyncOnComplete: true,
        notifySocioA: true,
        notifySocioB: true,
        socioAEmail: 'barrientoso2401@gmail.com',
        socioBEmail: 'fernandoaraujo1912@gmail.com'
      };
    }
  });

  const [syncLogs, setSyncLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SYNC_LOGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSaveSyncConfig = (nextConfig) => {
    setSyncConfig(nextConfig);
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_CONFIG, JSON.stringify(nextConfig));
    } catch {
      // Ignorar
    }
  };

  /**
   * Despachador en Segundo Plano (Non-blocking) hacia Google Apps Script y n8n
   */
  const dispatchBackgroundCalendarSync = useCallback(
    async (eventType, eventData) => {
      const guests = [];
      if (syncConfig.notifySocioA && syncConfig.socioAEmail) guests.push(syncConfig.socioAEmail);
      if (syncConfig.notifySocioB && syncConfig.socioBEmail) guests.push(syncConfig.socioBEmail);

      const startIso = `${eventData.startDate}T${eventData.startTime || '08:30'}:00`;
      const endIso = `${eventData.dueDate || eventData.startDate}T${eventData.endTime || '10:00'}:00`;

      const payload = {
        eventType,
        timestamp: new Date().toISOString(),
        title: eventData.title,
        description: eventData.description || '',
        clientName: eventData.clientName || 'Gestión SERAM',
        responsible: eventData.responsible || currentSocio?.name || 'Ing. Diego Barrientos',
        participants: eventData.participants || [eventData.responsible || 'Ing. Diego Barrientos'],
        startDate: eventData.startDate,
        dueDate: eventData.dueDate || eventData.startDate,
        startTime: eventData.startTime || '08:30',
        endTime: eventData.endTime || '10:00',
        startIso,
        endIso,
        estimatedHours: Number(eventData.estimatedHours) || 1.5,
        actualHours: Number(eventData.actualHours) || 0,
        dailyCap: dailyCapHours,
        tags: eventData.tags || [],
        guests: guests.join(',')
      };

      const targets = [];
      if (syncConfig.appsScriptUrl?.trim()) {
        targets.push({ name: 'Google Apps Script (SERAM)', url: syncConfig.appsScriptUrl.trim() });
      }
      if (syncConfig.n8nWebhookUrl?.trim()) {
        targets.push({ name: 'n8n Workflow Webhook', url: syncConfig.n8nWebhookUrl.trim() });
      }

      let statusLabel = 'En cola local (Configura URL en pestaña Automatización)';
      if (targets.length > 0) {
        statusLabel = `Enviado en 2do plano a ${targets.map(t => t.name).join(' + ')}`;
        // Ejecución asíncrona no bloqueante en segundo plano
        Promise.allSettled(
          targets.map(target =>
            fetch(target.url, {
              method: 'POST',
              mode: 'no-cors',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            })
          )
        ).catch(() => {
          // Respaldo silencioso en caso de desconexión temporal
        });
      }

      const logItem = {
        id: `sync-${Date.now()}`,
        time: new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        date: toIsoDateStr(new Date()),
        eventType,
        title: payload.title,
        responsible: payload.responsible,
        guests: payload.guests,
        status: statusLabel
      };

      setSyncLogs(prev => {
        const next = [logItem, ...prev].slice(0, 40);
        try {
          localStorage.setItem(STORAGE_KEYS.SYNC_LOGS, JSON.stringify(next));
        } catch {
          // Ignorar
        }
        return next;
      });
    },
    [syncConfig, dailyCapHours, currentSocio]
  );

  // ── 7. UNIFICACIÓN DE EVENTOS DEL ECOSISTEMA (ACTIVIDADES GLOBALES + MISIONES CRM) ──
  const unifiedEvents = useMemo(() => {
    const todayStr = toIsoDateStr(new Date());
    const map = new Map();

    // A) Actividades Globales del Portal de Socios
    (activities || []).forEach(act => {
      const key = `act-${act.id}`;
      const ov = calendarOverrides[key] || {};
      const startDate = ov.startDate || act.startDate || act.dueDate || todayStr;
      const dueDate = ov.dueDate || act.dueDate || startDate;
      const responsible = ov.responsible || act.assignedPartner || act.responsible || 'Ing. Diego Barrientos';
      const participants = ov.participants || act.assignedTeam || act.participants || [responsible];

      map.set(key, {
        uid: key,
        rawId: act.id,
        source: 'activities',
        title: ov.title || act.title || 'Actividad Operativa',
        description: ov.description || act.description || '',
        startDate,
        dueDate: dueDate >= startDate ? dueDate : startDate,
        startTime: ov.startTime || act.startTime || '08:30',
        endTime: ov.endTime || act.endTime || '10:00',
        estimatedHours: Number(ov.estimatedHours ?? act.estimatedHours ?? 1.5),
        actualHours: Number(ov.actualHours ?? act.actualHours ?? 0),
        status: ov.status || act.status || 'Pendiente',
        priority: ov.priority || act.priority || 'Media',
        responsible,
        participants,
        clientName: ov.clientName || act.clientName || '',
        leadId: ov.leadId || act.leadId || null,
        projectId: act.projectId || null,
        tags: ov.tags || act.freeTags || ['Seguimiento Telefónico BANT'],
        deliverableNote: ov.deliverableNote || act.deliverableUrl || ''
      });
    });

    // B) Actividades Comerciales del CRM (ARM Odoo)
    (crmActivities || []).forEach(crmAct => {
      const key = `crm-${crmAct.id}`;
      const ov = calendarOverrides[key] || {};
      const parentLead = crmLeads.find(l => String(l.id) === String(crmAct.lead_id));
      const startDate = ov.startDate || crmAct.fecha_inicio || crmAct.fecha_vencimiento || todayStr;
      const dueDate = ov.dueDate || crmAct.fecha_vencimiento || startDate;
      const isDone = ov.status === 'Concluido' || crmAct.estado === 'completada';

      map.set(key, {
        uid: key,
        rawId: crmAct.id,
        source: 'crm',
        title: ov.title || crmAct.titulo || 'Seguimiento Comercial CRM',
        description: ov.description || crmAct.resumen || '',
        startDate,
        dueDate: dueDate >= startDate ? dueDate : startDate,
        startTime: ov.startTime || '10:00',
        endTime: ov.endTime || '11:30',
        estimatedHours: Number(ov.estimatedHours ?? 1.5),
        actualHours: Number(ov.actualHours ?? (isDone ? 1.5 : 0)),
        status: isDone ? 'Concluido' : 'Pendiente',
        priority: crmAct.categoria_mision === 'flash' ? 'Alta' : 'Media',
        responsible: ov.responsible || crmAct.responsable || 'Ing. Diego Barrientos',
        participants: ov.participants || crmAct.participantes || [crmAct.responsable || 'Ing. Diego Barrientos'],
        clientName: ov.clientName || parentLead?.empresa || parentLead?.nombre || 'Cliente CRM',
        leadId: crmAct.lead_id,
        xpReward: crmAct.xp_otorgado || 75,
        tags: ov.tags || ['Seguimiento Telefónico BANT'],
        deliverableNote: ov.deliverableNote || crmAct.evidencia_nota || ''
      });
    });

    // C) Eventos creados directamente en el Calendario que aún no estaban en la lista
    Object.entries(calendarOverrides).forEach(([key, ov]) => {
      if (key.startsWith('cal-direct-') && !map.has(key)) {
        map.set(key, {
          uid: key,
          rawId: key,
          source: 'calendar',
          title: ov.title || 'Bloque de Teletrabajo',
          description: ov.description || '',
          startDate: ov.startDate || todayStr,
          dueDate: ov.dueDate || ov.startDate || todayStr,
          startTime: ov.startTime || '09:00',
          endTime: ov.endTime || '10:30',
          estimatedHours: Number(ov.estimatedHours ?? 1.5),
          actualHours: Number(ov.actualHours ?? 0),
          status: ov.status || 'Pendiente',
          priority: ov.priority || 'Media',
          responsible: ov.responsible || currentSocio?.name || 'Ing. Diego Barrientos',
          participants: ov.participants || [ov.responsible || 'Ing. Diego Barrientos'],
          clientName: ov.clientName || '',
          leadId: ov.leadId || null,
          tags: ov.tags || [],
          deliverableNote: ov.deliverableNote || ''
        });
      }
    });

    return Array.from(map.values()).filter(ev => {
      if (partnerFilter !== 'all') {
        const matchPartner =
          ev.responsible === partnerFilter ||
          (Array.isArray(ev.participants) && ev.participants.includes(partnerFilter));
        if (!matchPartner) return false;
      }
      if (tagFilter !== 'all') {
        if (!Array.isArray(ev.tags) || !ev.tags.includes(tagFilter)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchText =
          ev.title.toLowerCase().includes(q) ||
          (ev.clientName && ev.clientName.toLowerCase().includes(q)) ||
          (ev.description && ev.description.toLowerCase().includes(q));
        if (!matchText) return false;
      }
      return true;
    });
  }, [activities, crmActivities, crmLeads, calendarOverrides, partnerFilter, tagFilter, searchQuery, currentSocio]);

  // ── 8. CÁLCULO DE CELDAS DE MES, SEMANA Y DÍA ──
  const monthDaysGrid = useMemo(() => {
    const year = cursorDate.getFullYear();
    const month = cursorDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Ajustar para que la semana empiece en Lunes (0 = Lunes ... 6 = Domingo)
    const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
    const totalDays = lastDayOfMonth.getDate();

    const cells = [];
    for (let i = startOffset - 1; i >= 0; i--) {
      const dt = new Date(year, month, -i);
      cells.push({ dateObj: dt, dateStr: toIsoDateStr(dt), isCurrentMonth: false });
    }
    for (let d = 1; d <= totalDays; d++) {
      const dt = new Date(year, month, d);
      cells.push({ dateObj: dt, dateStr: toIsoDateStr(dt), isCurrentMonth: true });
    }
    while (cells.length % 7 !== 0) {
      const lastDt = cells[cells.length - 1].dateObj;
      const nextDt = new Date(lastDt.getFullYear(), lastDt.getMonth(), lastDt.getDate() + 1);
      cells.push({ dateObj: nextDt, dateStr: toIsoDateStr(nextDt), isCurrentMonth: false });
    }
    return cells;
  }, [cursorDate]);

  const weekDaysGrid = useMemo(() => {
    const dayOfWeek = (cursorDate.getDay() + 6) % 7; // Lunes = 0
    const monday = new Date(cursorDate.getFullYear(), cursorDate.getMonth(), cursorDate.getDate() - dayOfWeek);
    return Array.from({ length: 7 }, (_, idx) => {
      const dt = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + idx);
      return { dateObj: dt, dateStr: toIsoDateStr(dt), dayName: DAY_NAMES_SHORT[idx] };
    });
  }, [cursorDate]);

  // Eventos que caen en una fecha dada
  const getEventsForDay = useCallback(
    (dayStr) => {
      return unifiedEvents.filter(ev => isDateBetween(dayStr, ev.startDate, ev.dueDate));
    },
    [unifiedEvents]
  );

  // Horas programadas para una fecha dada
  const getDayScheduledHours = useCallback(
    (dayStr) => {
      const evs = getEventsForDay(dayStr);
      return evs.reduce((sum, ev) => {
        // Si el evento dura varios días, prorratear o tomar la dedicación diaria asignada
        return sum + (Number(ev.estimatedHours) || 1.0);
      }, 0);
    },
    [getEventsForDay]
  );

  // ── 9. DRAG & DROP PARA REPROGRAMACIÓN FLUIDA EN EL CALENDARIO ──
  const [draggedEventUid, setDraggedEventUid] = useState(null);
  const [dragOverDateStr, setDragOverDateStr] = useState(null);

  const handleDragStartEvent = (e, evUid) => {
    setDraggedEventUid(evUid);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropOnDay = (e, targetDateStr) => {
    e.preventDefault();
    setDragOverDateStr(null);
    if (!draggedEventUid) return;

    const targetEv = unifiedEvents.find(item => item.uid === draggedEventUid);
    setDraggedEventUid(null);
    if (!targetEv) return;

    // Calcular duración original en días para mantener el intervalo inicio -> fin
    const startParts = targetEv.startDate.split('-').map(Number);
    const endParts = targetEv.dueDate.split('-').map(Number);
    const startDt = new Date(startParts[0], startParts[1] - 1, startParts[2]);
    const endDt = new Date(endParts[0], endParts[1] - 1, endParts[2]);
    const diffDays = Math.max(0, Math.round((endDt - startDt) / 86400000));

    const newEndDate = addDays(targetDateStr, diffDays);

    const nextOverrides = {
      ...calendarOverrides,
      [targetEv.uid]: {
        ...(calendarOverrides[targetEv.uid] || {}),
        ...targetEv,
        startDate: targetDateStr,
        dueDate: newEndDate
      }
    };
    saveCalendarOverrides(nextOverrides);

    const newDayHours = getDayScheduledHours(targetDateStr) + (Number(targetEv.estimatedHours) || 1.5);
    triggerToast?.(
      `Reprogramada al ${targetDateStr} (Carga del día: ${newDayHours.toFixed(1)}h / ${dailyCapHours}h)`,
      'success'
    );

    if (syncConfig.autoSyncOnReschedule) {
      dispatchBackgroundCalendarSync('task.rescheduled', {
        ...targetEv,
        startDate: targetDateStr,
        dueDate: newEndDate
      });
    }
  };

  // ── 10. MODAL DE CREACIÓN / ASIGNACIÓN DE CLIENTE O TAREA EN EL CALENDARIO ──
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    clientName: '',
    leadId: '',
    responsible: currentSocio?.name || 'Ing. Diego Barrientos',
    isGroupBothPartners: false,
    startDate: toIsoDateStr(new Date()),
    dueDate: toIsoDateStr(new Date()),
    startTime: '08:30',
    endTime: '10:00',
    estimatedHours: 1.5,
    tags: ['Seguimiento Telefónico BANT'],
    description: ''
  });

  const handleOpenScheduleForDate = (dateStr, defaultTime = '08:30') => {
    setScheduleForm({
      title: '',
      clientName: '',
      leadId: '',
      responsible: currentSocio?.name || 'Ing. Diego Barrientos',
      isGroupBothPartners: false,
      startDate: dateStr,
      dueDate: dateStr,
      startTime: defaultTime,
      endTime: '10:00',
      estimatedHours: 1.5,
      tags: ['Seguimiento Telefónico BANT'],
      description: ''
    });
    setShowScheduleModal(true);
  };

  const handleCreateCalendarTaskSubmit = async (e) => {
    e.preventDefault();
    if (!scheduleForm.title.trim()) {
      triggerToast?.('Ingresa el título de la actividad o seguimiento', 'error');
      return;
    }

    const participants = scheduleForm.isGroupBothPartners
      ? ['Ing. Diego Barrientos', 'Ing. Fernando Araujo']
      : [scheduleForm.responsible];

    const newUid = `cal-direct-${Date.now()}`;
    const eventPayload = {
      uid: newUid,
      title: scheduleForm.title.trim(),
      clientName: scheduleForm.clientName.trim(),
      leadId: scheduleForm.leadId || null,
      responsible: scheduleForm.responsible,
      participants,
      startDate: scheduleForm.startDate,
      dueDate: scheduleForm.dueDate >= scheduleForm.startDate ? scheduleForm.dueDate : scheduleForm.startDate,
      startTime: scheduleForm.startTime,
      endTime: scheduleForm.endTime,
      estimatedHours: Number(scheduleForm.estimatedHours) || 1.5,
      actualHours: 0,
      status: 'Pendiente',
      tags: scheduleForm.tags,
      description: scheduleForm.description.trim()
    };

    // Guardar en estado del calendario
    const nextOverrides = {
      ...calendarOverrides,
      [newUid]: eventPayload
    };
    saveCalendarOverrides(nextOverrides);

    // Sincronizar con la tabla global de actividades de SERAM
    if (handleAddActivity) {
      await handleAddActivity({
        title: eventPayload.title,
        description: `${eventPayload.description}${eventPayload.clientName ? ` | Cliente: ${eventPayload.clientName}` : ''}`,
        responsible: eventPayload.responsible,
        assignedPartner: eventPayload.responsible,
        assignedTeam: participants,
        participants,
        status: 'Pendiente',
        priority: 'Alta',
        startDate: eventPayload.startDate,
        dueDate: eventPayload.dueDate,
        estimatedHours: eventPayload.estimatedHours,
        freeTags: eventPayload.tags
      });
    }

    // Si se vinculó un cliente del CRM, crear también la misión en el CRM
    if (scheduleForm.leadId) {
      armService.scheduleLeadActivity(scheduleForm.leadId, {
        titulo: eventPayload.title,
        resumen: eventPayload.description || `Bloque programado (${eventPayload.estimatedHours} hrs)`,
        categoria_mision: scheduleForm.isGroupBothPartners ? 'grupal' : 'flash',
        responsable: eventPayload.responsible,
        participantes: participants,
        fecha_vencimiento: eventPayload.dueDate,
        xp_otorgado: 75
      });
      refreshCrmItems();
    }

    // Despachar en segundo plano a Google Calendar (Google Apps Script / n8n)
    if (syncConfig.autoSyncOnCreate) {
      dispatchBackgroundCalendarSync('task.created', eventPayload);
    }

    setShowScheduleModal(false);
    triggerToast?.(
      `Actividad programada (${eventPayload.estimatedHours}h) y enviada en segundo plano al calendario de los socios`,
      'success'
    );
  };

  // ── 11. MODAL DE ENTREGA / CONCRETAR TAREA DEL DÍA (IMPACTO TIME TRACKER + CRM CHATTER + XP) ──
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deliveryForm, setDeliveryForm] = useState({
    actualHours: 1.5,
    outcomeNote: '',
    evidenceUrl: ''
  });

  const handleSelectEvent = (ev) => {
    setSelectedEvent(ev);
    setDeliveryForm({
      actualHours: ev.actualHours > 0 ? ev.actualHours : ev.estimatedHours || 1.5,
      outcomeNote: ev.deliverableNote || '',
      evidenceUrl: ''
    });
  };

  const handleDeliverAndConcreteTask = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;
    if (!deliveryForm.outcomeNote.trim()) {
      triggerToast?.('Registra el resultado alcanzado o acuerdo con el cliente para concretar la entrega', 'error');
      return;
    }

    const hoursLogged = Number(deliveryForm.actualHours) || 1.0;

    // 1. Actualizar estado en el Calendario
    const updatedEv = {
      ...selectedEvent,
      status: 'Concluido',
      actualHours: hoursLogged,
      deliverableNote: deliveryForm.outcomeNote.trim()
    };

    const nextOverrides = {
      ...calendarOverrides,
      [selectedEvent.uid]: updatedEv
    };
    saveCalendarOverrides(nextOverrides);

    // 2. Impactar el Time Tracker de los Socios (Bolsa de Compensación Operativa)
    if (handleAddTimeLog) {
      await handleAddTimeLog({
        partner_name: selectedEvent.responsible || currentSocio?.name || 'Ing. Diego Barrientos',
        partner_id:
          selectedEvent.responsible?.includes('Fernando')
            ? 'fernandoaraujo1912@gmail.com'
            : 'barrientoso2401@gmail.com',
        project_title: selectedEvent.clientName || selectedEvent.title,
        description: `[Calendario Odoo] ${selectedEvent.title} — Resultado: ${deliveryForm.outcomeNote.trim()}`,
        hours: hoursLogged,
        logged_at: new Date().toISOString()
      });
    }

    // 3. Si proviene de Actividades Globales, actualizar su estado a Concluido
    if (selectedEvent.source === 'activities' && handleUpdateActivityStatus) {
      await handleUpdateActivityStatus(selectedEvent.rawId, 'Concluido');
    }

    // 4. Si está vinculada a un cliente del CRM, registrar en el Chatter y acreditar XP
    if (selectedEvent.source === 'crm') {
      await armService.completeLeadActivityWithEvidence(selectedEvent.rawId, {
        evidencia_nota: `${deliveryForm.outcomeNote.trim()} (${hoursLogged} hrs dedicadas)`,
        evidencia_url: deliveryForm.evidenceUrl.trim(),
        autor: selectedEvent.responsible || currentSocio?.name
      });
      refreshCrmItems();
    } else if (selectedEvent.leadId) {
      armService.addChatterMessage(selectedEvent.leadId, {
        tipo: 'mision_completada',
        autor: selectedEvent.responsible || currentSocio?.name || 'Socio SERAM',
        contenido: `Tarea concretada desde Calendario (${hoursLogged} hrs): "${selectedEvent.title}". Resultado: ${deliveryForm.outcomeNote.trim()}`,
        xp_ganado: 75
      });
    }

    // 5. Notificar cierre en segundo plano
    if (syncConfig.autoSyncOnComplete) {
      dispatchBackgroundCalendarSync('task.completed', updatedEv);
    }

    setSelectedEvent(null);
    triggerToast?.(
      `Tarea concretada: +${hoursLogged}h acreditadas en el Time Tracker y sincronizadas con el CRM (+75 XP)`,
      'success'
    );
  };

  // ── 12. GENERADORES GOOGLE CALENDAR URL DIRECTA Y ARCHIVO .ICS (RFC 5545) ──
  const buildGoogleCalendarTemplateUrl = (ev) => {
    const cleanDate = (dStr, tStr) => {
      const d = (dStr || toIsoDateStr(new Date())).replace(/-/g, '');
      const t = (tStr || '08:30').replace(/:/g, '') + '00';
      return `${d}T${t}`;
    };
    const start = cleanDate(ev.startDate, ev.startTime || '08:30');
    const end = cleanDate(ev.dueDate || ev.startDate, ev.endTime || '10:00');
    const details = [
      `Responsable: ${ev.responsible}`,
      ev.clientName ? `Cliente: ${ev.clientName}` : '',
      `Dedicación Estimada: ${ev.estimatedHours} hrs (Meta Teletrabajo SERAM: ${dailyCapHours} hrs/día)`,
      ev.tags?.length ? `Etiquetas: ${ev.tags.join(', ')}` : '',
      ev.description ? `Detalle: ${ev.description}` : ''
    ]
      .filter(Boolean)
      .join('\n');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: `[SERAM] ${ev.title}`,
      dates: `${start}/${end}`,
      details,
      location: 'Teletrabajo SERAM SRL',
      add: `${syncConfig.socioAEmail},${syncConfig.socioBEmail}`
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const handleDownloadIcsFile = (ev) => {
    const cleanDate = (dStr, tStr) => {
      const d = (dStr || toIsoDateStr(new Date())).replace(/-/g, '');
      const t = (tStr || '08:30').replace(/:/g, '') + '00';
      return `${d}T${t}`;
    };
    const dtStart = cleanDate(ev.startDate, ev.startTime || '08:30');
    const dtEnd = cleanDate(ev.dueDate || ev.startDate, ev.endTime || '10:00');
    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//SERAM SRL//Odoo Calendar Engine//ES',
      'BEGIN:VEVENT',
      `UID:${ev.uid}@seram.com.bo`,
      `DTSTAMP:${cleanDate(toIsoDateStr(new Date()), '08:00')}Z`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:[SERAM] ${ev.title}`,
      `DESCRIPTION:Responsable: ${ev.responsible}\\nCliente: ${ev.clientName || 'N/A'}\\nHoras: ${ev.estimatedHours}h`,
      `ATTENDEE;CN=Ing. Diego Barrientos;RSVP=TRUE:mailto:${syncConfig.socioAEmail}`,
      `ATTENDEE;CN=Ing. Fernando Araujo;RSVP=TRUE:mailto:${syncConfig.socioBEmail}`,
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Recordatorio SERAM',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsLines], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SERAM_${ev.title.replace(/\s+/g, '_').slice(0, 30)}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerToast?.('Archivo de calendario (.ics) descargado con alertas para ambos socios', 'success');
  };

  // ── 13. GESTIÓN DE ETIQUETAS LIBRES DE LOS SOCIOS ──
  const handleAddFreeTag = (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    const exists = freeTags.some(t => t.name.toLowerCase() === newTagName.trim().toLowerCase());
    if (exists) {
      triggerToast?.('Esa etiqueta ya existe', 'error');
      return;
    }
    const created = {
      id: `tag-${Date.now()}`,
      name: newTagName.trim(),
      colorId: newTagColor
    };
    const next = [...freeTags, created];
    setFreeTags(next);
    try {
      localStorage.setItem(STORAGE_KEYS.FREE_TAGS, JSON.stringify(next));
    } catch {
      // Ignorar
    }
    setNewTagName('');
    triggerToast?.(`Etiqueta libre "${created.name}" creada`, 'success');
  };

  const handleDeleteFreeTag = (tagId) => {
    const next = freeTags.filter(t => t.id !== tagId);
    setFreeTags(next);
    try {
      localStorage.setItem(STORAGE_KEYS.FREE_TAGS, JSON.stringify(next));
    } catch {
      // Ignorar
    }
  };

  const getTagBadgeClass = (tagName) => {
    const found = freeTags.find(t => t.name === tagName);
    const palette = FREE_TAG_COLOR_PALETTE.find(p => p.id === (found?.colorId || 'emerald')) || FREE_TAG_COLOR_PALETTE[0];
    return palette.className;
  };

  // ── 14. RESUMEN DE CAPACIDAD HORARIA DE HOY ──
  const todayStr = toIsoDateStr(new Date());
  const todayScheduledHours = getDayScheduledHours(todayStr);
  const todayCompletedHours = getEventsForDay(todayStr)
    .filter(ev => ev.status === 'Concluido')
    .reduce((acc, ev) => acc + (Number(ev.actualHours || ev.estimatedHours) || 0), 0);

  return (
    <div className="space-y-4 text-slate-100 select-none">
      {/* ══════════════════════════════════════════════════════════════════════════
          1. BARRA SUPERIOR CONTEXTUAL ESTILO ODOO CALENDAR
         ══════════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl bg-[#071109] border border-white/[0.1] px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        {/* Izquierda: Sub-secciones Odoo Calendar */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <div className="flex items-center gap-2 pr-3 border-r border-white/10">
            <div className="w-7 h-7 rounded-lg bg-[#00e03c]/15 border border-[#00e03c]/40 flex items-center justify-center text-[#00e03c]">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <span className="text-sm font-black tracking-tight text-white">Calendario Odoo</span>
          </div>

          {[
            { id: 'calendar', label: 'Calendario & Teletrabajo' },
            { id: 'sales_plan', label: 'Plan de Ventas & Inbound' },
            { id: 'tags', label: `Etiquetas Libres (${freeTags.length})` },
            { id: 'automation', label: 'Google Calendar / Apps Script / n8n' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSection(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeSection === tab.id
                  ? 'bg-[#00e03c] text-slate-950 font-black shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Derecha: Conmutador de Meta Diaria de Teletrabajo (4.5h Fase Temprana <-> 8.0h Escalada) */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/[0.1]">
            <span className="text-[10px] font-mono text-slate-400 px-2">Jornada Socio:</span>
            <button
              type="button"
              onClick={() => handleToggleDailyCap(4.5)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                dailyCapHours === 4.5
                  ? 'bg-[#00e03c] text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Fase Temprana Acordada: 4.5 horas diarias dedicadas por socio"
            >
              4.5 hrs/día (Temprana)
            </button>
            <button
              type="button"
              onClick={() => handleToggleDailyCap(8.0)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                dailyCapHours === 8.0
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Fase Escalada: 8.0 horas diarias para ventas masivas y content marketing"
            >
              8.0 hrs/día (Intensiva)
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleOpenScheduleForDate(toIsoDateStr(cursorDate))}
            className="px-3.5 py-1.5 rounded-xl bg-[#00e03c] hover:bg-white text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Programar Cliente / Actividad</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          2. MEDIDOR DE CAPACIDAD DE TELETRABAJO DEL DÍA Y CONTROLES DE ESCALA
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'calendar' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 bg-[#0a140c] border border-white/[0.08] p-3.5 rounded-2xl items-center">
            {/* Navegación de Fechas Odoo */}
            <div className="lg:col-span-5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCursorDate(new Date())}
                className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-bold text-white cursor-pointer"
              >
                Hoy
              </button>
              <div className="flex items-center bg-black/40 rounded-xl border border-white/10 p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    const dt = new Date(cursorDate);
                    if (scaleMode === 'month') dt.setMonth(dt.getMonth() - 1);
                    else if (scaleMode === 'week') dt.setDate(dt.getDate() - 7);
                    else dt.setDate(dt.getDate() - 1);
                    setCursorDate(dt);
                  }}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const dt = new Date(cursorDate);
                    if (scaleMode === 'month') dt.setMonth(dt.getMonth() + 1);
                    else if (scaleMode === 'week') dt.setDate(dt.getDate() + 7);
                    else dt.setDate(dt.getDate() + 1);
                    setCursorDate(dt);
                  }}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-sm sm:text-base font-black text-white">
                {MONTH_NAMES[cursorDate.getMonth()]} {cursorDate.getFullYear()}
              </h3>
            </div>

            {/* Medidor de Dedicación Diaria (Hoy: X.Xh / 4.5h) */}
            <div className="lg:col-span-4 flex flex-col gap-1 bg-black/40 px-3.5 py-2 rounded-xl border border-white/[0.07]">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-300">
                  Carga Hoy ({todayStr}): <strong className="text-white font-mono">{todayScheduledHours.toFixed(1)}h</strong> / {dailyCapHours}h
                </span>
                <span className="font-mono text-[#00e03c] font-bold">
                  Concretadas: {todayCompletedHours.toFixed(1)}h
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden flex">
                <div
                  className="bg-[#00e03c] h-full transition-all"
                  style={{ width: `${Math.min(100, (todayCompletedHours / dailyCapHours) * 100)}%` }}
                  title="Horas ya concretadas hoy"
                />
                <div
                  className={`${
                    todayScheduledHours > dailyCapHours ? 'bg-rose-500' : 'bg-amber-400'
                  } h-full transition-all`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(0, ((todayScheduledHours - todayCompletedHours) / dailyCapHours) * 100)
                    )}%`
                  }}
                  title="Horas programadas pendientes hoy"
                />
              </div>
            </div>

            {/* Selector de Escala (Mes / Semana / Día / Agenda) */}
            <div className="lg:col-span-3 flex items-center justify-end gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.08]">
              {[
                { id: 'month', label: 'Mes' },
                { id: 'week', label: 'Semana' },
                { id: 'day', label: 'Día' },
                { id: 'agenda', label: 'Agenda' }
              ].map(sc => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setScaleMode(sc.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    scaleMode === sc.id
                      ? 'bg-[#00e03c] text-slate-950 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Barra de Filtros: Socio A / Socio B, Etiquetas Libres y Buscador */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-black/30 px-3.5 py-2.5 rounded-xl border border-white/[0.06]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 mr-1">Socio:</span>
              {[
                { id: 'all', label: 'Ambos Socios' },
                { id: 'Ing. Diego Barrientos', label: 'Socio A: Diego Barrientos' },
                { id: 'Ing. Fernando Araujo', label: 'Socio B: Fernando Araujo' }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPartnerFilter(p.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    partnerFilter === p.id
                      ? 'bg-[#00e03c]/20 text-[#00e03c] border border-[#00e03c]/40'
                      : 'bg-white/[0.04] text-slate-400 hover:text-white'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={tagFilter}
                onChange={e => setTagFilter(e.target.value)}
                className="bg-black/60 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-[#00e03c]"
              >
                <option value="all">Todas las Etiquetas Libres</option>
                {freeTags.map(t => (
                  <option key={t.id} value={t.name}>
                    Etiqueta: {t.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1.5 bg-black/60 border border-white/15 rounded-xl px-3 py-1">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filtrar cliente o tarea..."
                  className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-36 sm:w-48"
                />
              </div>
            </div>
          </div>

          {/* ── VISTA 1: CUADRÍCULA MENSUAL ODOO CON BARRA DE CAPACIDAD 4.5H / 8.0H ── */}
          {scaleMode === 'month' && (
            <div className="rounded-2xl bg-[#08110a] border border-white/[0.1] overflow-hidden shadow-2xl">
              {/* Cabecera de días de la semana */}
              <div className="grid grid-cols-7 border-b border-white/[0.08] bg-white/[0.03]">
                {DAY_NAMES_SHORT.map(dName => (
                  <div key={dName} className="py-2.5 text-center text-[11px] font-black uppercase tracking-wider text-slate-400">
                    {dName}
                  </div>
                ))}
              </div>

              {/* Celdas del mes */}
              <div className="grid grid-cols-7 divide-x divide-y divide-white/[0.06]">
                {monthDaysGrid.map(cell => {
                  const dayEvents = getEventsForDay(cell.dateStr);
                  const dayHours = getDayScheduledHours(cell.dateStr);
                  const isToday = cell.dateStr === todayStr;
                  const isOverCap = dayHours > dailyCapHours;
                  const isDragTarget = dragOverDateStr === cell.dateStr;

                  return (
                    <div
                      key={cell.dateStr}
                      onDragOver={e => {
                        e.preventDefault();
                        if (dragOverDateStr !== cell.dateStr) setDragOverDateStr(cell.dateStr);
                      }}
                      onDrop={e => handleDropOnDay(e, cell.dateStr)}
                      onClick={() => handleOpenScheduleForDate(cell.dateStr)}
                      className={`min-h-[125px] sm:min-h-[142px] p-2 flex flex-col justify-between transition-colors cursor-pointer ${
                        !cell.isCurrentMonth ? 'bg-black/50 opacity-45' : 'bg-transparent hover:bg-white/[0.02]'
                      } ${isDragTarget ? 'ring-2 ring-[#00e03c] bg-[#00e03c]/10' : ''}`}
                    >
                      {/* Cabecera del día + Indicador de Horas (X.Xh / 4.5h) */}
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                              isToday
                                ? 'bg-[#00e03c] text-slate-950 shadow-sm'
                                : 'text-slate-300'
                            }`}
                          >
                            {cell.dateObj.getDate()}
                          </span>

                          {dayHours > 0 && (
                            <span
                              className={`text-[9.5px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                isOverCap
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              }`}
                              title={`Horas asignadas en el día: ${dayHours.toFixed(1)}h de ${dailyCapHours}h`}
                            >
                              {dayHours.toFixed(1)}h/{dailyCapHours}h
                            </span>
                          )}
                        </div>

                        {/* Lista de Eventos del Día */}
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map(ev => {
                            const isCompleted = ev.status === 'Concluido';
                            const firstTag = ev.tags?.[0];
                            const badgeCls = firstTag
                              ? getTagBadgeClass(firstTag)
                              : 'bg-[#00e03c]/15 text-[#00e03c] border-[#00e03c]/35';

                            return (
                              <div
                                key={`${cell.dateStr}-${ev.uid}`}
                                draggable
                                onDragStart={e => {
                                  e.stopPropagation();
                                  handleDragStartEvent(e, ev.uid);
                                }}
                                onClick={e => {
                                  e.stopPropagation();
                                  handleSelectEvent(ev);
                                }}
                                className={`px-2 py-1 rounded-lg border text-[10px] leading-tight transition-all hover:scale-[1.01] ${
                                  isCompleted
                                    ? 'bg-white/[0.03] border-white/10 text-slate-400 line-through'
                                    : badgeCls
                                }`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className="font-bold truncate">{ev.title}</span>
                                  <span className="font-mono text-[9px] shrink-0 opacity-85">{ev.estimatedHours}h</span>
                                </div>
                                {ev.clientName && (
                                  <span className="block text-[9px] opacity-80 truncate">{ev.clientName}</span>
                                )}
                              </div>
                            );
                          })}

                          {dayEvents.length > 3 && (
                            <div
                              onClick={e => {
                                e.stopPropagation();
                                setCursorDate(cell.dateObj);
                                setScaleMode('day');
                              }}
                              className="text-[10px] font-bold text-[#00e03c] hover:underline pl-1"
                            >
                              + {dayEvents.length - 3} más...
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Mini Barra de Capacidad Diaria (4.5h / 8.0h) */}
                      {dayHours > 0 && (
                        <div className="w-full h-1 rounded-full bg-white/[0.07] overflow-hidden mt-1.5">
                          <div
                            className={`h-full transition-all ${
                              isOverCap ? 'bg-rose-500' : 'bg-[#00e03c]'
                            }`}
                            style={{ width: `${Math.min(100, (dayHours / dailyCapHours) * 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── VISTA 2: SEMANAL ODOO CON COLUMNAS DE CARGA HORARIA ── */}
          {scaleMode === 'week' && (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2.5">
              {weekDaysGrid.map(col => {
                const dayEvents = getEventsForDay(col.dateStr);
                const dayHours = getDayScheduledHours(col.dateStr);
                const isOverCap = dayHours > dailyCapHours;
                const isToday = col.dateStr === todayStr;

                return (
                  <div
                    key={col.dateStr}
                    onDragOver={e => {
                      e.preventDefault();
                      setDragOverDateStr(col.dateStr);
                    }}
                    onDrop={e => handleDropOnDay(e, col.dateStr)}
                    className={`rounded-2xl bg-[#09130b] border p-3 flex flex-col justify-between min-h-[380px] ${
                      isToday ? 'border-[#00e03c]/60' : 'border-white/[0.08]'
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-slate-400 block">{col.dayName}</span>
                          <span className="text-sm font-black text-white">{col.dateStr.slice(5)}</span>
                        </div>
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                            isOverCap
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-[#00e03c]/15 text-[#00e03c] border-[#00e03c]/30'
                          }`}
                        >
                          {dayHours.toFixed(1)}h / {dailyCapHours}h
                        </span>
                      </div>

                      <div className="space-y-2">
                        {dayEvents.map(ev => (
                          <div
                            key={ev.uid}
                            draggable
                            onDragStart={e => handleDragStartEvent(e, ev.uid)}
                            onClick={() => handleSelectEvent(ev)}
                            className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 space-y-1 cursor-pointer transition-all"
                          >
                            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                              <span>{ev.startTime} - {ev.endTime}</span>
                              <span className="text-[#00e03c] font-bold">{ev.estimatedHours}h</span>
                            </div>
                            <p className="text-xs font-black text-white leading-snug">{ev.title}</p>
                            {ev.clientName && (
                              <p className="text-[10.5px] text-cyan-300 font-bold truncate">{ev.clientName}</p>
                            )}
                            <div className="flex flex-wrap gap-1 pt-1">
                              {(ev.tags || []).map(t => (
                                <span key={t} className={`text-[8.5px] px-1.5 py-0.2 rounded border font-bold ${getTagBadgeClass(t)}`}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenScheduleForDate(col.dateStr)}
                      className="mt-3 w-full py-1.5 rounded-xl bg-white/[0.04] hover:bg-[#00e03c]/20 text-slate-300 hover:text-[#00e03c] text-[11px] font-bold border border-white/[0.06] cursor-pointer"
                    >
                      + Asignar en este día
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── VISTA 3: DIARIA CON FRANJAS HORARIAS DE TELETRABAJO ── */}
          {scaleMode === 'day' && (() => {
            const currentDayStr = toIsoDateStr(cursorDate);
            const dayEvents = getEventsForDay(currentDayStr);
            const dayHours = getDayScheduledHours(currentDayStr);

            return (
              <div className="rounded-2xl bg-[#09130b] border border-white/[0.1] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
                  <div>
                    <h4 className="text-base font-black text-white">
                      Planificación Diaria: {currentDayStr}
                    </h4>
                    <p className="text-xs text-slate-400">
                      Dedicación acumulada: {dayHours.toFixed(1)} hrs de {dailyCapHours} hrs pactadas por socio
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenScheduleForDate(currentDayStr)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#00e03c] text-slate-950 font-black text-xs cursor-pointer"
                  >
                    + Agregar Bloque Horario
                  </button>
                </div>

                {dayEvents.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    No hay actividades programadas en esta fecha. Haz clic en + Agregar Bloque Horario para asignar un cliente o tarea.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {dayEvents.map(ev => (
                      <div
                        key={ev.uid}
                        onClick={() => handleSelectEvent(ev)}
                        className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black text-[#00e03c] bg-[#00e03c]/15 px-2.5 py-0.5 rounded-lg border border-[#00e03c]/30">
                              {ev.startTime} - {ev.endTime} ({ev.estimatedHours} hrs)
                            </span>
                            <span className="text-xs font-bold text-slate-300">{ev.responsible}</span>
                            {ev.status === 'Concluido' && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black">
                                Concretada
                              </span>
                            )}
                          </div>
                          <h5 className="text-sm font-black text-white">{ev.title}</h5>
                          {ev.clientName && (
                            <p className="text-xs text-cyan-300 font-bold">Cliente: {ev.clientName}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              handleSelectEvent(ev);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#00e03c] text-slate-950 font-black text-xs hover:bg-white transition-colors cursor-pointer"
                          >
                            {ev.status === 'Concluido' ? 'Ver Entrega' : 'Concretar / Entregar'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── VISTA 4: AGENDA LINEAL DE COMPROMISOS CON FECHA INICIO -> FIN ── */}
          {scaleMode === 'agenda' && (
            <div className="rounded-2xl bg-[#09130b] border border-white/[0.1] overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.04] border-b border-white/[0.08] text-slate-400 font-tech uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Inicio ➔ Fin</th>
                    <th className="py-3 px-4">Horario / Carga</th>
                    <th className="py-3 px-4">Actividad / Seguimiento</th>
                    <th className="py-3 px-4">Cliente Vinculado</th>
                    <th className="py-3 px-4">Socio Responsable</th>
                    <th className="py-3 px-4">Etiquetas Libres</th>
                    <th className="py-3 px-4 text-right">Acción Rápida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {unifiedEvents.map(ev => (
                    <tr
                      key={ev.uid}
                      onClick={() => handleSelectEvent(ev)}
                      className="hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono text-slate-300 whitespace-nowrap">
                        {ev.startDate} ➔ {ev.dueDate}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#00e03c] font-bold">
                        {ev.startTime} ({ev.estimatedHours}h)
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{ev.title}</td>
                      <td className="py-3 px-4 text-cyan-300 font-bold">{ev.clientName || 'Interno SERAM'}</td>
                      <td className="py-3 px-4 text-slate-300">{ev.responsible}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(ev.tags || []).map(t => (
                            <span key={t} className={`text-[9px] px-2 py-0.5 rounded-full border font-bold ${getTagBadgeClass(t)}`}>
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right" onClick={e => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => handleSelectEvent(ev)}
                          className={`px-3 py-1 rounded-lg font-black text-[10.5px] cursor-pointer ${
                            ev.status === 'Concluido'
                              ? 'bg-white/10 text-slate-300'
                              : 'bg-[#00e03c] text-slate-950 hover:bg-white'
                          }`}
                        >
                          {ev.status === 'Concluido' ? 'Concluida' : 'Concretar Tarea'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          3. SECCIÓN: PLAN DE VENTAS TELEFÓNICAS & CONTENT MARKETING INBOUND (VERTICAL / LEAD MAGNETS)
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'sales_plan' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Bloque 1: Seguimiento y Ventas por Teléfono (BANT)',
              recommendedHours: dailyCapHours === 4.5 ? '2.0 hrs/día' : '3.5 hrs/día',
              tag: 'Seguimiento Telefónico BANT',
              items: [
                'Llamadas de precalificación a leads tibios/calientes del asistente web SERAM',
                'Contacto de cadencia de 14 días (hasta 7 toques de valor sin spam)',
                'Cierre telefónico directo de diagnósticos ambientales, RAI y EEIA'
              ]
            },
            {
              title: 'Bloque 2: Content Marketing Vertical & Lead Magnets (Inbound)',
              recommendedHours: dailyCapHours === 4.5 ? '1.0 hr/día' : '2.0 hrs/día',
              tag: 'Content Marketing Vertical / Reels',
              items: [
                'Producción de videos cortos en formato vertical (9:16) sobre normativas ambientales y casos reales',
                'Diseño y distribución de Lead Magnets técnicos (Checklist RAI, Guía de Límites de Mercurio)',
                'Captura de curiosos en redes para nutrirlos en el embudo de 14 días'
              ]
            },
            {
              title: 'Bloque 3: Ejecución Técnica y Entregables de Clientes',
              recommendedHours: dailyCapHours === 4.5 ? '1.5 hrs/día' : '2.5 hrs/día',
              tag: 'Gabinete SIG & Modelación',
              items: [
                'Avance de estudios técnicos comprometidos en el calendario',
                'Modelación cartográfica SIG y revisión de expedientes municipales',
                'Registro de evidencias verificables para acreditación de horas y XP'
              ]
            }
          ].map((block, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-[#09130b] border border-white/[0.1] flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#00e03c] bg-[#00e03c]/15 px-2.5 py-0.5 rounded-full border border-[#00e03c]/30 font-bold">
                    Sugerido: {block.recommendedHours}
                  </span>
                </div>
                <h3 className="text-sm font-black text-white">{block.title}</h3>
                <ul className="space-y-2 text-xs text-slate-300">
                  {block.items.map((it, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#00e03c] shrink-0 mt-0.5" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setScheduleForm({
                    title: block.title.replace(/^Bloque \d: /, ''),
                    clientName: '',
                    leadId: '',
                    responsible: currentSocio?.name || 'Ing. Diego Barrientos',
                    isGroupBothPartners: false,
                    startDate: todayStr,
                    dueDate: todayStr,
                    startTime: idx === 0 ? '08:30' : idx === 1 ? '10:30' : '11:30',
                    endTime: idx === 0 ? '10:30' : idx === 1 ? '11:30' : '13:00',
                    estimatedHours: dailyCapHours === 4.5 ? (idx === 0 ? 2.0 : idx === 1 ? 1.0 : 1.5) : 2.5,
                    tags: [block.tag],
                    description: block.items.join(' | ')
                  });
                  setShowScheduleModal(true);
                }}
                className="w-full py-2 rounded-xl bg-[#00e03c] text-slate-950 font-black text-xs hover:bg-white transition-colors cursor-pointer"
              >
                + Agendar Bloque Hoy en el Calendario
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          4. SECCIÓN: GESTOR DE ETIQUETAS LIBRES DE LOS SOCIOS
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'tags' && (
        <div className="p-5 rounded-2xl bg-[#09130b] border border-white/[0.1] space-y-5">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              Etiquetas Libres Creadas por los Socios
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Crea cualquier etiqueta personalizada para clasificar tus bloques de teletrabajo, campañas de llamadas, formatos verticales o entregables.
            </p>
          </div>

          <form onSubmit={handleAddFreeTag} className="flex flex-wrap items-center gap-2.5">
            <input
              type="text"
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              placeholder="Nueva etiqueta libre (ej. Lead Magnet Mercurio, Llamadas Minería)..."
              className="flex-1 min-w-[240px] bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-[#00e03c]"
            />
            <select
              value={newTagColor}
              onChange={e => setNewTagColor(e.target.value)}
              className="bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white outline-none"
            >
              {FREE_TAG_COLOR_PALETTE.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#00e03c] text-slate-950 font-black text-xs hover:bg-white transition-colors cursor-pointer"
            >
              + Crear Etiqueta Libre
            </button>
          </form>

          <div className="flex flex-wrap gap-2.5 pt-2">
            {freeTags.map(tag => (
              <div
                key={tag.id}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${getTagBadgeClass(tag.name)}`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>{tag.name}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteFreeTag(tag.id)}
                  className="opacity-70 hover:opacity-100 cursor-pointer"
                  title="Eliminar etiqueta"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          5. SECCIÓN: AUTOMATIZACIÓN EN SEGUNDO PLANO (GOOGLE CALENDAR + GOOGLE APPS SCRIPT + N8N)
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'automation' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Panel Izquierdo: Configuración de Webhooks y Correos de Socios A y B */}
            <div className="p-5 rounded-2xl bg-[#09130b] border border-white/[0.1] space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#00e03c]" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Conexión en Segundo Plano a Google Calendar (Socio A y Socio B)
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#00e03c]/15 text-[#00e03c] border border-[#00e03c]/30 text-[10px] font-black">
                  Non-Blocking Sync
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Google Calendar Socio A (Diego)</label>
                  <input
                    type="email"
                    value={syncConfig.socioAEmail}
                    onChange={e => handleSaveSyncConfig({ ...syncConfig, socioAEmail: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-[#00e03c]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Google Calendar Socio B (Fernando)</label>
                  <input
                    type="email"
                    value={syncConfig.socioBEmail}
                    onChange={e => handleSaveSyncConfig({ ...syncConfig, socioBEmail: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-[#00e03c]"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Opción 1: URL de Web App de Google Apps Script (Cuenta Central SERAM)
                </label>
                <input
                  type="url"
                  value={syncConfig.appsScriptUrl}
                  onChange={e => handleSaveSyncConfig({ ...syncConfig, appsScriptUrl: e.target.value })}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-[#00e03c]"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Opción 2: URL de Webhook de n8n (Workflow Automatizado)
                </label>
                <input
                  type="url"
                  value={syncConfig.n8nWebhookUrl}
                  onChange={e => handleSaveSyncConfig({ ...syncConfig, n8nWebhookUrl: e.target.value })}
                  placeholder="https://n8n.tudominio.com/webhook/seram-calendar-sync"
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-[#00e03c]"
                />
              </div>

              <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    dispatchBackgroundCalendarSync('task.test_ping', {
                      title: 'Prueba de Alerta y Sincronización SERAM',
                      description: 'Verificación de enlace automático con los calendarios de Socio A y Socio B',
                      clientName: 'SERAM Directorio',
                      responsible: currentSocio?.name || 'Ing. Diego Barrientos',
                      startDate: todayStr,
                      dueDate: todayStr,
                      startTime: '09:00',
                      endTime: '10:00',
                      estimatedHours: 1.0,
                      tags: ['Reunión de Socios / Directorio']
                    });
                    triggerToast?.('Evento de prueba disparado en segundo plano', 'success');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#00e03c] text-slate-950 font-black hover:bg-white transition-colors cursor-pointer"
                >
                  Probar Despacho en Segundo Plano Ahora
                </button>
              </div>

              {/* Cola / Historial de Sincronización en Segundo Plano */}
              <div className="pt-3 border-t border-white/[0.08] space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Registro de Eventos Despachados en Segundo Plano ({syncLogs.length})
                </span>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {syncLogs.length === 0 ? (
                    <p className="text-[11px] text-slate-500">Sin eventos despachados aún en esta sesión.</p>
                  ) : (
                    syncLogs.map(log => (
                      <div key={log.id} className="p-2 rounded-lg bg-black/50 border border-white/[0.06] flex items-center justify-between gap-2 text-[10.5px]">
                        <div className="truncate">
                          <span className="font-mono text-[#00e03c] mr-2">[{log.time}]</span>
                          <strong className="text-white">{log.title}</strong>
                          <span className="text-slate-400 ml-2">({log.eventType})</span>
                        </div>
                        <span className="text-[9.5px] font-mono text-cyan-300 shrink-0">{log.status}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Panel Derecho: Código Google Apps Script y Plantilla JSON n8n */}
            <div className="p-5 rounded-2xl bg-[#09130b] border border-white/[0.1] space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Código Google Apps Script (Code.gs) & Workflow n8n
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(GOOGLE_APPS_SCRIPT_CODE);
                      triggerToast?.('Código Google Apps Script copiado al portapapeles', 'success');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-[#00e03c] text-white hover:text-slate-950 font-bold text-[10.5px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3 h-3" /> Copiar Apps Script
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(N8N_WORKFLOW_TEMPLATE);
                      triggerToast?.('JSON de Workflow n8n copiado al portapapeles', 'success');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-400 text-cyan-200 hover:text-slate-950 font-bold text-[10.5px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Copy className="w-3 h-3" /> Copiar JSON n8n
                  </button>
                </div>
              </div>

              <pre className="p-3 rounded-xl bg-black/70 border border-white/10 text-[10px] font-mono text-emerald-300 overflow-x-auto max-h-[290px] leading-relaxed select-all">
                {GOOGLE_APPS_SCRIPT_CODE}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          6. MODAL PARA PROGRAMAR CLIENTE / ACTIVIDAD EN EL CALENDARIO (PORTAL z-[9999])
         ══════════════════════════════════════════════════════════════════════════ */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {showScheduleModal && (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto"
                onClick={() => setShowScheduleModal(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  onClick={e => e.stopPropagation()}
                  className="w-full max-w-xl bg-[#0b150d] border border-[#00e03c]/40 rounded-3xl p-6 shadow-2xl space-y-4 text-xs text-slate-100"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-[#00e03c]" />
                      <h3 className="text-sm font-black text-white">
                        Programar Actividad / Asignar Cliente en el Calendario
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowScheduleModal(false)}
                      className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" /> Cerrar (X)
                    </button>
                  </div>

                  <form onSubmit={handleCreateCalendarTaskSubmit} className="space-y-3">
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Título de la Actividad / Compromiso *</label>
                      <input
                        type="text"
                        required
                        value={scheduleForm.title}
                        onChange={e => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                        placeholder="Ej. Llamada de Cierre BANT / Grabación 3 Reels Verticales / Entrega EEIA"
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2 text-white outline-none focus:border-[#00e03c]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 font-bold block mb-1">Vincular Cliente del CRM (Opcional)</label>
                        <select
                          value={scheduleForm.leadId}
                          onChange={e => {
                            const lId = e.target.value;
                            const found = crmLeads.find(l => String(l.id) === String(lId));
                            setScheduleForm({
                              ...scheduleForm,
                              leadId: lId,
                              clientName: found ? found.empresa || found.nombre : scheduleForm.clientName
                            });
                          }}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                        >
                          <option value="">-- Seleccionar del CRM o escribir abajo --</option>
                          {crmLeads.map(lead => (
                            <option key={lead.id} value={lead.id}>
                              {lead.empresa} ({lead.titulo_oportunidad})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-400 font-bold block mb-1">Nombre del Cliente / Organización</label>
                        <input
                          type="text"
                          value={scheduleForm.clientName}
                          onChange={e => setScheduleForm({ ...scheduleForm, clientName: e.target.value })}
                          placeholder="Ej. GAM Palos Blancos / Cooperativa..."
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e03c]"
                        />
                      </div>
                    </div>

                    {/* Rango de Fechas Inicio -> Fin y Horas */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div>
                        <label className="text-slate-400 font-bold block mb-1">Fecha Inicio *</label>
                        <input
                          type="date"
                          required
                          value={scheduleForm.startDate}
                          onChange={e => setScheduleForm({ ...scheduleForm, startDate: e.target.value })}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-2.5 py-2 text-white font-mono outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 font-bold block mb-1">Fecha Final *</label>
                        <input
                          type="date"
                          required
                          value={scheduleForm.dueDate}
                          onChange={e => setScheduleForm({ ...scheduleForm, dueDate: e.target.value })}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-2.5 py-2 text-white font-mono outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 font-bold block mb-1">Hora Inicio</label>
                        <input
                          type="time"
                          value={scheduleForm.startTime}
                          onChange={e => setScheduleForm({ ...scheduleForm, startTime: e.target.value })}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-2.5 py-2 text-white font-mono outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 font-bold block mb-1">Horas Dedicadas</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="12"
                          value={scheduleForm.estimatedHours}
                          onChange={e => setScheduleForm({ ...scheduleForm, estimatedHours: e.target.value })}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-2.5 py-2 text-[#00e03c] font-mono font-black outline-none"
                        />
                      </div>
                    </div>

                    {/* Asignación de Socio A / Socio B / Ambos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-slate-400 font-bold block mb-1">Socio Responsable</label>
                        <select
                          value={scheduleForm.responsible}
                          onChange={e => setScheduleForm({ ...scheduleForm, responsible: e.target.value })}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                        >
                          {PARTNERS_CONFIG.map(p => (
                            <option key={p.id} value={p.name}>{p.shortName}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-bold">
                          <input
                            type="checkbox"
                            checked={scheduleForm.isGroupBothPartners}
                            onChange={e => setScheduleForm({ ...scheduleForm, isGroupBothPartners: e.target.checked })}
                            className="accent-[#00e03c] w-4 h-4"
                          />
                          <span>Sincronizar en ambos calendarios (Socio A + Socio B)</span>
                        </label>
                      </div>
                    </div>

                    {/* Selector de Etiquetas Libres */}
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Etiquetas Libres</label>
                      <div className="flex flex-wrap gap-1.5">
                        {freeTags.map(t => {
                          const active = scheduleForm.tags.includes(t.name);
                          return (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                const nextTags = active
                                  ? scheduleForm.tags.filter(item => item !== t.name)
                                  : [...scheduleForm.tags, t.name];
                                setScheduleForm({ ...scheduleForm, tags: nextTags });
                              }}
                              className={`px-2.5 py-1 rounded-lg border text-[10.5px] font-bold transition-all cursor-pointer ${
                                active
                                  ? getTagBadgeClass(t.name)
                                  : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
                              }`}
                            >
                              {t.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Notas u Objetivo del Bloque</label>
                      <textarea
                        rows={2}
                        value={scheduleForm.description}
                        onChange={e => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                        placeholder="Objetivo específico a concretar en este bloque de teletrabajo..."
                        className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-white outline-none focus:border-[#00e03c]"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowScheduleModal(false)}
                        className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 font-bold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-[#00e03c] text-slate-950 font-black hover:bg-white transition-colors cursor-pointer"
                      >
                        Agendar y Notificar a Socios
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* ══════════════════════════════════════════════════════════════════════════
          7. MODAL DE FICHA DE EVENTO Y ENTREGA RÁPIDA EN EL DÍA (TIME TRACKER + CRM + XP)
         ══════════════════════════════════════════════════════════════════════════ */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {selectedEvent && (
              <div
                className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto"
                onClick={() => setSelectedEvent(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  onClick={e => e.stopPropagation()}
                  className="w-full max-w-xl bg-[#0a130b] border border-white/[0.15] rounded-3xl p-6 shadow-2xl space-y-4 text-xs text-slate-100"
                >
                  {/* Barra Superior con Botón Cerrar (X) Evidente */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#00e03c] block">
                        {selectedEvent.startDate} ➔ {selectedEvent.dueDate} ({selectedEvent.startTime} - {selectedEvent.endTime})
                      </span>
                      <h3 className="text-base font-black text-white mt-0.5">{selectedEvent.title}</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedEvent(null)}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-500/40 text-rose-200 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-4 h-4 stroke-[2.5]" />
                      <span>Cerrar (X)</span>
                    </button>
                  </div>

                  {/* Metadatos del Compromiso */}
                  <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Cliente / Organización:</span>
                      <span className="font-bold text-cyan-300">{selectedEvent.clientName || 'Gestión Interna SERAM'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Socio Responsable:</span>
                      <span className="font-bold text-white">{selectedEvent.responsible}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Dedicación Programada:</span>
                      <span className="font-mono font-bold text-[#00e03c]">
                        {selectedEvent.estimatedHours} hrs (Meta: {dailyCapHours} hrs/día)
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Estado Actual:</span>
                      <span className="font-bold text-amber-300">{selectedEvent.status}</span>
                    </div>
                  </div>

                  {/* Acciones Directas de Google Calendar e iCalendar (.ics) */}
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={buildGoogleCalendarTemplateUrl(selectedEvent)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-[#00e03c]/20 border border-white/15 hover:border-[#00e03c]/40 text-slate-200 hover:text-[#00e03c] font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Abrir en Google Calendar (Socio A y B)
                    </a>
                    <button
                      type="button"
                      onClick={() => handleDownloadIcsFile(selectedEvent)}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-slate-200 font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Descargar .ics con Alerta
                    </button>
                  </div>

                  {/* Formulario de Cierre Rápido y Entrega en el Día */}
                  <form onSubmit={handleDeliverAndConcreteTask} className="pt-2 border-t border-white/10 space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#00e03c]">
                      Concretar / Entregar Tarea del Día (Impacta Time Tracker + CRM + XP)
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-slate-400 font-bold block mb-1">Horas Reales Dedicadas *</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="12"
                          required
                          value={deliveryForm.actualHours}
                          onChange={e => setDeliveryForm({ ...deliveryForm, actualHours: e.target.value })}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-[#00e03c] font-mono font-black outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-slate-400 font-bold block mb-1">Enlace a Entregable / Drive / Reel (Opcional)</label>
                        <input
                          type="text"
                          value={deliveryForm.evidenceUrl}
                          onChange={e => setDeliveryForm({ ...deliveryForm, evidenceUrl: e.target.value })}
                          placeholder="https://drive.google.com/... o enlace de evidencia"
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e03c]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 font-bold block mb-1">
                        Resultado Concretado / Acuerdo con el Cliente *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={deliveryForm.outcomeNote}
                        onChange={e => setDeliveryForm({ ...deliveryForm, outcomeNote: e.target.value })}
                        placeholder="Describe el resultado alcanzado en el día (ej. Llamada concretada, cliente calificado BANT, video vertical publicado)..."
                        className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-white outline-none focus:border-[#00e03c]"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setSelectedEvent(null)}
                        className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 font-bold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-[#00e03c] text-slate-950 font-black hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4 stroke-[3]" /> Concretar Entrega y Acreditar Horas (+75 XP)
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
