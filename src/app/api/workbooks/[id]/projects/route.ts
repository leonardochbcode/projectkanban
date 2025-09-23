import { NextResponse } from 'next/server';
import { updateWorkbookProjects } from '@/lib/queries';

type RouteParams = {
  params: Promise<{ id: string }>
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const workbookId = id;
    const { projectsToAdd, projectsToRemove } = await request.json();

    if (!Array.isArray(projectsToAdd) || !Array.isArray(projectsToRemove)) {
      return NextResponse.json({ message: 'projectsToAdd and projectsToRemove must be arrays' }, { status: 400 });
    }

    const result = await updateWorkbookProjects(workbookId, projectsToAdd, projectsToRemove);

    if (!result.success) {
      return NextResponse.json({ message: result.message || 'Failed to update workbook projects' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Workbook projects updated successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Failed to update workbook projects for workbook ${(await params).id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
