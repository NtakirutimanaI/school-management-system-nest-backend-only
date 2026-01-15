import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

async function changePassword() {
  const newPassword = process.argv[2];
  if (!newPassword) {
    console.error('Please provide a new password as an argument.');
    process.exit(1);
  }

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    await dataSource.initialize();
    console.log(
      `Connected to database. Changing password for user '${process.env.DB_USER}'...`,
    );

    // Execute raw SQL to change password
    await dataSource.query(
      `ALTER USER "${process.env.DB_USER}" WITH PASSWORD '${newPassword}'`,
    );

    console.log(`✅ Password changed successfully to: ${newPassword}`);
    console.log(
      `⚠️  Don't forget to update your .env file with the new password!`,
    );
  } catch (error) {
    console.error('❌ Failed to change password:', error);
  } finally {
    if (dataSource.isInitialized) await dataSource.destroy();
  }
}

changePassword();
