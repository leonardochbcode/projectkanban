import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { createReadStream } from 'fs';
import { stat } from 'fs/promises';
import { lookup } from 'mime-types';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const { path } = await params;
  const filePathParts = path;
  if (!filePathParts || filePathParts.length === 0) {
    return NextResponse.json({ message: 'File path is required' }, { status: 400 });
  }

  // Sanitize and construct the file path
  const safePath = join(...filePathParts.map(part => part.replace(/[^a-z0-9_.\-]/gi, '_')));
  const absolutePath = join(process.cwd(), 'public', safePath);

  try {
    // Check if the file exists
    await stat(absolutePath);

    // Create a readable stream
    const stream = createReadStream(absolutePath);

    // Determine the content type
    const mimeType = lookup(absolutePath) || 'application/octet-stream';

    // Return the file as a response
    return new NextResponse(stream as any, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${filePathParts[filePathParts.length - 1]}"`,
      },
    });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ message: 'File not found' }, { status: 404 });
    }
    console.error('File serving error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}