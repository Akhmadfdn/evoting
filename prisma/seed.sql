-- E-Voting Database Seed Script
-- Run with: docker compose exec -T db mariadb -u evoting -pevoting_pass evoting_db < prisma/seed.sql

-- 1. Create Admin (username: admin, password: admin123)
INSERT IGNORE INTO Admin (username, password, createdAt)
VALUES ('admin', '$2b$10$rBA2SU15GRpQ9bLbXkdIrulAm6MbjqMXQkIAbf.YJvBfXGVy8e8cq', NOW());

-- 2. Create Candidates
INSERT INTO Candidate (name, photo, vision, mission, orderNum, createdAt) VALUES
('Ahmad Rizky Pratama', '', 'Membangun organisasi pemuda yang inovatif, inklusif, dan berdaya saing tinggi', 'Meningkatkan kualitas SDM melalui pelatihan berkala, memperluas jaringan kerjasama antar organisasi, dan mendorong program-program kreatif berbasis teknologi', 1, NOW()),
('Siti Nurhaliza Putri', '', 'Mewujudkan organisasi pemuda yang transparan, kolaboratif, dan berorientasi pada pemberdayaan masyarakat', 'Membangun sistem tata kelola yang terbuka dan akuntabel, menggalakkan program sosial kemasyarakatan, dan menciptakan platform pengembangan bakat pemuda', 2, NOW()),
('Muhammad Fajar Hidayat', '', 'Organisasi pemuda sebagai garda terdepan perubahan menuju Indonesia emas 2045', 'Mengoptimalkan peran pemuda dalam pembangunan daerah, mendorong literasi digital dan kewirausahaan, serta membangun solidaritas antar generasi', 3, NOW());

-- 3. Create Participants with UUID tokens
INSERT INTO Participant (name, organization, qrToken, registered, hasVoted, createdAt) VALUES
('Budi Santoso', 'Divisi Humas', UUID(), 1, 1, NOW()),
('Dewi Lestari', 'Divisi Pendidikan', UUID(), 1, 1, NOW()),
('Eko Prasetyo', 'Divisi Olahraga', UUID(), 1, 0, NOW()),
('Fitri Handayani', 'Divisi Sosial', UUID(), 1, 0, NOW()),
('Galih Setiawan', 'Divisi Teknologi', UUID(), 1, 0, NOW()),
('Hana Maulidia', 'Divisi Seni', UUID(), 0, 0, NOW()),
('Irfan Hakim', 'Divisi Humas', UUID(), 0, 0, NOW()),
('Jasmine Putri', 'Divisi Pendidikan', UUID(), 0, 0, NOW()),
('Kevin Anggara', 'Divisi Olahraga', UUID(), 0, 0, NOW()),
('Laila Sari', 'Divisi Sosial', UUID(), 0, 0, NOW()),
('Malik Ibrahim', 'Divisi Teknologi', UUID(), 0, 0, NOW()),
('Nadia Rahma', 'Divisi Seni', UUID(), 0, 0, NOW()),
('Oscar Pratama', 'Divisi Humas', UUID(), 0, 0, NOW()),
('Putri Wulandari', 'Divisi Pendidikan', UUID(), 0, 0, NOW()),
('Rafi Aditya', 'Divisi Olahraga', UUID(), 0, 0, NOW()),
('Sarah Amelia', 'Divisi Sosial', UUID(), 0, 0, NOW()),
('Teguh Firmansyah', 'Divisi Teknologi', UUID(), 0, 0, NOW()),
('Umi Kalsum', 'Divisi Seni', UUID(), 0, 0, NOW()),
('Vino Bastian', 'Divisi Humas', UUID(), 0, 0, NOW()),
('Winda Safitri', 'Divisi Pendidikan', UUID(), 0, 0, NOW());

-- 4. Create 2 demo votes (Participant 1 -> Candidate 1, Participant 2 -> Candidate 2)
INSERT INTO Vote (participantId, candidateId, createdAt)
SELECT p.id, c.id, NOW()
FROM (SELECT id FROM Participant ORDER BY id LIMIT 1) p,
     (SELECT id FROM Candidate WHERE orderNum = 1) c;

INSERT INTO Vote (participantId, candidateId, createdAt)
SELECT p.id, c.id, NOW()
FROM (SELECT id FROM Participant ORDER BY id LIMIT 1 OFFSET 1) p,
     (SELECT id FROM Candidate WHERE orderNum = 2) c;

SELECT '✅ Seeding complete!' AS status;
SELECT '📋 Admin login: admin / admin123' AS info;
SELECT CONCAT('👥 ', COUNT(*), ' participants created') AS participants FROM Participant;
SELECT CONCAT('🗳️ ', COUNT(*), ' candidates created') AS candidates FROM Candidate;
SELECT CONCAT('📊 ', COUNT(*), ' demo votes created') AS votes FROM Vote;
