import { NextResponse } from 'next/server';
import { getRoles, createRole } from '@/lib/queries';
import { roleSchema } from '@/lib/schemas';

export async function GET() {
  try {
    const roles = await getRoles();
    return NextResponse.json(roles);
  } catch (error) {
    console.error('Failed to fetch roles:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = roleSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: parsed.error.errors }, { status: 400 });
    }

    const newRole = await createRole(parsed.data);

    return NextResponse.json(newRole, { status: 201 });
  } catch (error) {
    console.error('Failed to create role:', error);
    if (error instanceof Error && error.message.includes('duplicate key value violates unique constraint')) {
        return NextResponse.json({ message: 'A role with this ID already exists.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
