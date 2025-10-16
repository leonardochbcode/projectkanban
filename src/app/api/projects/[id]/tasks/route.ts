import { NextResponse } from 'next/server';
import { getTasksByProjectId } from '@/lib/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(
  request: Request, { params }: RouteParams
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: projectId } = await params;

  if (!projectId) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  try {
    const tasks = await getTasksByProjectId(projectId);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error(`Failed to fetch tasks for project ${projectId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}