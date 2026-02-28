import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request) {
    try {
        const { token, candidateId } = await request.json();

        if (!token || !candidateId) {
            return NextResponse.json({ error: 'Token dan kandidat wajib diisi' }, { status: 400 });
        }

        const participant = await prisma.participant.findUnique({
            where: { qrToken: token }
        });

        if (!participant) {
            return NextResponse.json({ error: 'QR Code tidak valid' }, { status: 404 });
        }

        if (!participant.registered) {
            return NextResponse.json({ error: 'Peserta belum terdaftar. Silakan registrasi terlebih dahulu.' }, { status: 400 });
        }

        if (participant.hasVoted) {
            return NextResponse.json({ error: 'Peserta sudah melakukan voting sebelumnya' }, { status: 400 });
        }

        const candidate = await prisma.candidate.findUnique({
            where: { id: parseInt(candidateId) }
        });

        if (!candidate) {
            return NextResponse.json({ error: 'Kandidat tidak ditemukan' }, { status: 404 });
        }

        // Create vote and update participant in a transaction
        await prisma.$transaction([
            prisma.vote.create({
                data: {
                    participantId: participant.id,
                    candidateId: candidate.id,
                },
            }),
            prisma.participant.update({
                where: { id: participant.id },
                data: { hasVoted: true },
            }),
        ]);

        return NextResponse.json({
            success: true,
            message: `Terima kasih! Suara Anda untuk ${candidate.name} telah tercatat.`,
            candidate: { name: candidate.name }
        });
    } catch (error) {
        console.error('Vote error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token = searchParams.get('token');

        if (!token) {
            return NextResponse.json({ error: 'Token wajib diisi' }, { status: 400 });
        }

        const participant = await prisma.participant.findUnique({
            where: { qrToken: token }
        });

        if (!participant) {
            return NextResponse.json({ error: 'QR Code tidak valid' }, { status: 404 });
        }

        return NextResponse.json({
            name: participant.name,
            registered: participant.registered,
            hasVoted: participant.hasVoted,
        });
    } catch (error) {
        console.error('Check vote status error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
