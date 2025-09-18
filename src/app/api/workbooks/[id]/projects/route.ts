import { NextResponse } from 'next/server';
import { addProjectToWorkbook, removeProjectFromWorkbook } from '@/lib/queries';

type RouteParams = {
  params: {
    id: string; // workbookId
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const workbookId = params.id;
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json({ message: 'projectId is required' }, { status: 400 });
    }

    const result = await addProjectToWorkbook(workbookId, projectId);

    if (!result.success) {
        // This could be because the project or workbook doesn't exist, or the association already exists.
        // A more specific error message might be helpful in a real app.
        return NextResponse.json({ message: 'Failed to add project to workbook' }, { status: 400 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to add project to workbook ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const workbookId = params.id;
    const { projectId } = await request.json();

    if (!projectId) {
      return NextResponse.json({ message: 'projectId is required' }, { status: 400 });
    }

    const result = await removeProjectFromWorkbook(workbookId, projectId);

    if (!result.success) {
      return NextResponse.json({ message: 'Failed to remove project from workbook' }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Failed to remove project from workbook ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
