
import { createConnection } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function clearDb() {
    const connection = await createConnection({
        type: 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [path.join(__dirname, '../src/**/*.entity{.ts,.js}')],
        synchronize: false,
    });

    const queryRunner = connection.createQueryRunner();
    await queryRunner.connect();

    const tables = await queryRunner.query(
        `SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`,
    );

    for (const table of tables) {
        await queryRunner.query(`TRUNCATE TABLE "${table.tablename}" CASCADE`);
        console.log(`Truncated ${table.tablename}`);
    }

    await connection.close();
}

clearDb().catch(console.error);
