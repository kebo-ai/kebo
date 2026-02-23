import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Supabase environment variables are not configured');
  }
  return createClient(url, key);
}

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
}

export async function POST(req: Request) {
  try {
    const { name, email, meta } = await req.json();

    const supabase = getSupabase();

    // Insertamos en Supabase
    const { error: insertError } = await supabase
      .from('landing_waitlist')
      .insert([{
        email,
        name,
        meta
      }]);

    // Si hay error de duplicado (código 23505 en PostgreSQL)
    if (insertError?.code === '23505') {
      return NextResponse.json(
        { error: 'Ya estás en la lista de espera. Pronto recibirás actualizaciones sobre nuestro lanzamiento y las emocionantes novedades que hemos preparado para ti.' },
        { status: 409 } // Código 409 Conflict para recursos duplicados
      );
    }

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    const resend = getResend();

    // Enviamos el email de confirmación
    await resend.emails.send({
      from: 'Majo de Kebo <majo@kebo.app>',
      to: email,
      subject: '¡Tu viaje financiero comienza aquí!',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #6934D2; text-align: center;">¡Te damos la bienvenida a Kebo!</h1>
              <p>Hola ${name || 'Hola!'},</p>
              <p>¡Estamos emocionadas de que te hayas unido a nuestra lista de espera! Tu interés en Kebo es muy valioso para nosotras.</p>
              <p>Pronto recibirás actualizaciones sobre nuestro lanzamiento y las emocionantes novedades que hemos preparado para ti.</p>
              <div style="margin: 30px 0; text-align: center;">
                <p style="color: #666; font-size: 14px;">
                  Conéctate con nosotras en redes sociales para no perderte nada:
                  <br>
                  <a href="https://linktr.ee/kebo_app" style="text-decoration: none;">
                    Visita nuestro Linktree para más información
                  </a>
                </p>
              </div>
              <p>¡Nos vemos pronto!<br>El equipo de Kebo 💜</p>
            </div>
          </body>
        </html>
      `
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
