import { NextResponse } from 'next/server';
import { getCompanyInfo } from '@/lib/queries';

export async function GET() {
  try {
    const companyInfo = await getCompanyInfo();
    if (!companyInfo) {
      return NextResponse.json({ message: 'Company information not found' }, { status: 404 });
    }
    return NextResponse.json(companyInfo);
  } catch (error) {
    console.error('Failed to fetch company info:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}