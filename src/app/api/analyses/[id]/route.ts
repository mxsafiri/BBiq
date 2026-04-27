import { NextRequest, NextResponse } from 'next/server';
import { getAnalysisById } from '@/db/queries';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const analysis = await getAnalysisById(id);
    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }
    return NextResponse.json(analysis);
  } catch (err) {
    console.error('[GET /api/analyses/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch analysis' }, { status: 500 });
  }
}
