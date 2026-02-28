const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

let connectionString = process.env.DATABASE_URL || 'mariadb://evoting:evoting_pass@db:3306/evoting_db';
connectionString = connectionString.replace(/^mysql:\/\//, 'mariadb://');

const pool = mariadb.createPool(connectionString);
const adapter = new PrismaMariaDb(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Create Admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.admin.upsert({
        where: { username: 'admin' },
        update: { password: hashedPassword },
        create: { username: 'admin', password: hashedPassword },
    });
    console.log('✅ Admin created (admin / admin123)');

    // 2. Create Candidates
    const candidates = [
        {
            name: 'Ahmad Rizky Pratama',
            vision: 'Membangun organisasi pemuda yang inovatif, inklusif, dan berdaya saing tinggi',
            mission: 'Meningkatkan kualitas SDM melalui pelatihan berkala, memperluas jaringan kerjasama antar organisasi, dan mendorong program-program kreatif berbasis teknologi',
            orderNum: 1,
            photo: '',
        },
        {
            name: 'Siti Nurhaliza Putri',
            vision: 'Mewujudkan organisasi pemuda yang transparan, kolaboratif, dan berorientasi pada pemberdayaan masyarakat',
            mission: 'Membangun sistem tata kelola yang terbuka dan akuntabel, menggalakkan program sosial kemasyarakatan, dan menciptakan platform pengembangan bakat pemuda',
            orderNum: 2,
            photo: '',
        },
        {
            name: 'Muhammad Fajar Hidayat',
            vision: 'Organisasi pemuda sebagai garda terdepan perubahan menuju Indonesia emas 2045',
            mission: 'Mengoptimalkan peran pemuda dalam pembangunan daerah, mendorong literasi digital dan kewirausahaan, serta membangun solidaritas antar generasi',
            orderNum: 3,
            photo: '',
        },
    ];

    for (const candidate of candidates) {
        await prisma.candidate.create({ data: candidate });
    }
    console.log('✅ 3 Candidates created');

    // 3. Create Participants
    const participantNames = [
        { name: 'Budi Santoso', org: 'Divisi Humas' },
        { name: 'Dewi Lestari', org: 'Divisi Pendidikan' },
        { name: 'Eko Prasetyo', org: 'Divisi Olahraga' },
        { name: 'Fitri Handayani', org: 'Divisi Sosial' },
        { name: 'Galih Setiawan', org: 'Divisi Teknologi' },
        { name: 'Hana Maulidia', org: 'Divisi Seni' },
        { name: 'Irfan Hakim', org: 'Divisi Humas' },
        { name: 'Jasmine Putri', org: 'Divisi Pendidikan' },
        { name: 'Kevin Anggara', org: 'Divisi Olahraga' },
        { name: 'Laila Sari', org: 'Divisi Sosial' },
        { name: 'Malik Ibrahim', org: 'Divisi Teknologi' },
        { name: 'Nadia Rahma', org: 'Divisi Seni' },
        { name: 'Oscar Pratama', org: 'Divisi Humas' },
        { name: 'Putri Wulandari', org: 'Divisi Pendidikan' },
        { name: 'Rafi Aditya', org: 'Divisi Olahraga' },
        { name: 'Sarah Amelia', org: 'Divisi Sosial' },
        { name: 'Teguh Firmansyah', org: 'Divisi Teknologi' },
        { name: 'Umi Kalsum', org: 'Divisi Seni' },
        { name: 'Vino Bastian', org: 'Divisi Humas' },
        { name: 'Winda Safitri', org: 'Divisi Pendidikan' },
    ];

    const createdParticipants = [];
    for (const p of participantNames) {
        const participant = await prisma.participant.create({
            data: {
                name: p.name,
                organization: p.org,
                qrToken: uuidv4(),
            },
        });
        createdParticipants.push(participant);
    }
    console.log('✅ 20 Participants created');

    // 4. Register first 5 participants
    for (let i = 0; i < 5; i++) {
        await prisma.participant.update({
            where: { id: createdParticipants[i].id },
            data: { registered: true },
        });
    }
    console.log('✅ 5 Participants registered');

    // 5. Create 2 votes for demo statistics
    const allCandidates = await prisma.candidate.findMany({ orderBy: { orderNum: 'asc' } });

    // Participant 1 votes for Candidate 1
    await prisma.vote.create({
        data: {
            participantId: createdParticipants[0].id,
            candidateId: allCandidates[0].id,
        },
    });
    await prisma.participant.update({
        where: { id: createdParticipants[0].id },
        data: { hasVoted: true },
    });

    // Participant 2 votes for Candidate 2
    await prisma.vote.create({
        data: {
            participantId: createdParticipants[1].id,
            candidateId: allCandidates[1].id,
        },
    });
    await prisma.participant.update({
        where: { id: createdParticipants[1].id },
        data: { hasVoted: true },
    });

    console.log('✅ 2 Demo votes created');
    console.log('\n🎉 Seeding complete!');
    console.log('📋 Admin login: admin / admin123');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
