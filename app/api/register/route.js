import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth';

export async function POST(request) {
    try {
        const admin = await getAdminFromRequest();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { token } = await request.json();

        if (!token) {
            return NextResponse.json({ error: 'Token QR wajib diisi' }, { status: 400 });
        }

        const participant = await prisma.participant.findUnique({
            where: { qrToken: token }
        });

        if (!participant) {
            return NextResponse.json({ error: 'QR Code tidak valid. Peserta tidak ditemukan.' }, { status: 404 });
        }

        if (participant.registered) {
            return NextResponse.json({
                error: 'Peserta sudah terdaftar sebelumnya',
                participant: { name: participant.name, organization: participant.organization }
            }, { status: 400 });
        }

        const updated = await prisma.participant.update({
            where: { id: participant.id },
            data: { registered: true },
        });

        return NextResponse.json({
            success: true,
            message: `${updated.name} berhasil didaftarkan!`,
            participant: { name: updated.name, organization: updated.organization }
        });
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
