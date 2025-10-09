import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { updateWorkspace, deleteWorkspace, permanentlyDeleteWorkspace } from '@/lib/queries';

type RouteParams = {
    params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: RouteParams) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const json = await request.json();
        const updated = await updateWorkspace(id, json);
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Failed to update workspace:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const permanent = await searchParams.get('permanent') === 'true';

        if (permanent) {
            await permanentlyDeleteWorkspace(id);
        } else {
            await deleteWorkspace(id);
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete workspace:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}