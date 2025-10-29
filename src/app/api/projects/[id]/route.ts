
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getProjectById, updateProject as updateProjectQuery, deleteProject as deleteProjectQuery } from '@/lib/queries';

type RouteParams = {
    params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, { params }: RouteParams) {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    try {
        const project = await getProjectById(id);
        if (!project) {
            return NextResponse.json({ message: 'Project not found' }, { status: 404 });
        }
        return NextResponse.json(project);
    } catch (error) {
        console.error('Failed to fetch project:', error);
        return NextResponse.json({ message: 'Failed to fetch project' }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const updatedProject = await updateProjectQuery(id, body);
        return NextResponse.json(updatedProject);
    } catch (error) {
        console.error('Failed to update project:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to update project';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const project = await getProjectById(id);

        if (!project) {
            return NextResponse.json({ message: 'Project not found' }, { status: 404 });
        }

        if (project.pmoId !== session.user.id) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        if (project.status !== 'Cancelado') {
            return NextResponse.json({ message: 'Somente projetos cancelados podem ser excluídos' }, { status: 400 });
        }

        await deleteProjectQuery(id);

        return NextResponse.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error('Failed to delete project:', error);
        return NextResponse.json({ message: 'Failed to delete project' }, { status: 500 });
    }
}
