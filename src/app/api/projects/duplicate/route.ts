
import {
    NextResponse
} from 'next/server';
import {
    getServerSession
} from 'next-auth/next';
import {
    authOptions
} from '@/app/api/auth/[...nextauth]/route';
import {
    duplicateProject as duplicateProjectQuery,
} from '@/lib/queries';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({
            error: 'Unauthorized'
        }, {
            status: 401
        });
    }

    try {
        const projectData = await req.json();
        if (!projectData.id) {
            return NextResponse.json({
                error: 'Original project ID is required'
            }, {
                status: 400
            });
        }

        const {
            newProject,
            newTasks
        } = await duplicateProjectQuery(projectData);
        return NextResponse.json({
            newProject,
            newTasks
        });
    } catch (error) {
        console.error('Failed to duplicate project:', error);
        return NextResponse.json({
            error: 'Internal Server Error'
        }, {
            status: 500
        });
    }
}
