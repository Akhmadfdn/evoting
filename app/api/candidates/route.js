import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAdminFromRequest } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET() {
    try {
        const candidates = await prisma.candidate.findMany({
            orderBy: { orderNum: 'asc' },
            include: {
                _count: {
                    select: { votes: true }
                }
            }
        });
        return NextResponse.json(candidates);
    } catch (error) {
        console.error('Get candidates error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const admin = await getAdminFromRequest();
        if (!admin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const name = formData.get('name');
        const vision = formData.get('vision') || '';
        const mission = formData.get('mission') || '';
        const orderNum = parseInt(formData.get('orderNum') || '0');
        const photo = formData.get('photo');

        if (!name) {
            return NextResponse.json({ error: 'Nama kandidat wajib diisi' }, { status: 400 });
        }

        let photoPath = '';
        if (photo && photo.size > 0) {
            const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'candidates');
            await mkdir(uploadDir, { recursive: true });

            const ext = path.extname(photo.name) || '.jpg';
            const fileName = `candidate_${Date.now()}${ext}`;
            const filePath = path.join(uploadDir, fileName);

            const buffer = Buffer.from(await photo.arrayBuffer());
            await writeFile(filePath, buffer);
            photoPath = `/uploads/candidates/${fileName}`;
        }

        const candidate = await prisma.candidate.create({
            data: { name, photo: photoPath, vision, mission, orderNum },
        });

        return NextResponse.json(candidate, { status: 201 });
    } catch (error) {
        console.error('Create candidate error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
