import { NextResponse } from 'next/server';
import { getClients, createClient } from '@/lib/queries';
import { clientSchema } from '@/lib/schemas';

export async function GET() {
  try {
    const clients = await getClients();
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = clientSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: parsed.error.errors }, { status: 400 });
    }

    const newClient = await createClient(parsed.data);

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('Failed to create client:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
