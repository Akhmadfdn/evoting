import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
    try {
        const [candidates, totalParticipants, registeredCount, votedCount] = await Promise.all([
            prisma.candidate.findMany({
                orderBy: { orderNum: 'asc' },
                select: {
                    id: true,
                    name: true,
                    photo: true,
                    orderNum: true,
                    _count: {
                        select: { votes: true }
                    }
                }
            }),
            prisma.participant.count(),
            prisma.participant.count({ where: { registered: true } }),
            prisma.participant.count({ where: { hasVoted: true } }),
        ]);

        const totalVotes = candidates.reduce((sum, c) => sum + c._count.votes, 0);

        const results = candidates.map((c, index) => ({
            id: c.id,
            name: c.name,
            photo: c.photo,
            number: c.orderNum || index + 1,
            votes: c._count.votes,
            percentage: totalVotes > 0 ? ((c._count.votes / totalVotes) * 100).toFixed(1) : '0.0',
        }));

        return NextResponse.json({
            candidates: results,
            summary: {
                totalParticipants,
                registeredCount,
                votedCount,
                totalVotes,
                notVotedYet: registeredCount - votedCount,
            }
        });
    } catch (error) {
        console.error('Statistics error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
