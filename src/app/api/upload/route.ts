import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { stat } from 'fs/promises';

// Helper function to check if a directory exists
async function directoryExists(dirPath: string) {
  try {
    const stats = await stat(dirPath);
    return stats.isDirectory();
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return false; // Directory does not exist
    }
    throw error; // Other errors
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const taskId: string | null = data.get('taskId') as string;

    if (!file || !taskId) {
      return NextResponse.json({ message: 'Missing file or taskId' }, { status: 400 });
    }

    // Sanitize taskId to prevent directory traversal attacks
    const safeTaskId = taskId.replace(/[^a-z0-9_]/gi, '_');

    const uploadDir = join(process.cwd(), 'public', 'uploads', safeTaskId);

    // Create the directory if it doesn't exist
    if (!await directoryExists(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const safeFilename = file.name.replace(/[^a-z0-9_.\-]/gi, '_');
    const filePath = join(uploadDir, safeFilename);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${safeTaskId}/${safeFilename}`;

    return NextResponse.json({ success: true, url: publicUrl }, { status: 201 });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}