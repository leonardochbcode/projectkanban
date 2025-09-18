import { NextResponse } from 'next/server';
import { updateProject, deleteProject, getProjectById } from '@/lib/queries';
import { partialProjectSchema } from '@/lib/schemas';

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const project = await getProjectById(id);

    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    console.error(`Failed to fetch project ${(await params).id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const json = await request.json();
    const parsed = partialProjectSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: parsed.error.errors }, { status: 400 });
    }

    const updatedProject = await updateProject(id, parsed.data);

    if (!updatedProject) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    console.error(`Failed to update project ${(await params).id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const result = await deleteProject(id);

    if (!result.success) {
      return NextResponse.json({ message: 'Project not found or could not be deleted' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 }); // No Content
  } catch (error) {
    console.error(`Failed to delete project ${(await params).id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
