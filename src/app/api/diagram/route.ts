import { prisma, Prisma } from '@/database';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(await prisma.diagram.findMany({ take: 100 }));
}

interface CreateDiagramRequest extends NextRequest {
  json: () => Promise<Prisma.DiagramCreateInput>;
}

export async function POST(req: CreateDiagramRequest) {
  const diagram = await prisma.diagram.create({ data: await req.json() });
  return NextResponse.json(diagram, {
    status: 201,
  });
}
