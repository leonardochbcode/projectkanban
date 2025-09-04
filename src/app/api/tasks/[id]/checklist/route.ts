import { NextResponse } from 'next/server';
import { createChecklistItem } from '@/lib/queries';

type RouteParams = {
  params: {
    id: string;
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id: taskId } = await params;
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ message: 'Text is required' }, { status: 400 });
    }

    const newItem = await createChecklistItem(taskId, text);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error(`Failed to create checklist item for task ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
