import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth';

export async function DELETE(request, { params }) {
    try {
        const admin = await getAdminFromRequest();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const participant = await prisma.participant.findUnique({
            where: { id: parseInt(id) },
            include: { vote: true }
        });

        if (!participant) {
            return NextResponse.json({ error: 'Peserta tidak ditemukan' }, { status: 404 });
        }

        if (participant.hasVoted) {
            return NextResponse.json({ error: 'Tidak bisa menghapus peserta yang sudah voting' }, { status: 400 });
        }

        await prisma.participant.delete({ where: { id: parseInt(id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete participant error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
