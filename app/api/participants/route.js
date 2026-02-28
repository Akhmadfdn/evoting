import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request) {
    try {
        const admin = await getAdminFromRequest();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const search = searchParams.get('search') || '';

        const where = search
            ? {
                OR: [
                    { name: { contains: search } },
                    { organization: { contains: search } },
                ],
            }
            : {};

        const [participants, total] = await Promise.all([
            prisma.participant.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    vote: {
                        include: { candidate: { select: { name: true } } }
                    }
                }
            }),
            prisma.participant.count({ where }),
        ]);

        return NextResponse.json({ participants, total, page, limit });
    } catch (error) {
        console.error('Get participants error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const admin = await getAdminFromRequest();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, organization } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Nama peserta wajib diisi' }, { status: 400 });
        }

        const qrToken = uuidv4();
        const participant = await prisma.participant.create({
            data: { name, organization: organization || null, qrToken },
        });

        return NextResponse.json(participant, { status: 201 });
    } catch (error) {
        console.error('Create participant error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
