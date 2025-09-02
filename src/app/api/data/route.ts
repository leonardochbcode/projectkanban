import { NextResponse } from 'next/server';
import {
  getCompanyInfo,
  getRoles,
  getParticipants,
  getClients,
  getWorkspaces,
  getOpportunities,
  getProjectTemplates,
  getProjects,
  getTasks,
} from '@/lib/queries';

export const dynamic = 'force-dynamic'; // defaults to auto

export async function GET(request: Request) {
  try {
    // Fetch all data in parallel
    const [
      companyInfo,
      roles,
      participants,
      clients,
      workspaces,
      opportunities,
      projectTemplates,
      projects,
      tasks,
    ] = await Promise.all([
      getCompanyInfo(),
      getRoles(),
      getParticipants(),
      getClients(),
      getWorkspaces(),
      getOpportunities(),
      getProjectTemplates(),
      getProjects(),
      getTasks(),
    ]);

    const data = {
      companyInfo,
      roles,
      participants,
      clients,
      workspaces,
      opportunities,
      projectTemplates,
      projects,
      tasks,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
    // In a real app, you'd want more robust error handling
    return NextResponse.json({ error: 'Failed to load data' }, { status: 500 });
  }
}
