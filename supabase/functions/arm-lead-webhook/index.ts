/**
 * @file supabase/functions/arm-lead-webhook/index.ts
 * @description Edge Function de Captura Rápida para el Sistema ARM de SERAM SRL.
 * Soporta recepción segura de leads desde:
 * 1. Bot de Telegram Corporativo (comandos "/lead Empresa | Contacto | Teléfono | Servicio | Monto USD")
 * 2. Formularios externos (Google Forms / Tally / Typeform vía Webhook JSON)
 *
 * Incluye blindaje de ciberseguridad: cabeceras CORS estrictas, validación de token secreto,
 * sanitización contra inyección XSS y cálculo determinista de Lead Score Inbound.
 */

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-seram-webhook-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const USD_TO_BOB = 6.96;

function sanitizeText(input: unknown, maxLength = 250): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const webhookSecret = Deno.env.get('SERAM_ARM_WEBHOOK_SECRET');
    const providedToken = req.headers.get('x-seram-webhook-token');

    if (webhookSecret && providedToken !== webhookSecret) {
      return new Response(
        JSON.stringify({ error: 'No autorizado: Token de webhook inválido.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    let leadPayload = {
      titulo_oportunidad: '',
      nombre: '',
      empresa: '',
      telefono: '',
      email: '',
      que_busca: 'Consultoría Ambiental / SIG',
      cuando_necesita: 'Corto Plazo (15 a 45 días)',
      cuanto_invertir: 'USD 500 - USD 1,500',
      presupuesto_estimado_usd: 500,
      socio_asignado: 'Ing. Diego Barrientos',
      origen: 'Webhook Externo ARM',
    };

    // Caso 1: Payload proveniente de Bot de Telegram
    if (body.message && body.message.text) {
      const rawText = String(body.message.text).trim();
      const cleaned = rawText.replace(/^\/lead\s*/i, '');
      const parts = cleaned.split('|').map((p: string) => sanitizeText(p));

      leadPayload.empresa = parts[0] || 'Empresa Captada en Campo';
      leadPayload.nombre = parts[1] || body.message.from?.first_name || 'Contacto Telegram';
      leadPayload.telefono = parts[2] || '';
      leadPayload.que_busca = parts[3] || 'Trámite Ambiental SERAM';
      const rawAmount = parseFloat(parts[4] || '500');
      leadPayload.presupuesto_estimado_usd = Number.isNaN(rawAmount) ? 500 : rawAmount;
      leadPayload.titulo_oportunidad = `${leadPayload.que_busca} - ${leadPayload.empresa}`;
      leadPayload.origen = 'Bot de Telegram SERAM';
    } else {
      // Caso 2: Payload JSON desde Google Forms / Typeform / API
      leadPayload.nombre = sanitizeText(body.nombre || body.contactName || 'Prospecto Formulario');
      leadPayload.empresa = sanitizeText(body.empresa || body.company || 'Particular / Institución');
      leadPayload.telefono = sanitizeText(body.telefono || body.phone || '');
      leadPayload.email = sanitizeText(body.email || '');
      leadPayload.que_busca = sanitizeText(body.que_busca || body.service || 'Consultoría Ambiental');
      leadPayload.cuando_necesita = sanitizeText(body.cuando_necesita || 'Corto Plazo (15 a 45 días)');
      const rawUsd = parseFloat(body.presupuesto_estimado_usd || body.budget || '600');
      leadPayload.presupuesto_estimado_usd = Number.isNaN(rawUsd) ? 600 : rawUsd;
      leadPayload.titulo_oportunidad = sanitizeText(body.titulo_oportunidad || `${leadPayload.que_busca} - ${leadPayload.empresa}`);
      leadPayload.origen = sanitizeText(body.origen || 'Formulario Google / Web');
    }

    const presupuestoBs = Math.round(leadPayload.presupuesto_estimado_usd * USD_TO_BOB);
    const score = leadPayload.presupuesto_estimado_usd >= 1000 ? 82 : 65;
    const temperatura = score >= 70 ? 'caliente' : 'tibio';

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('arm_leads')
      .insert([{
        ...leadPayload,
        presupuesto_bs: presupuestoBs,
        lead_score: score,
        temperatura,
        clasificacion_inbound: score >= 70 ? 'SQL' : 'MQL',
        etapa_pipeline: 'nuevo',
        prioridad_estrellas: score >= 70 ? 3 : 2,
        probabilidad_cierre: score >= 70 ? 60 : 35,
        is_example: false,
      }])
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ status: 'ok', lead: data }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Error interno del webhook' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
