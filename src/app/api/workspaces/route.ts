import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createWorkspace, getWorkspaces, getAllActiveWorkspaces } from '@/lib/queries';
import { workspaceSchema } from '@/lib/schemas';

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    if (pageParam && limitParam) {
      const page = parseInt(pageParam, 10);
      const limit = parseInt(limitParam, 10);
      const { workspaces, total } = await getWorkspaces(session.user.id, page, limit);
      return NextResponse.json({ workspaces, total });
    } else {
      const workspaces = await getAllActiveWorkspaces(session.user.id);
      return NextResponse.json(workspaces);
    }
  } catch (error) {
    console.error('Failed to fetch workspaces:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = await workspaceSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: parsed.error.errors }, { status: 400 });
    }

    const workspaceData = {
      ...parsed.data,
      responsibleId: session.user.id,
    };

    const newWorkspace = await createWorkspace(workspaceData);

    return NextResponse.json(newWorkspace, { status: 201 });
  } catch (error) {
    console.error('Failed to create workspace:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
