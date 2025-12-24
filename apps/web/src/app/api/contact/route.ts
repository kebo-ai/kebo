import { NextResponse } from 'next/server';
import { Resend } from 'resend';

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
}

export async function POST(req: Request) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!email || !message) {
      return NextResponse.json(
        { error: 'Email y mensaje son requeridos' },
        { status: 400 }
      );
    }

    const resend = getResend();

    // Send email notification
    await resend.emails.send({
      from: 'Kebo Contact Form <contacto@kebo.app>',
      to: 'hola@kebo.app',
      subject: `Nuevo mensaje de contacto: ${subject || 'Sin asunto'}`,
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #6934D2;">Nuevo mensaje de contacto</h2>
              
              <div style="margin: 20px 0; padding: 15px; border-left: 4px solid #6934D2; background-color: #f8f9fa;">
                <p><strong>Nombre:</strong> ${name || 'No proporcionado'}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Asunto:</strong> ${subject || 'Sin asunto'}</p>
              </div>

              <div style="margin: 20px 0;">
                <h3 style="color: #5B297F;">Mensaje:</h3>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
            </div>
          </body>
        </html>
      `
    });

    // Send confirmation email to the user
    await resend.emails.send({
      from: 'Kebo <hola@kebo.app>',
      to: email,
      subject: 'Hemos recibido tu mensaje',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #6934D2; text-align: center;">¡Gracias por contactarnos!</h1>
              
              <p>Hola ${name || ''},</p>
              
              <p>Hemos recibido tu mensaje y te responderemos lo antes posible.</p>
              
              <div style="margin: 30px 0; padding: 15px; border-left: 4px solid #6934D2; background-color: #f8f9fa;">
                <p><strong>Asunto:</strong> ${subject || 'Sin asunto'}</p>
                <p><strong>Tu mensaje:</strong></p>
                <p style="white-space: pre-wrap;">${message}</p>
              </div>
              
              <p>Mientras tanto, puedes seguirnos en nuestras redes sociales para mantenerte actualizado:</p>
              <p style="text-align: center;">
                <a href="https://linktr.ee/kebo_app" style="color: #6934D2; text-decoration: none;">
                  Visita nuestro Linktree para más información
                </a>
              </p>
              
              <p>¡Que tengas un excelente día!<br>El equipo de Kebo 💜</p>
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