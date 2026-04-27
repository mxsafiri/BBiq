import { NextRequest, NextResponse } from 'next/server';
import { createAnalysis, getAnalyses } from '@/db/queries';
import type { RoadType } from '@/lib/scoring';

export async function GET() {
  try {
    const analyses = await getAnalyses();
    return NextResponse.json(analyses);
  } catch (err) {
    console.error('[GET /api/analyses]', err);
    return NextResponse.json({ error: 'Failed to fetch analyses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, address, lat, lng, roadType, size, height, angle } = body;

    if (!lat || !lng || !roadType) {
      return NextResponse.json({ error: 'lat, lng, and roadType are required' }, { status: 400 });
    }

    const analysisId = await createAnalysis({
      name:     name || `${parseFloat(lat).toFixed(4)}°, ${parseFloat(lng).toFixed(4)}°`,
      address:  address || '',
      lat:      parseFloat(lat),
      lng:      parseFloat(lng),
      roadType: roadType as RoadType,
      size:     size || '8x4',
      heightM:  parseFloat(height) || 6,
      angle:    angle || 'perpendicular',
    });

    return NextResponse.json({ id: analysisId }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/analyses]', err);
    return NextResponse.json({ error: 'Failed to create analysis' }, { status: 500 });
  }
}
