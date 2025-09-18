import { NextResponse } from 'next/server';
import { createTaskAttachment } from '@/lib/queries';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id: taskId } = await params;
    const body = await request.json();
    const { name, size, type, url } = body;

    if (!name || !size || !type || !url) {
      return NextResponse.json({ message: 'Missing required attachment fields' }, { status: 400 });
    }

    const newAttachment = await createTaskAttachment(taskId, { name, size, type, url });

    return NextResponse.json(newAttachment, { status: 201 });
  } catch (error) {
    console.error(`Failed to create attachment for task ${(await params).id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
