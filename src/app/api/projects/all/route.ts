import { NextResponse } from 'next/server';
import { getAllProjects } from '@/lib/queries';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET() {
  noStore();
  try {
    const projects = await getAllProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Failed to fetch all projects:', error);
    return NextResponse.json({ message: 'Failed to fetch all projects' }, { status: 500 });
  }
}