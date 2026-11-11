/**
 * @file OdooCalendarModule.jsx
 * @description Calendario y Planificación Horaria Multi-Escala para SERAM SRL.
 * Incluye:
 * - Vistas Multi-Escala: Anual (12 meses con mapa de calor), Trimestral (Q1-Q4 con metas horarias),
 *   Mensual (con Drag & Drop de tareas), Semanal (7 columnas de carga), Diaria (franjas horarias) y Agenda Lineal.
 * - Control de Capacidad de Teletrabajo de Socios: 4.5 hrs/día (Fase Temprana) conmutable a 8.0 hrs/día (Fase Intensiva).
 * - Reprogramación fluida Drag & Drop entre fechas con recálculo automático de carga horaria y alertas visuales.
 * - Sistema de Etiquetas Libres personalizables por cada socio (Plan de Ventas Telefónicas, Formato Vertical, Lead Magnets, SIG, etc.).
 * - Cierre y Entrega Rápida en el Día: registra horas reales en el Time Tracker, publica en el Chatter del CRM y acredita XP.
 * - Automatización nativa con Docker n8n de SERAM para sincronización silenciosa en segundo plano
 *   con Google Calendar de Socio A (Ing. Diego Barrientos) y Socio B (Ing. Fernando Araujo).
 *
 * Directrices: Cero emoticones, 100% en español, modales en document.body (z-[9999]), null-safety absoluto.
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight,
  CheckCircle2, AlertCircle, X, Check, User, Users, Building2,
  Tag, Send, ExternalLink, Download, Copy, Settings, RefreshCw,
  Phone, FileText, Zap, ShieldCheck, Layers, List, LayoutGrid,
  Search, Trash2, ArrowRight, Bell, Terminal, Server, CheckSquare,
  Sparkles, Filter, Activity
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
  TELEWORK_CAP: 'seram_calendar_telework_cap_v2',
  FREE_TAGS: 'seram_calendar_free_tags_v2',
  CUSTOM_EVENTS: 'seram_calendar_custom_events_v2',
  SYNC_CONFIG: 'seram_calendar_sync_config_v2',
  SYNC_LOGS: 'seram_calendar_sync_logs_v2'
};

// ── WORKFLOW JSON LISTO PARA IMPORTAR EN DOCKER N8N ─────────────────────────
const N8N_WORKFLOW_TEMPLATE = JSON.stringify(
  {
    name: 'SERAM — Sincronización Automática de Actividades a Google Calendar (Socio A y Socio B)',
    nodes: [
      {
        parameters: {
          httpMethod: 'POST',
          path: 'seram-calendar',
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
            description: '=Responsable: {{$json["responsible"]}}\nCliente: {{$json["clientName"]}}\nDedicación: {{$json["estimatedHours"]}} hrs (Meta Teletrabajo: {{$json["dailyCap"]}} hrs/día)\nEtiquetas: {{$json["tags"]}}\nNotas: {{$json["description"]}}',
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

// ── CÓDIGO GOOGLE APPS SCRIPT (ALTERNATIVA DE RESPALDO) ──────────────────────
const GOOGLE_APPS_SCRIPT_CODE = `/**
 * SERAM SRL — Puente Automático de Notificaciones y Google Calendar (Code.gs)
 */
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var cal = CalendarApp.getDefaultCalendar();

    var title = "[SERAM] " + (payload.title || "Actividad Programada");
    var startDate = new Date(payload.startDate + "T" + (payload.startTime || "08:30") + ":00");
    var endDate = new Date((payload.dueDate || payload.startDate) + "T" + (payload.endTime || "10:00") + ":00");

    if (endDate <= startDate) {
      var hours = Number(payload.estimatedHours) || 1.5;
      endDate = new Date(startDate.getTime() + hours * 3600 * 1000);
    }

    var guestsList = payload.guests || "barrientoso2401@gmail.com,fernandoaraujo1912@gmail.com";
    var description = [
      "Sistema de Calendario & ARM — SERAM SRL",
      "Acción: " + (payload.eventType || "programacion"),
      "Responsable: " + (payload.responsible || "Socio SERAM"),
      "Cliente / Oportunidad: " + (payload.clientName || "Gestión Interna"),
      "Dedicación: " + (payload.estimatedHours || 1.5) + " hrs (Meta: " + (payload.dailyCap || 4.5) + " hrs/día)",
      "Etiquetas: " + ((payload.tags || []).join(", ") || "General"),
      "Notas: " + (payload.description || "Sin descripción adicional")
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

// ── HELPERS DE FECHA ────────────────────────────────────────────────────────
function toIsoDateStr(dateObj) {
  if (!dateObj || !(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(dateStr, days) {
  const parts = String(dateStr || '').split('-').map(Number);
  if (parts.length !== 3) return dateStr;
  const dt = new Date(parts[0], parts[1] - 1, parts[2]);
  dt.setDate(dt.getDate() + days);
  return toIsoDateStr(dt);
}

function isDateBetween(dayStr, startStr, endStr) {
  const s = startStr || endStr;
  const e = endStr || startStr;
  if (!s || !dayStr) return false;
  return dayStr >= s && dayStr <= e;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const MONTH_NAMES_SHORT = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
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
      // Ignorar error de cuota local
    }
    triggerToast?.(
      `Meta de teletrabajo ajustada a ${newCap} hrs/día por socio (${newCap === 4.5 ? 'Fase Temprana' : 'Fase Intensiva'})`,
      'success'
    );
  };

  // ── 2. SECCIONES Y ESCALAS MULTI-VISTA (AÑO, TRIMESTRE, MES, SEMANA, DÍA, AGENDA) ──
  const [activeSection, setActiveSection] = useState('calendar'); // 'calendar' | 'sales_plan' | 'tags' | 'automation'
  const [scaleMode, setScaleMode] = useState('month'); // 'year' | 'quarter' | 'month' | 'week' | 'day' | 'agenda'
  const [cursorDate, setCursorDate] = useState(() => new Date());
  const [partnerFilter, setPartnerFilter] = useState('all'); // 'all' | 'Ing. Diego Barrientos' | 'Ing. Fernando Araujo'
  const [tagFilter, setTagFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Trimestre seleccionado en vista trimestral (1..4)
  const [selectedQuarter, setSelectedQuarter] = useState(() => Math.floor(new Date().getMonth() / 3) + 1);

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

  // ── 4. EVENTOS LOCALES / OVERRIDES DE CALENDARIO ──
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
      // Ignorar
    }
  }, []);

  // ── 5. DATOS DEL CRM (LEADS Y MISIONES) ──
  const [crmLeads, setCrmLeads] = useState([]);
  const [crmActivities, setCrmActivities] = useState([]);

  const refreshCrmItems = useCallback(async () => {
    try {
      const loadedLeads = await armService.getLeads(clients || []);
      setCrmLeads(Array.isArray(loadedLeads) ? loadedLeads : []);
      const loadedActs = armService.getAllLeadActivities();
      setCrmActivities(Array.isArray(loadedActs) ? loadedActs : []);
    } catch {
      setCrmLeads([]);
      setCrmActivities([]);
    }
  }, [clients]);

  useEffect(() => {
    refreshCrmItems();
  }, [refreshCrmItems]);

  // ── 6. CONFIGURACIÓN DOCKER N8N & NOTIFICACIONES EN SEGUNDO PLANO ──
  const [syncConfig, setSyncConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SYNC_CONFIG);
      return saved
        ? JSON.parse(saved)
        : {
            n8nWebhookUrl: 'http://localhost:5678/webhook/seram-calendar',
            appsScriptUrl: '',
            activeBridge: 'n8n', // 'n8n' | 'appsscript'
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
        n8nWebhookUrl: 'http://localhost:5678/webhook/seram-calendar',
        appsScriptUrl: '',
        activeBridge: 'n8n',
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

  const [isTestingN8n, setIsTestingN8n] = useState(false);

  const handleSaveSyncConfig = (nextConfig) => {
    setSyncConfig(nextConfig);
    try {
      localStorage.setItem(STORAGE_KEYS.SYNC_CONFIG, JSON.stringify(nextConfig));
    } catch {
      // Ignorar
    }
  };

  /**
   * Despachador en Segundo Plano (Non-blocking) hacia Docker n8n / Google Apps Script
   */
  const dispatchBackgroundCalendarSync = useCallback(
    async (eventType, eventData) => {
      const guests = [];
      if (syncConfig.notifySocioA && syncConfig.socioAEmail) guests.push(syncConfig.socioAEmail);
      if (syncConfig.notifySocioB && syncConfig.socioBEmail) guests.push(syncConfig.socioBEmail);

      const startDate = eventData.startDate || toIsoDateStr(new Date());
      const dueDate = eventData.dueDate || startDate;
      const startTime = eventData.startTime || '08:30';
      const endTime = eventData.endTime || '10:00';

      const payload = {
        eventType,
        timestamp: new Date().toISOString(),
        title: eventData.title || 'Actividad SERAM',
        description: eventData.description || '',
        clientName: eventData.clientName || 'Gestión SERAM',
        responsible: eventData.responsible || currentSocio?.name || 'Ing. Diego Barrientos',
        participants: eventData.participants || [eventData.responsible || 'Ing. Diego Barrientos'],
        startDate,
        dueDate,
        startTime,
        endTime,
        startIso: `${startDate}T${startTime}:00`,
        endIso: `${dueDate}T${endTime}:00`,
        estimatedHours: Number(eventData.estimatedHours) || 1.5,
        actualHours: Number(eventData.actualHours) || 0,
        dailyCap: dailyCapHours,
        tags: Array.isArray(eventData.tags) ? eventData.tags.join(', ') : (eventData.tags || 'General'),
        guests: guests.join(',')
      };

      const targets = [];
      if (syncConfig.n8nWebhookUrl?.trim()) {
        targets.push({ name: 'Docker n8n SERAM', url: syncConfig.n8nWebhookUrl.trim() });
      }
      if (syncConfig.appsScriptUrl?.trim()) {
        targets.push({ name: 'Google Apps Script', url: syncConfig.appsScriptUrl.trim() });
      }

      targets.forEach(tgt => {
        fetch(tgt.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          mode: 'no-cors'
        })
          .then(() => {
            // Éxito silencioso
          })
          .catch(() => {
            // Silencioso
          });
      });

      const logItem = {
        id: `sync-${Date.now()}`,
        time: new Date().toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        date: toIsoDateStr(new Date()),
        eventType,
        title: payload.title,
        responsible: payload.responsible,
        guests: payload.guests,
        status: targets.length > 0 ? 'Sincronizado' : 'Local'
      };

      setSyncLogs(prev => {
        const next = [logItem, ...(Array.isArray(prev) ? prev : [])].slice(0, 40);
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

  // Probar conexión en vivo con Docker n8n
  const handleTestN8nConnection = async () => {
    if (!syncConfig.n8nWebhookUrl?.trim()) {
      triggerToast?.('Ingresa primero la URL del Webhook de tu Docker n8n', 'error');
      return;
    }
    setIsTestingN8n(true);
    try {
      const todayStr = toIsoDateStr(new Date());
      await dispatchBackgroundCalendarSync('task.test_ping', {
        title: 'Prueba de Automatización Docker n8n SERAM',
        description: 'Verificación de enlace con los calendarios de Socio A (Diego) y Socio B (Fernando)',
        clientName: 'Directorio SERAM SRL',
        responsible: currentSocio?.name || 'Ing. Diego Barrientos',
        startDate: todayStr,
        dueDate: todayStr,
        startTime: '09:00',
        endTime: '10:00',
        estimatedHours: 1.0,
        tags: ['Reunión de Socios / Directorio']
      });
      triggerToast?.('Evento de prueba enviado al Webhook de Docker n8n', 'success');
    } catch {
      triggerToast?.('No se pudo contactar el Webhook de n8n. Revisa si el Docker está corriendo.', 'error');
    } finally {
      setIsTestingN8n(false);
    }
  };

  // ── 7. UNIFICACIÓN DE EVENTOS CON BLINDAJE DE DATOS (NULL-SAFETY) ──
  const unifiedEvents = useMemo(() => {
    const todayStr = toIsoDateStr(new Date());
    const map = new Map();

    // A) Actividades Globales
    (activities || []).forEach(act => {
      if (!act) return;
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

    // B) Actividades del CRM
    (crmActivities || []).forEach(crmAct => {
      if (!crmAct) return;
      const key = `crm-${crmAct.id}`;
      const ov = calendarOverrides[key] || {};
      const parentLead = crmLeads.find(l => l && String(l.id) === String(crmAct.lead_id));
      const startDate = ov.startDate || crmAct.fecha_inicio || crmAct.fecha_vencimiento || todayStr;
      const dueDate = ov.dueDate || crmAct.fecha_vencimiento || startDate;
      const isDone = ov.status === 'Concluido' || crmAct.estado === 'completada';

      map.set(key, {
        uid: key,
        rawId: crmAct.id,
        source: 'crm',
        title: ov.title || crmAct.titulo || 'Seguimiento Comercial',
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

    // C) Eventos creados directamente en Calendario
    Object.entries(calendarOverrides || {}).forEach(([key, ov]) => {
      if (!ov) return;
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
          (ev.title || '').toLowerCase().includes(q) ||
          (ev.clientName || '').toLowerCase().includes(q) ||
          (ev.description || '').toLowerCase().includes(q);
        if (!matchText) return false;
      }
      return true;
    });
  }, [activities, crmActivities, crmLeads, calendarOverrides, partnerFilter, tagFilter, searchQuery, currentSocio]);

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
      return evs.reduce((sum, ev) => sum + (Number(ev.estimatedHours) || 1.0), 0);
    },
    [getEventsForDay]
  );

  // ── 8. VISTA MENSUAL: CÁLCULO DE CELDAS ──
  const monthDaysGrid = useMemo(() => {
    const year = cursorDate.getFullYear();
    const month = cursorDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startOffset = (firstDayOfMonth.getDay() + 6) % 7; // Lunes = 0
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

  // ── 9. VISTA SEMANAL: CÁLCULO DE 7 DÍAS ──
  const weekDaysGrid = useMemo(() => {
    const dayOfWeek = (cursorDate.getDay() + 6) % 7; // Lunes = 0
    const monday = new Date(cursorDate.getFullYear(), cursorDate.getMonth(), cursorDate.getDate() - dayOfWeek);
    return Array.from({ length: 7 }, (_, idx) => {
      const dt = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + idx);
      return { dateObj: dt, dateStr: toIsoDateStr(dt), dayName: DAY_NAMES_SHORT[idx] };
    });
  }, [cursorDate]);

  // ── 10. VISTA ANUAL: CÁLCULO DE LOS 12 MESES ──
  const yearMonthsData = useMemo(() => {
    const y = cursorDate.getFullYear();
    return Array.from({ length: 12 }, (_, mIdx) => {
      const firstDay = new Date(y, mIdx, 1);
      const lastDay = new Date(y, mIdx + 1, 0);
      const startOffset = (firstDay.getDay() + 6) % 7;
      const totalDays = lastDay.getDate();

      const days = [];
      for (let i = startOffset - 1; i >= 0; i--) {
        const dt = new Date(y, mIdx, -i);
        days.push({ dt, dateStr: toIsoDateStr(dt), isCurrentMonth: false, dayNum: dt.getDate() });
      }
      for (let d = 1; d <= totalDays; d++) {
        const dt = new Date(y, mIdx, d);
        days.push({ dt, dateStr: toIsoDateStr(dt), isCurrentMonth: true, dayNum: d });
      }
      while (days.length % 7 !== 0) {
        const lastDt = days[days.length - 1].dt;
        const nextDt = new Date(lastDt.getFullYear(), lastDt.getMonth(), lastDt.getDate() + 1);
        days.push({ dt: nextDt, dateStr: toIsoDateStr(nextDt), isCurrentMonth: false, dayNum: nextDt.getDate() });
      }

      return {
        monthIndex: mIdx,
        monthName: MONTH_NAMES[mIdx],
        days
      };
    });
  }, [cursorDate]);

  // ── 11. VISTA TRIMESTRAL: MESES DE Q1, Q2, Q3 O Q4 ──
  const quarterMonthsData = useMemo(() => {
    const y = cursorDate.getFullYear();
    const startM = (selectedQuarter - 1) * 3;
    const qMonths = [startM, startM + 1, startM + 2];

    return qMonths.map(mIdx => {
      const firstDay = new Date(y, mIdx, 1);
      const lastDay = new Date(y, mIdx + 1, 0);
      const startOffset = (firstDay.getDay() + 6) % 7;
      const totalDays = lastDay.getDate();

      const days = [];
      for (let i = startOffset - 1; i >= 0; i--) {
        const dt = new Date(y, mIdx, -i);
        days.push({ dt, dateStr: toIsoDateStr(dt), isCurrentMonth: false, dayNum: dt.getDate() });
      }
      for (let d = 1; d <= totalDays; d++) {
        const dt = new Date(y, mIdx, d);
        days.push({ dt, dateStr: toIsoDateStr(dt), isCurrentMonth: true, dayNum: d });
      }
      while (days.length % 7 !== 0) {
        const lastDt = days[days.length - 1].dt;
        const nextDt = new Date(lastDt.getFullYear(), lastDt.getMonth(), lastDt.getDate() + 1);
        days.push({ dt: nextDt, dateStr: toIsoDateStr(nextDt), isCurrentMonth: false, dayNum: nextDt.getDate() });
      }

      const monthEvents = unifiedEvents.filter(ev => {
        const parts = (ev.startDate || '').split('-');
        return parts.length === 3 && parseInt(parts[1], 10) - 1 === mIdx;
      });

      const monthHours = monthEvents.reduce((acc, ev) => acc + (Number(ev.estimatedHours) || 1.5), 0);

      return {
        monthIndex: mIdx,
        monthName: MONTH_NAMES[mIdx],
        days,
        events: monthEvents,
        totalHours: monthHours
      };
    });
  }, [cursorDate, selectedQuarter, unifiedEvents]);

  // Horas del trimestre completo
  const totalQuarterScheduledHours = useMemo(() => {
    return quarterMonthsData.reduce((acc, m) => acc + m.totalHours, 0);
  }, [quarterMonthsData]);

  const quarterTargetHours = Math.round(65 * dailyCapHours); // ~65 días hábiles

  // ── 12. DRAG & DROP ENTRE FECHAS ──
  const [draggedEventUid, setDraggedEventUid] = useState(null);
  const [dragOverDateStr, setDragOverDateStr] = useState(null);

  const handleDragStartEvent = (e, evUid) => {
    setDraggedEventUid(evUid);
    e.dataTransfer?.setData('text/plain', evUid);
  };

  const handleDropOnDay = (e, targetDateStr) => {
    e.preventDefault();
    setDragOverDateStr(null);
    const evUid = draggedEventUid || e.dataTransfer?.getData('text/plain');
    if (!evUid || !targetDateStr) return;

    const targetEv = unifiedEvents.find(ev => ev.uid === evUid);
    if (!targetEv) return;

    let dayDiff = 0;
    if (targetEv.dueDate && targetEv.startDate) {
      const s = new Date(targetEv.startDate).getTime();
      const d = new Date(targetEv.dueDate).getTime();
      dayDiff = Math.max(0, Math.round((d - s) / (1000 * 3600 * 24)));
    }
    const newEndDate = addDays(targetDateStr, dayDiff);

    const nextOverrides = {
      ...calendarOverrides,
      [evUid]: {
        ...(calendarOverrides[evUid] || {}),
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

  // ── 13. MODAL DE CREACIÓN / ASIGNACIÓN ──
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

    const nextOverrides = {
      ...calendarOverrides,
      [newUid]: eventPayload
    };
    saveCalendarOverrides(nextOverrides);

    if (handleAddActivity) {
      try {
        await handleAddActivity({
          title: eventPayload.title,
          description: eventPayload.description || `Bloque de teletrabajo asignado a ${eventPayload.responsible}`,
          startDate: eventPayload.startDate,
          dueDate: eventPayload.dueDate,
          startTime: eventPayload.startTime,
          endTime: eventPayload.endTime,
          assignedPartner: eventPayload.responsible,
          assignedTeam: participants,
          estimatedHours: eventPayload.estimatedHours,
          category: eventPayload.tags?.[0] || 'Comercial',
          priority: 'Media',
          status: 'Pendiente',
          clientName: eventPayload.clientName,
          leadId: eventPayload.leadId
        });
      } catch {
        // Fallback local
      }
    }

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

    if (syncConfig.autoSyncOnCreate) {
      dispatchBackgroundCalendarSync('task.created', eventPayload);
    }

    triggerToast?.(`Actividad "${eventPayload.title}" programada en el Calendario`, 'success');
    setShowScheduleModal(false);
  };

  // ── 14. MODAL DE ENTREGA RÁPIDA EN EL DÍA ──
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

    if (handleAddTimeLog) {
      try {
        await handleAddTimeLog({
          partner_name: selectedEvent.responsible || currentSocio?.name || 'Ing. Diego Barrientos',
          partner_id: selectedEvent.responsible?.includes('Fernando')
            ? 'fernandoaraujo1912@gmail.com'
            : 'barrientoso2401@gmail.com',
          hours: hoursLogged,
          description: `[Calendario SERAM] ${selectedEvent.title} — Resultado: ${deliveryForm.outcomeNote.trim()}`,
          date: toIsoDateStr(new Date())
        });
      } catch {
        // Fallback local
      }
    }

    if (handleUpdateActivityStatus && selectedEvent.rawId) {
      try {
        await handleUpdateActivityStatus(selectedEvent.rawId, 'Concluido');
      } catch {
        // Fallback
      }
    }

    if (selectedEvent.leadId) {
      armService.completeLeadActivity(
        selectedEvent.leadId,
        selectedEvent.rawId,
        `Concretado en Calendario: ${deliveryForm.outcomeNote.trim()}`
      );
      refreshCrmItems();
    }

    if (syncConfig.autoSyncOnComplete) {
      dispatchBackgroundCalendarSync('task.completed', updatedEv);
    }

    triggerToast?.(
      `Tarea concretada (+${hoursLogged} hrs auditadas en Time Tracker y +75 XP de mérito)`,
      'success'
    );
    setSelectedEvent(null);
  };

  // ── 15. GESTIÓN DE ETIQUETAS LIBRES ──
  const handleCreateFreeTag = (e) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
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

  // ── 16. RESUMEN DE CAPACIDAD HORARIA DE HOY ──
  const todayStr = toIsoDateStr(new Date());
  const todayScheduledHours = getDayScheduledHours(todayStr);
  const todayCompletedHours = getEventsForDay(todayStr)
    .filter(ev => ev.status === 'Concluido')
    .reduce((acc, ev) => acc + (Number(ev.actualHours || ev.estimatedHours) || 0), 0);

  return (
    <div className="space-y-4 text-slate-100 select-none">
      {/* ══════════════════════════════════════════════════════════════════════════
          1. BARRA SUPERIOR CONTEXTUAL DEL CALENDARIO SERAM
         ══════════════════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl bg-[#071109] border border-white/[0.1] px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        {/* Izquierda: Sub-secciones */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <div className="flex items-center gap-2 pr-3 border-r border-white/10">
            <div className="w-7 h-7 rounded-lg bg-[#00e03c]/15 border border-[#00e03c]/40 flex items-center justify-center text-[#00e03c]">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <span className="text-sm font-black tracking-tight text-white">Calendario SERAM</span>
          </div>

          {[
            { id: 'calendar', label: 'Calendario & Teletrabajo' },
            { id: 'sales_plan', label: 'Plan de Ventas & Inbound' },
            { id: 'tags', label: `Etiquetas Libres (${freeTags.length})` },
            { id: 'automation', label: 'Automatización Docker n8n' }
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

        {/* Derecha: Conmutador de Meta Diaria de Teletrabajo (4.5h <-> 8.0h) y Botón Nuevo */}
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
              title="Fase Temprana: 4.5 horas diarias dedicadas por socio"
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
              title="Fase Intensiva: 8.0 horas diarias para ventas y content marketing"
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
            <span>Programar Actividad</span>
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════════
          2. NAVEGADOR DE VISTAS Y CONTROLES MULTI-ESCALA
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'calendar' && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 bg-[#0a140c] border border-white/[0.08] p-3.5 rounded-2xl items-center">
            {/* Navegación de Fechas */}
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
                    if (scaleMode === 'year') dt.setFullYear(dt.getFullYear() - 1);
                    else if (scaleMode === 'quarter') {
                      setSelectedQuarter(q => (q === 1 ? 4 : q - 1));
                    } else if (scaleMode === 'month') dt.setMonth(dt.getMonth() - 1);
                    else if (scaleMode === 'week') dt.setDate(dt.getDate() - 7);
                    else dt.setDate(dt.getDate() - 1);
                    setCursorDate(dt);
                  }}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white cursor-pointer"
                  title="Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const dt = new Date(cursorDate);
                    if (scaleMode === 'year') dt.setFullYear(dt.getFullYear() + 1);
                    else if (scaleMode === 'quarter') {
                      setSelectedQuarter(q => (q === 4 ? 1 : q + 1));
                    } else if (scaleMode === 'month') dt.setMonth(dt.getMonth() + 1);
                    else if (scaleMode === 'week') dt.setDate(dt.getDate() + 7);
                    else dt.setDate(dt.getDate() + 1);
                    setCursorDate(dt);
                  }}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white cursor-pointer"
                  title="Siguiente"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-sm sm:text-base font-black text-white">
                {scaleMode === 'year'
                  ? `Año ${cursorDate.getFullYear()}`
                  : scaleMode === 'quarter'
                  ? `Q${selectedQuarter} (${MONTH_NAMES_SHORT[(selectedQuarter - 1) * 3]} - ${MONTH_NAMES_SHORT[(selectedQuarter - 1) * 3 + 2]}) · ${cursorDate.getFullYear()}`
                  : `${MONTH_NAMES[cursorDate.getMonth()]} ${cursorDate.getFullYear()}`}
              </h3>
            </div>

            {/* Medidor de Dedicación Diaria de Hoy */}
            <div className="lg:col-span-3 flex flex-col gap-1 bg-black/40 px-3.5 py-2 rounded-xl border border-white/[0.07]">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-slate-300">
                  Carga Hoy ({todayStr}): <strong className="text-white font-mono">{todayScheduledHours.toFixed(1)}h</strong> / {dailyCapHours}h
                </span>
                <span className="font-mono text-[#00e03c] font-bold">
                  {todayCompletedHours.toFixed(1)}h
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

            {/* Selector de Escala Multi-Vista: Anual, Trimestral, Mes, Semana, Día, Agenda */}
            <div className="lg:col-span-4 flex items-center justify-end gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.08] overflow-x-auto">
              {[
                { id: 'year', label: 'Anual' },
                { id: 'quarter', label: 'Trimestral' },
                { id: 'month', label: 'Mes' },
                { id: 'week', label: 'Semana' },
                { id: 'day', label: 'Día' },
                { id: 'agenda', label: 'Agenda' }
              ].map(sc => (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setScaleMode(sc.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    scaleMode === sc.id
                      ? 'bg-[#00e03c] text-slate-950 font-black shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>

          {/* Barra de Filtros: Socios, Etiquetas y Búsqueda */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 bg-black/30 px-3.5 py-2.5 rounded-xl border border-white/[0.06]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 mr-1">Socio:</span>
              {[
                { id: 'all', label: 'Ambos Socios' },
                { id: 'Ing. Diego Barrientos', label: 'Socio A: Diego' },
                { id: 'Ing. Fernando Araujo', label: 'Socio B: Fernando' }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPartnerFilter(p.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    partnerFilter === p.id
                      ? 'bg-[#00e03c]/20 text-[#00e03c] border border-[#00e03c]/40 font-black'
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
                <option value="all">Todas las Etiquetas</option>
                {freeTags.map(t => (
                  <option key={t.id} value={t.name}>
                    {t.name}
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

          {/* ════════════════════════════════════════════════════════════════════════
              VISTA 1: ANUAL (12 MESES CON MAPA DE CALOR Y NAVEGACIÓN INSTANTÁNEA)
             ════════════════════════════════════════════════════════════════════════ */}
          {scaleMode === 'year' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#08110a] border border-white/[0.1] p-4 rounded-2xl">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Total Actividades {cursorDate.getFullYear()}</span>
                  <p className="text-xl font-black text-white mt-0.5">{unifiedEvents.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Horas Programadas en el Año</span>
                  <p className="text-xl font-black text-amber-300 mt-0.5">
                    {unifiedEvents.reduce((s, ev) => s + (Number(ev.estimatedHours) || 1.5), 0).toFixed(0)} hrs
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Horas Concretadas</span>
                  <p className="text-xl font-black text-[#00e03c] mt-0.5">
                    {unifiedEvents
                      .filter(ev => ev.status === 'Concluido')
                      .reduce((s, ev) => s + (Number(ev.actualHours || ev.estimatedHours) || 0), 0)
                      .toFixed(0)} hrs
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block">Capacidad Pactada por Socio</span>
                  <p className="text-xl font-black text-cyan-300 mt-0.5">
                    {Math.round(260 * dailyCapHours)} hrs/año ({dailyCapHours}h/d)
                  </p>
                </div>
              </div>

              {/* Grilla de los 12 meses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                {yearMonthsData.map(m => {
                  const mEvents = unifiedEvents.filter(ev => {
                    const parts = (ev.startDate || '').split('-');
                    return parts.length === 3 && parseInt(parts[1], 10) - 1 === m.monthIndex;
                  });

                  return (
                    <div
                      key={m.monthIndex}
                      onClick={() => {
                        setCursorDate(new Date(cursorDate.getFullYear(), m.monthIndex, 1));
                        setScaleMode('month');
                      }}
                      className="p-3 rounded-2xl bg-[#08110a] hover:bg-[#0c1a0e] border border-white/[0.08] hover:border-[#00e03c]/40 transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
                        <span className="text-xs font-black text-white group-hover:text-[#00e03c] transition-colors">
                          {m.monthName}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {mEvents.length} {mEvents.length === 1 ? 'act.' : 'acts.'}
                        </span>
                      </div>

                      {/* Cuadrícula compacta de días */}
                      <div className="grid grid-cols-7 gap-1 text-[9px] text-center font-mono">
                        {DAY_NAMES_SHORT.map(d => (
                          <span key={d} className="text-slate-500 font-bold">
                            {d[0]}
                          </span>
                        ))}
                        {m.days.map((cell, idx) => {
                          const evs = getEventsForDay(cell.dateStr);
                          const hasEv = evs.length > 0;
                          const isToday = cell.dateStr === todayStr;

                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCursorDate(cell.dt);
                                setScaleMode('day');
                              }}
                              className={`h-5 rounded flex items-center justify-center transition-colors relative cursor-pointer ${
                                !cell.isCurrentMonth
                                  ? 'text-slate-600'
                                  : isToday
                                  ? 'bg-[#00e03c] text-slate-950 font-black'
                                  : hasEv
                                  ? 'bg-emerald-500/25 text-emerald-300 font-bold border border-emerald-500/40'
                                  : 'text-slate-300 hover:bg-white/[0.06]'
                              }`}
                              title={hasEv ? `${cell.dateStr}: ${evs.length} tareas programadas` : cell.dateStr}
                            >
                              <span>{cell.dayNum}</span>
                              {hasEv && !isToday && (
                                <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#00e03c]" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              VISTA 2: TRIMESTRAL (Q1, Q2, Q3, Q4 CON METAS DE TELETRABAJO Y DESGLOSE)
             ════════════════════════════════════════════════════════════════════════ */}
          {scaleMode === 'quarter' && (
            <div className="space-y-4">
              {/* Selector de Trimestres Q1..Q4 */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-[#08110a] border border-white/[0.1] p-3.5 rounded-2xl">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono uppercase text-slate-400 mr-2">Trimestre:</span>
                  {[
                    { q: 1, label: 'Q1 (Ene - Mar)' },
                    { q: 2, label: 'Q2 (Abr - Jun)' },
                    { q: 3, label: 'Q3 (Jul - Sep)' },
                    { q: 4, label: 'Q4 (Oct - Dic)' }
                  ].map(tab => (
                    <button
                      key={tab.q}
                      type="button"
                      onClick={() => setSelectedQuarter(tab.q)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedQuarter === tab.q
                          ? 'bg-[#00e03c] text-slate-950 font-black shadow-sm'
                          : 'bg-white/[0.04] text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className="text-slate-400">
                    Carga Planificada Q{selectedQuarter}: <strong className="text-white font-mono">{totalQuarterScheduledHours.toFixed(1)}h</strong>
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-[#00e03c] font-bold">
                    Meta Trimestral: ~{quarterTargetHours} hrs/socio ({dailyCapHours}h/d)
                  </span>
                </div>
              </div>

              {/* 3 Columnas para los 3 Meses del Trimestre */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {quarterMonthsData.map(m => (
                  <div
                    key={m.monthIndex}
                    className="p-4 rounded-2xl bg-[#08110a] border border-white/[0.08] space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                        <div>
                          <h4 className="text-sm font-black text-white">{m.monthName}</h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            Dedicación: {m.totalHours.toFixed(1)} hrs
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCursorDate(new Date(cursorDate.getFullYear(), m.monthIndex, 1));
                            setScaleMode('month');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-[#00e03c] text-slate-300 hover:text-slate-950 text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          Ver Mes ➔
                        </button>
                      </div>

                      {/* Lista de Actividades del Mes en el Trimestre */}
                      <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                        {m.events.length === 0 ? (
                          <div className="py-8 text-center text-slate-500 text-xs">
                            Sin actividades programadas en este mes.
                          </div>
                        ) : (
                          m.events.map(ev => (
                            <div
                              key={ev.uid}
                              onClick={() => handleSelectEvent(ev)}
                              className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] flex items-center justify-between gap-2 cursor-pointer transition-all"
                            >
                              <div className="space-y-0.5 truncate">
                                <div className="flex items-center gap-1.5 text-[9.5px]">
                                  <span className="font-mono text-[#00e03c] font-bold">{ev.startDate}</span>
                                  <span className="text-slate-400">· {ev.responsible}</span>
                                </div>
                                <p className="text-xs font-bold text-white truncate">{ev.title}</p>
                                {ev.clientName && (
                                  <p className="text-[10px] text-cyan-300 truncate">{ev.clientName}</p>
                                )}
                              </div>
                              <span className="text-[10px] font-mono font-bold text-amber-300 shrink-0">
                                {ev.estimatedHours}h
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenScheduleForDate(toIsoDateStr(new Date(cursorDate.getFullYear(), m.monthIndex, 1)))}
                      className="w-full py-1.5 rounded-xl bg-white/[0.04] hover:bg-[#00e03c]/20 text-slate-300 hover:text-[#00e03c] text-xs font-bold border border-dashed border-white/10 transition-colors cursor-pointer"
                    >
                      + Programar en {m.monthName}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              VISTA 3: MENSUAL (CUADRÍCULA CON DRAG & DROP Y BARRAS DE CAPACIDAD)
             ════════════════════════════════════════════════════════════════════════ */}
          {scaleMode === 'month' && (
            <div className="rounded-2xl bg-[#08110a] border border-white/[0.1] overflow-hidden shadow-2xl">
              <div className="grid grid-cols-7 border-b border-white/[0.08] bg-white/[0.03]">
                {DAY_NAMES_SHORT.map(dName => (
                  <div key={dName} className="py-2.5 text-center text-[11px] font-black uppercase tracking-wider text-slate-400">
                    {dName}
                  </div>
                ))}
              </div>

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

          {/* ════════════════════════════════════════════════════════════════════════
              VISTA 4: SEMANAL (7 COLUMNAS DETALLADAS DE DEDICACIÓN)
             ════════════════════════════════════════════════════════════════════════ */}
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
                      isToday ? 'border-[#00e03c]/50 ring-1 ring-[#00e03c]/30' : 'border-white/[0.08]'
                    }`}
                  >
                    <div>
                      <div className="border-b border-white/[0.08] pb-2 mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase text-slate-300">
                            {col.dayName}
                          </span>
                          <span
                            className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                              isToday ? 'bg-[#00e03c] text-slate-950' : 'text-white'
                            }`}
                          >
                            {col.dateObj.getDate()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] mt-1 font-mono">
                          <span className={isOverCap ? 'text-rose-400 font-bold' : 'text-slate-400'}>
                            {dayHours.toFixed(1)}h / {dailyCapHours}h
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        {dayEvents.map(ev => (
                          <div
                            key={ev.uid}
                            draggable
                            onDragStart={e => handleDragStartEvent(e, ev.uid)}
                            onClick={() => handleSelectEvent(ev)}
                            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-[10.5px] cursor-pointer transition-all"
                          >
                            <span className="font-bold text-white block truncate">{ev.title}</span>
                            <span className="text-[9px] text-[#00e03c] font-mono block">
                              {ev.startTime} ({ev.estimatedHours}h)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenScheduleForDate(col.dateStr)}
                      className="mt-2 w-full py-1 rounded-xl bg-white/[0.03] hover:bg-[#00e03c] hover:text-slate-950 text-slate-400 text-[10px] font-bold border border-dashed border-white/10 transition-colors cursor-pointer"
                    >
                      + Programar
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* ════════════════════════════════════════════════════════════════════════
              VISTA 5: DIARIA (AGENDA CON FRANJAS HORARIAS)
             ════════════════════════════════════════════════════════════════════════ */}
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

          {/* ════════════════════════════════════════════════════════════════════════
              VISTA 6: AGENDA LINEAL CRONOLÓGICA
             ════════════════════════════════════════════════════════════════════════ */}
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
                          {ev.status === 'Concluido' ? 'Auditado' : 'Concretar'}
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
          3. SECCIÓN: PLAN DE VENTAS TELEFÓNICAS & INBOUND (FORMATOS VERTICALES)
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'sales_plan' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0a180e] to-black border border-[#00e03c]/30 space-y-2">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#00e03c]" />
              Estrategia de Ventas Telefónicas & Content Marketing Vertical Inbound
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl">
              Bloques de trabajo programados para ejecutar llamadas de seguimiento BANT, prospección de base de datos SEPREC y producción de videos verticales (Reels / TikTok) con ganchos de conversión y lead magnets (dossiers ambientales).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                title: 'Bloque 1: Seguimiento Telefónico BANT',
                hours: '1.5 hrs/día',
                tag: 'Seguimiento Telefónico BANT',
                desc: 'Llamar a 5-8 prospectos SEPREC y clientes antiguos para calificar presupuesto y urgencia.',
                icon: Phone,
                color: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
              },
              {
                title: 'Bloque 2: Video Vertical & Lead Magnet',
                hours: '1.5 hrs/día',
                tag: 'Content Marketing Vertical / Reels',
                desc: 'Grabación de 2 videos verticales cortos explicando casos de regularización o fiscalización minera.',
                icon: Zap,
                color: 'border-purple-500/40 text-purple-400 bg-purple-500/10'
              },
              {
                title: 'Bloque 3: Cierres y Propuestas Técnicas',
                hours: '1.5 hrs/día',
                tag: 'Cierre Comercial Directo',
                desc: 'Envío de cotizaciones formales y seguimiento de acuerdos alcanzados por WhatsApp.',
                icon: CheckSquare,
                color: 'border-amber-500/40 text-amber-400 bg-amber-500/10'
              }
            ].map((block, idx) => {
              const BlockIcon = block.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-[#08110a] border border-white/10 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-xl border ${block.color}`}>
                        <BlockIcon className="w-4 h-4" />
                      </div>
                      <span className="font-mono text-xs font-bold text-[#00e03c] bg-[#00e03c]/10 px-2 py-0.5 rounded-full border border-[#00e03c]/20">
                        {block.hours}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-white">{block.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{block.desc}</p>
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
                        startTime: idx === 0 ? '08:30' : idx === 1 ? '10:30' : '15:00',
                        endTime: idx === 0 ? '10:00' : idx === 1 ? '12:00' : '16:30',
                        estimatedHours: 1.5,
                        tags: [block.tag],
                        description: block.desc
                      });
                      setShowScheduleModal(true);
                    }}
                    className="w-full py-2 rounded-xl bg-[#00e03c] text-slate-950 font-black text-xs hover:bg-white transition-colors cursor-pointer"
                  >
                    + Agendar este Bloque Hoy
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          4. SECCIÓN: GESTOR DE ETIQUETAS LIBRES
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'tags' && (
        <div className="space-y-4">
          <form
            onSubmit={handleCreateFreeTag}
            className="p-4 rounded-2xl bg-[#09130b] border border-white/[0.1] grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs"
          >
            <input
              type="text"
              required
              value={newTagName}
              onChange={e => setNewTagName(e.target.value)}
              placeholder="Nombre de la nueva etiqueta libre..."
              className="sm:col-span-2 bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e03c]"
            />
            <select
              value={newTagColor}
              onChange={e => setNewTagColor(e.target.value)}
              className="bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
            >
              {FREE_TAG_COLOR_PALETTE.map(col => (
                <option key={col.id} value={col.id}>
                  Color: {col.label}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#00e03c] text-slate-950 font-black hover:bg-white transition-colors cursor-pointer"
            >
              + Crear Etiqueta Libre
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {freeTags.map(tag => (
              <div
                key={tag.id}
                className="p-3.5 rounded-2xl bg-[#08110a] border border-white/[0.08] flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full border ${getTagBadgeClass(tag.name)}`} />
                  <span className="font-bold text-white">{tag.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteFreeTag(tag.id)}
                  className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
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
          5. SECCIÓN: AUTOMATIZACIÓN CON DOCKER N8N & GOOGLE CALENDAR (PASO A PASO)
         ══════════════════════════════════════════════════════════════════════════ */}
      {activeSection === 'automation' && (
        <div className="space-y-4">
          {/* Tarjeta de Encabezado Pedagógica */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-[#0a180e] to-black border border-[#00e03c]/30 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-[#00e03c]/20 border border-[#00e03c]/40 text-[#00e03c]">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    Automatización en Segundo Plano con Docker n8n (SERAM SRL)
                  </h3>
                  <p className="text-xs text-[#00e03c] font-bold">
                    Sincronización automática de reuniones, tareas y clientes a Google Calendar
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-[#00e03c]/15 text-[#00e03c] border border-[#00e03c]/30 text-xs font-black">
                100% Automático · Cero Complicaciones
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-4xl pt-1">
              Cada vez que programes, reprogrames o concluyas una actividad en el Calendario, este sistema enviará la información a tu contenedor propio de **Docker n8n**, el cual agendará automáticamente el evento en los Google Calendars individuales de **Diego Barrientos (`barrientoso2401@gmail.com`)** y **Fernando Araujo (`fernandoaraujo1912@gmail.com`)**.
            </p>
          </div>

          {/* Guía en 4 Pasos Visuales para No Técnicos */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="p-4 rounded-2xl bg-[#08110a] border border-white/[0.08] space-y-2">
              <span className="w-6 h-6 rounded-lg bg-[#00e03c]/20 text-[#00e03c] border border-[#00e03c]/30 font-black flex items-center justify-center text-xs">
                1
              </span>
              <h4 className="font-black text-white">Abre tu Docker n8n</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Ingresa al n8n que corre en el Docker de SERAM desde tu navegador (por ejemplo: <strong className="text-white font-mono">http://localhost:5678</strong> o la IP del servidor).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#08110a] border border-white/[0.08] space-y-2">
              <span className="w-6 h-6 rounded-lg bg-[#00e03c]/20 text-[#00e03c] border border-[#00e03c]/30 font-black flex items-center justify-center text-xs">
                2
              </span>
              <h4 className="font-black text-white">Importa el Flujo Listo</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Haz clic en el botón <strong className="text-white">Copiar Flujo JSON</strong> aquí abajo, ve a n8n y presiona <strong className="text-white">Ctrl + V</strong> (o menú superior <strong className="text-white">Import from JSON</strong>).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#08110a] border border-white/[0.08] space-y-2">
              <span className="w-6 h-6 rounded-lg bg-[#00e03c]/20 text-[#00e03c] border border-[#00e03c]/30 font-black flex items-center justify-center text-xs">
                3
              </span>
              <h4 className="font-black text-white">Conecta Google Calendar</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                En el nodo de Google Calendar, haz clic en <strong className="text-white">Connect Credential</strong> con la cuenta de SERAM. El flujo ya tiene agregados los correos de Diego y Fernando.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#08110a] border border-white/[0.08] space-y-2">
              <span className="w-6 h-6 rounded-lg bg-[#00e03c]/20 text-[#00e03c] border border-[#00e03c]/30 font-black flex items-center justify-center text-xs">
                4
              </span>
              <h4 className="font-black text-white">Activa y Pega la URL</h4>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Activa el interruptor verde <strong className="text-white">Active</strong> en n8n, copia la URL del Webhook y pégala en el campo de abajo. ¡Listo!
              </p>
            </div>
          </div>

          {/* Configuración del Webhook & Botón de Prueba en Vivo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#09130b] border border-white/[0.1] space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-[#00e03c]" />
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Conexión Webhook con Docker n8n
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                  Docker SERAM
                </span>
              </div>

              <div>
                <label className="text-slate-200 font-bold block mb-1">
                  URL del Webhook de n8n (del contenedor Docker de SERAM) *
                </label>
                <input
                  type="url"
                  value={syncConfig.n8nWebhookUrl}
                  onChange={e => handleSaveSyncConfig({ ...syncConfig, n8nWebhookUrl: e.target.value })}
                  placeholder="http://localhost:5678/webhook/seram-calendar"
                  className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-[#00e03c]"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Por defecto usa el puerto estándar 5678 de n8n. Puedes cambiarlo por la IP de tu servidor Docker.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Google Calendar Socio A</label>
                  <input
                    type="email"
                    value={syncConfig.socioAEmail}
                    onChange={e => handleSaveSyncConfig({ ...syncConfig, socioAEmail: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-[#00e03c]"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Google Calendar Socio B</label>
                  <input
                    type="email"
                    value={syncConfig.socioBEmail}
                    onChange={e => handleSaveSyncConfig({ ...syncConfig, socioBEmail: e.target.value })}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-[#00e03c]"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  disabled={isTestingN8n}
                  onClick={handleTestN8nConnection}
                  className="px-4 py-2 rounded-xl bg-[#00e03c] hover:bg-white text-slate-950 font-black cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-[#00e03c]/10"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isTestingN8n ? 'Enviando a n8n...' : 'Probar Conexión con Docker n8n'}</span>
                </button>
              </div>

              {/* Registro de eventos despachados */}
              <div className="pt-2 space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Últimos Eventos Enviados al Docker n8n ({syncLogs.length})
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                  {syncLogs.length === 0 ? (
                    <p className="text-[11px] text-slate-500">Sin eventos enviados aún en esta sesión.</p>
                  ) : (
                    syncLogs.map(log => (
                      <div key={log.id} className="p-2 rounded-lg bg-black/50 border border-white/[0.06] flex items-center justify-between text-[10.5px]">
                        <span className="truncate">
                          <strong className="text-white">{log.title}</strong>
                        </span>
                        <span className="text-[9.5px] font-mono text-[#00e03c] shrink-0">{log.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Panel Derecho: Copiar Flujo JSON de n8n listo para usar */}
            <div className="p-5 rounded-2xl bg-[#09130b] border border-white/[0.1] space-y-3 text-xs flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">
                      Flujo Listo para Importar en n8n
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(N8N_WORKFLOW_TEMPLATE);
                      triggerToast?.('Flujo JSON copiado. Pégalo directamente en n8n.', 'success');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-400 text-cyan-300 hover:text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-cyan-500/30"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Flujo JSON de n8n</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Este archivo contiene la configuración completa con los nodos de <strong className="text-white">Webhook</strong> y <strong className="text-white">Google Calendar</strong> para ambos socios. Solo debes copiarlo y pegarlo en n8n.
                </p>

                <pre className="p-3 rounded-xl bg-black/70 border border-white/10 text-[9.5px] font-mono text-emerald-300 overflow-x-auto max-h-[220px] leading-relaxed select-all">
                  {N8N_WORKFLOW_TEMPLATE}
                </pre>
              </div>

              {/* Opción de respaldo con Google Apps Script */}
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between text-[11px]">
                <span className="text-slate-400">¿Prefieres usar Google Apps Script como respaldo?</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(GOOGLE_APPS_SCRIPT_CODE);
                    triggerToast?.('Código de Apps Script copiado al portapapeles', 'success');
                  }}
                  className="text-cyan-300 hover:text-white font-bold underline cursor-pointer"
                >
                  Copiar Script de Google (Code.gs)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════════
          6. MODAL PARA PROGRAMAR CLIENTE / ACTIVIDAD EN EL CALENDARIO (PORTAL)
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
                        <label className="text-slate-400 font-bold block mb-1">Cliente / Entidad (Opcional)</label>
                        <input
                          type="text"
                          value={scheduleForm.clientName}
                          onChange={e => setScheduleForm({ ...scheduleForm, clientName: e.target.value })}
                          placeholder="Ej. GAM Guanay / Minera San Lucas"
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none focus:border-[#00e03c]"
                        />
                      </div>

                      <div>
                        <label className="text-slate-400 font-bold block mb-1">Vincular a Oportunidad CRM</label>
                        <select
                          value={scheduleForm.leadId}
                          onChange={e => {
                            const selectedLead = crmLeads.find(l => l && String(l.id) === e.target.value);
                            setScheduleForm({
                              ...scheduleForm,
                              leadId: e.target.value,
                              clientName: selectedLead ? (selectedLead.empresa || selectedLead.nombre) : scheduleForm.clientName
                            });
                          }}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                        >
                          <option value="">-- Sin vincular a CRM --</option>
                          {crmLeads.map(l => (
                            <option key={l.id} value={l.id}>
                              {l.nombre} ({l.empresa || 'Cliente'})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 font-bold block mb-1">Fecha de Inicio *</label>
                        <input
                          type="date"
                          required
                          value={scheduleForm.startDate}
                          onChange={e => setScheduleForm({ ...scheduleForm, startDate: e.target.value })}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 font-bold block mb-1">Fecha de Entrega / Fin *</label>
                        <input
                          type="date"
                          required
                          value={scheduleForm.dueDate}
                          onChange={e => setScheduleForm({ ...scheduleForm, dueDate: e.target.value })}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white font-mono outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
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
                        <label className="text-slate-400 font-bold block mb-1">Dedicación Estimada (Horas)</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="8.0"
                          value={scheduleForm.estimatedHours}
                          onChange={e => setScheduleForm({ ...scheduleForm, estimatedHours: e.target.value })}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-2.5 py-2 text-[#00e03c] font-mono font-black outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Socio Responsable</label>
                      <select
                        value={scheduleForm.responsible}
                        onChange={e => setScheduleForm({ ...scheduleForm, responsible: e.target.value })}
                        className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white outline-none"
                      >
                        {PARTNERS_CONFIG.map(p => (
                          <option key={p.name} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                      <label className="flex items-center gap-2 text-slate-300 font-bold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={scheduleForm.isGroupBothPartners}
                          onChange={e => setScheduleForm({ ...scheduleForm, isGroupBothPartners: e.target.checked })}
                          className="accent-[#00e03c] w-4 h-4"
                        />
                        <span>Sincronizar en ambos calendarios (Socio A + Socio B)</span>
                      </label>
                    </div>

                    <div>
                      <label className="text-slate-400 font-bold block mb-1.5">Etiquetas Libres</label>
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
                                  ? 'bg-[#00e03c] text-slate-950 font-black border-[#00e03c]'
                                  : 'bg-white/[0.04] text-slate-400 border-white/10 hover:text-white'
                              }`}
                            >
                              {active ? `✓ ${t.name}` : t.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Notas de Coordinación</label>
                      <textarea
                        rows={2}
                        value={scheduleForm.description}
                        onChange={e => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                        placeholder="Objetivo específico a concretar en este bloque de teletrabajo..."
                        className="w-full bg-black/60 border border-white/15 rounded-xl p-2.5 text-white outline-none focus:border-[#00e03c]"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setShowScheduleModal(false)}
                        className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 font-bold hover:bg-white/20 transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-[#00e03c] text-slate-950 font-black hover:bg-white transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4 stroke-[3]" /> Programar en Calendario
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
          7. MODAL DE ENTREGA RÁPIDA EN EL DÍA (TIME TRACKER + CRM + XP)
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
                      className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" /> Cerrar (X)
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-slate-300">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Responsable</span>
                      <strong className="text-white">{selectedEvent.responsible}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Cliente / Oportunidad</span>
                      <strong className="text-cyan-300">{selectedEvent.clientName || 'Interno SERAM'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-mono block">Dedicación Pactada</span>
                      <strong className="text-[#00e03c] font-mono">{selectedEvent.estimatedHours} hrs</strong>
                    </div>
                  </div>

                  <form onSubmit={handleDeliverAndConcreteTask} className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-[#00e03c]/10 border border-[#00e03c]/30 space-y-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#00e03c] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Concretar Entrega en el Día
                      </span>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        Al concretar la entrega, las horas se auditan al instante en el <strong>Time Tracker</strong> para la compensación de honorarios operativos, se publica el acuerdo en el Chatter del CRM y se acreditan <strong>+75 XP</strong> de meritocracia.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 font-bold block mb-1">Horas Reales Invertidas *</label>
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="12.0"
                          required
                          value={deliveryForm.actualHours}
                          onChange={e => setDeliveryForm({ ...deliveryForm, actualHours: e.target.value })}
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-[#00e03c] font-mono font-black outline-none focus:border-[#00e03c]"
                        />
                      </div>
                      <div>
                        <label className="text-slate-300 font-bold block mb-1">Estado</label>
                        <div className="px-3 py-2 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 font-black">
                          Listo para Liquidación (+75 XP)
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-300 font-bold block mb-1">
                        Resultado Alcanzado / Resumen del Acuerdo con el Cliente *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={deliveryForm.outcomeNote}
                        onChange={e => setDeliveryForm({ ...deliveryForm, outcomeNote: e.target.value })}
                        placeholder="Ej. Se llamó al Director de Medio Ambiente de Guanay, se acordó envío de TDRs revisados y reunión de firma de contrato para el viernes."
                        className="w-full bg-black/60 border border-white/15 rounded-xl p-3 text-white outline-none focus:border-[#00e03c]"
                      />
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setSelectedEvent(null)}
                        className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 font-bold cursor-pointer hover:bg-white/20 transition-colors"
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
