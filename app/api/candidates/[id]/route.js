import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth';
import { writeFile, mkdir, unlink } from 'fs/promises';
import path from 'path';

export async function PUT(request, { params }) {
    try {
        const admin = await getAdminFromRequest();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const formData = await request.formData();
        const name = formData.get('name');
        const vision = formData.get('vision') || '';
        const mission = formData.get('mission') || '';
        const orderNum = parseInt(formData.get('orderNum') || '0');
        const photo = formData.get('photo');

        const updateData = { name, vision, mission, orderNum };

        if (photo && photo.size > 0) {
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'candidates');
            await mkdir(uploadDir, { recursive: true });

            const ext = path.extname(photo.name) || '.jpg';
            const fileName = `candidate_${Date.now()}${ext}`;
            const filePath = path.join(uploadDir, fileName);

            const buffer = Buffer.from(await photo.arrayBuffer());
            await writeFile(filePath, buffer);
            updateData.photo = `/uploads/candidates/${fileName}`;
        }

        const candidate = await prisma.candidate.update({
            where: { id: parseInt(id) },
            data: updateData,
        });

        return NextResponse.json(candidate);
    } catch (error) {
        console.error('Update candidate error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const admin = await getAdminFromRequest();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Check for existing votes
        const voteCount = await prisma.vote.count({
            where: { candidateId: parseInt(id) }
        });

        if (voteCount > 0) {
            return NextResponse.json({
                error: 'Tidak bisa menghapus kandidat yang sudah memiliki suara'
            }, { status: 400 });
        }

        // Delete old photo
        const candidate = await prisma.candidate.findUnique({ where: { id: parseInt(id) } });
        if (candidate?.photo) {
            try {
                await unlink(path.join(process.cwd(), 'public', candidate.photo));
            } catch { }
        }

        await prisma.candidate.delete({ where: { id: parseInt(id) } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete candidate error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
