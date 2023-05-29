import { prisma, Prisma } from '@/database';
import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(await prisma.diagram.findMany({ take: 100 }));
}

interface CreateDiagramRequest extends NextApiRequest {
  body: Prisma.DiagramCreateInput;
}

export async function POST(req: CreateDiagramRequest) {
  const diagram = await prisma.diagram.create({ data: req.body });
  return NextResponse.json(diagram, {
    status: 201,
  });
}
