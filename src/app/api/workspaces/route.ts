import { NextResponse } from 'next/server';
import { createWorkspace, getWorkspaces } from '@/lib/queries';
import { workspaceSchema } from '@/lib/schemas';

export async function GET() {
  try {
    const workspaces = await getWorkspaces();
    return NextResponse.json(workspaces);
  } catch (error) {
    console.error('Failed to fetch workspaces:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = workspaceSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: parsed.error.errors }, { status: 400 });
    }

    const newWorkspace = await createWorkspace(parsed.data);

    return NextResponse.json(newWorkspace, { status: 201 });
  } catch (error) {
    console.error('Failed to create workspace:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
