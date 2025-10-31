import nodemailer from 'nodemailer';
import { getEmailSettings } from './queries';

export async function sendEmail(to: string, subject: string, html: string) {
    const emailSettings = await getEmailSettings();

    if (!emailSettings) {
        console.error('Email settings not found, skipping email send.');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: emailSettings.host,
        port: emailSettings.port,
        secure: emailSettings.secure,
        auth: {
            user: emailSettings.user,
            pass: emailSettings.password,
        },
    });

    try {
        await transporter.sendMail({
            from: `"${emailSettings.user}" <${emailSettings.user}>`,
            to,
            subject,
            html,
        });
        console.log(`Email sent to ${to} with subject "${subject}"`);
    } catch (error) {
        console.error('Failed to send email:', error);
    }
}
