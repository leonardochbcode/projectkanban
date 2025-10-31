import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getEmailSettings } from '@/lib/queries';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { to } = body;

    const settings = await getEmailSettings();
    if (!settings) {
      return NextResponse.json({ message: 'Email settings not found' }, { status: 404 });
    }

    const transporter = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: {
        user: settings.user,
        pass: settings.password,
      },
    });

    await transporter.sendMail({
      from: `"${settings.user}" <${settings.user}>`,
      to,
      subject: 'Teste de Conexão SMTP',
      text: 'Este é um email de teste para verificar a conexão SMTP.',
      html: '<b>Este é um email de teste para verificar a conexão SMTP.</b>',
    });

    return NextResponse.json({ message: 'Email de teste enviado com sucesso!' });
  } catch (error) {
    console.error('Failed to send test email:', error);
    return NextResponse.json({ message: 'Failed to send test email', error: error.message }, { status: 500 });
  }
}
