import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import QRCode from 'qrcode';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const participant = await prisma.participant.findUnique({
            where: { id: parseInt(id) }
        });

        if (!participant) {
            return NextResponse.json({ error: 'Peserta tidak ditemukan' }, { status: 404 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const qrData = `${baseUrl}/vote/${participant.qrToken}`;

        const qrDataUrl = await QRCode.toDataURL(qrData, {
            width: 400,
            margin: 2,
            color: {
                dark: '#1a1a1a',
                light: '#ffffff',
            },
        });

        return NextResponse.json({
            qrCode: qrDataUrl,
            token: participant.qrToken,
            name: participant.name,
            url: qrData,
        });
    } catch (error) {
        console.error('Generate QR error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
