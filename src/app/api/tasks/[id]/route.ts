import { NextResponse } from 'next/server';
import { updateTask, deleteTask, getTaskById } from '@/lib/queries';
import { partialTaskSchema } from '@/lib/schemas';

type RouteParams = {
  params: {
    id: string;
  }
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const task = await getTaskById(id);

    if (!task) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error(`Failed to fetch task ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const json = await request.json();
    const parsed = partialTaskSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: parsed.error.errors }, { status: 400 });
    }

    const updatedTask = await updateTask(id, parsed.data);

    if (!updatedTask) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(`Failed to update task ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const result = await deleteTask(id);

    if (!result.success) {
      return NextResponse.json({ message: 'Task not found or could not be deleted' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`Failed to delete task ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
