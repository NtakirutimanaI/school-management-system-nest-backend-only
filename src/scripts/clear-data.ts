import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function clearDatabase() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false, // We don't want to sync, just connect
  });

  try {
    await dataSource.initialize();
    console.log('Connected to database. Clearing all data...');

    const entities = await dataSource.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE';
    `);

    // Disable triggers to avoid custom constraints/logic issues during clear?
    // Usually TRUNCATE CASCADE is enough.

    const tableNames = entities.map((e: any) => `"${e.table_name}"`).join(', ');

    if (tableNames.length > 0) {
      console.log(`Truncating tables: ${tableNames}`);
      await dataSource.query(`TRUNCATE TABLE ${tableNames} CASCADE;`);
      console.log('✅ All data cleared successfully. Tables are empty.');
    } else {
      console.log('No tables found to clear.');
    }
  } catch (error) {
    console.error('❌ Failed to clear database:', error);
  } finally {
    if (dataSource.isInitialized) await dataSource.destroy();
  }
}

clearDatabase();
