import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

// Check if environment variables are defined
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req: Request) {
  try {
    const { email, subject, message } = await req.json();

    if (!email || !message) {
      return NextResponse.json(
        { error: 'Necesitamos tu email y mensaje para poder responderte 😊' },
        { status: 400 }
      );
    }

    // Try to store feedback in Supabase
    try {
      const { data, error: insertError } = await supabase
        .from('app_feedback')
        .insert([{ 
          email,
          subject: subject || 'Sin asunto',
          message,
          created_at: new Date().toISOString()
        }])
        .select();

      if (insertError) {
        console.error('Supabase error details:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        });

        // If the error is related to the table not existing, return a specific error
        if (insertError.code === '42P01') {
          return NextResponse.json(
            { error: 'Error de configuración: Tabla no encontrada' },
            { status: 500 }
          );
        }

        throw insertError;
      }

      console.log('Feedback stored successfully:', data);
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      // Continue with email sending even if database storage fails
    }

    // Send email notification to team
    try {
      await resend.emails.send({
        from: 'Kebo <hola@kebo.app>',
        to: 'hola@kebo.app',
        subject: `💌 Nuevo mensaje de ${email}`,
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #6934D2;">¡Tenemos un nuevo mensaje!</h2>
                
                <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #6934D2; background-color: #f8f9fa;">
                  <p><strong>De:</strong> ${email}</p>
                  <p><strong>Asunto:</strong> ${subject || 'Sin asunto'}</p>
                </div>

                <div style="margin: 20px 0;">
                  <p style="white-space: pre-wrap;">${message}</p>
                </div>

                <p style="color: #666; font-size: 14px;">
                  Recuerda responder pronto para mantener una buena comunicación con nuestros usuarios 💜
                </p>
              </div>
            </body>
          </html>
        `
      });

      // Send confirmation email to user
      await resend.emails.send({
        from: 'Kebo <hola@kebo.app>',
        to: email,
        subject: '¡Hemos recibido tu mensaje! 💜',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #6934D2; text-align: center;">¡Gracias por escribirnos! 💌</h1>
                
                <p>¡Hola!</p>
                
                <p>Queríamos confirmarte que hemos recibido tu mensaje. Nuestro equipo lo leerá pronto y te responderemos lo antes posible.</p>
                
                <div style="margin: 30px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
                  <p style="margin: 0; color: #666;">Tu mensaje:</p>
                  <p style="margin: 10px 0 0 0; font-style: italic;">${message}</p>
                </div>
                
                <p>Mientras tanto, ¿qué tal si nos sigues en redes sociales? ¡Compartimos contenido interesante sobre finanzas personales y novedades de Kebo!</p>
                
                <p style="text-align: center;">
                  <a href="https://linktr.ee/kebo_app" style="display: inline-block; margin-top: 10px; padding: 10px 20px; background-color: #6934D2; color: white; text-decoration: none; border-radius: 5px;">
                    Síguenos en redes sociales
                  </a>
                </p>
                
                <p>¡Que tengas un excelente día!<br>El equipo de Kebo 💜</p>
              </div>
            </body>
          </html>
        `
      });

      return NextResponse.json({ success: true });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return NextResponse.json(
        { error: 'Error al enviar los correos de confirmación' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('General error:', error);
    return NextResponse.json(
      { error: '¡Ups! Algo salió mal. ¿Podrías intentarlo de nuevo?' },
      { status: 500 }
    );
  }
} 