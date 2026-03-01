import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as mariadb from 'mariadb';

const globalForPrisma = globalThis;

function createPrismaClient() {
    // mariadb driver requires 'mariadb://' prefix, not 'mysql://'
    let connectionString = process.env.DATABASE_URL || 'mariadb://evoting:evoting_pass@db:3306/evoting_db';
    connectionString = connectionString.replace(/localhost/, 'db');
    connectionString = connectionString.replace(/127\.0\.0\.1/, 'db');
    // The original line `connectionString = connectionString.replace(/^mysql:\/\//, 'mariadb://');` is implicitly handled by parsing the URL components.

    const parsedUrl = new URL(connectionString);

    const pool = mariadb.createPool({
        host: parsedUrl.hostname,
        port: parseInt(parsedUrl.port || '3306', 10),
        user: parsedUrl.username,
        password: parsedUrl.password,
        database: parsedUrl.pathname.slice(1),
        connectionLimit: 10
    });
    const adapter = new PrismaMariaDb(pool);
    return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
