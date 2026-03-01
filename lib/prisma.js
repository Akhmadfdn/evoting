import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as mariadb from 'mariadb';

const globalForPrisma = globalThis;

function createPrismaClient() {
    // mariadb driver requires 'mariadb://' prefix, not 'mysql://'
    let connectionString = process.env.DATABASE_URL || 'mariadb://evoting:evoting_pass@db:3306/evoting_db';
    connectionString = connectionString.replace(/localhost/, 'db');
    connectionString = connectionString.replace(/127\.0\.0\.1/, 'db');
    connectionString = connectionString.replace(/^mysql:\/\//, 'mariadb://');
    const pool = mariadb.createPool(connectionString);
    const adapter = new PrismaMariaDb(pool);
    return new PrismaClient({ adapter });
}

const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
