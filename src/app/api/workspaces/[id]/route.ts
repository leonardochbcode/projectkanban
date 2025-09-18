import { NextResponse } from 'next/server';
import { updateWorkspace, deleteWorkspace, getWorkspaceById } from '@/lib/queries';
import { partialWorkspaceSchema } from '@/lib/schemas';

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const workspace = await getWorkspaceById(id);

    if (!workspace) {
      return NextResponse.json({ message: 'Workspace not found' }, { status: 404 });
    }

    return NextResponse.json(workspace);
  } catch (error) {
    console.error(`Failed to fetch workspace ${(await params).id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const json = await request.json();
    const parsed = partialWorkspaceSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: parsed.error.errors }, { status: 400 });
    }

    const updatedWorkspace = await updateWorkspace(id, parsed.data);

    if (!updatedWorkspace) {
      return NextResponse.json({ message: 'Workspace not found' }, { status: 404 });
    }

    return NextResponse.json(updatedWorkspace);
  } catch (error) {
    console.error(`Failed to update workspace ${(await params).id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await deleteWorkspace(id);

    if (!result.success) {
      return NextResponse.json({ message: 'Workspace not found or could not be deleted' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`Failed to delete workspace ${(await params).id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
