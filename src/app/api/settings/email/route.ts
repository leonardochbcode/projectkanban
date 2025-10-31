import { NextResponse } from 'next/server';
import { getEmailSettings, createEmailSettings, updateEmailSettings } from '@/lib/queries';

export async function GET() {
  try {
    const settings = await getEmailSettings();
    if (!settings) {
      return NextResponse.json({ message: 'Email settings not found' }, { status: 404 });
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch email settings:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { host, port, secure, user, password } = body;
    const newSettings = await createEmailSettings({ host, port, secure, user, password });
    return NextResponse.json(newSettings, { status: 201 });
  } catch (error) {
    console.error('Failed to create email settings:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...settings } = body;
    const updatedSettings = await updateEmailSettings(id, settings);
    if (!updatedSettings) {
      return NextResponse.json({ message: 'Email settings not found' }, { status: 404 });
    }
    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Failed to update email settings:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
