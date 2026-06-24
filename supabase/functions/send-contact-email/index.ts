// d:/SERAM/supabase/functions/send-contact-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // CORS Preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const { name, email, subject, message } = await req.json()

    // Validation
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Faltan campos requeridos: name, email y message son obligatorios.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'El correo electrónico no es válido.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`[Send-Contact-Email] Petición recibida de: ${name} <${email}>. Asunto/Empresa: ${subject || 'Sin especificar'}`)

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    let sentInfo = null

    if (resendApiKey) {
      // Envío real con la API de Resend
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: 'SERAM Contact Form <onboarding@resend.dev>', // Resend requiere este remitente verificado para cuentas gratuitas
          to: ['info@seram-srl.com'], // Cambiar al correo oficial de SERAM
          reply_to: email,
          subject: `Contacto SERAM: ${subject || 'Consulta General'} - de ${name}`,
          html: `
            <h3>Nuevo mensaje desde el formulario de contacto de SERAM</h3>
            <p><strong>Nombre:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Asunto/Empresa:</strong> ${subject || 'No provisto'}</p>
            <p><strong>Mensaje:</strong></p>
            <p style="white-space: pre-wrap; background-color: #f4f4f5; padding: 15px; border-radius: 5px;">${message}</p>
          `,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error('[Send-Contact-Email] Error al enviar con Resend:', errText)
        throw new Error(`Resend API error: ${errText}`)
      }

      sentInfo = await res.json()
      console.log('[Send-Contact-Email] Correo enviado exitosamente via Resend:', sentInfo)
    } else {
      console.warn('[Send-Contact-Email] RESEND_API_KEY no definida. Simulando envío de correo.')
      sentInfo = { simulated: true, message: 'Mensaje registrado en los logs del servidor local.' }
    }

    return new Response(
      JSON.stringify({ success: true, info: sentInfo }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('[Send-Contact-Email] Error procesando la solicitud:', error.message)
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
