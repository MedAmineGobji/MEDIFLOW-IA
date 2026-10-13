const { drizzle } = require('drizzle-orm/postgres-js');
const postgres = require('postgres');
require('dotenv').config({ path: './backend/.env' });

async function checkTables() {
  let client;
  try {
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL not found in .env');
      return;
    }

    client = postgres(process.env.DATABASE_URL);
    const db = drizzle(client);

    // Check if cv_analyses table exists
    const result = await client`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'cv_analyses'
    `;

    if (result.length > 0) {
      console.log('✅ cv_analyses table exists');

      // Check if there are any records
      const countResult = await client`SELECT COUNT(*) as count FROM cv_analyses`;
      console.log(`📊 Records in cv_analyses: ${countResult[0].count}`);

      if (countResult[0].count > 0) {
        // Show recent records
        const recent = await client`SELECT id, application_id, score, recommandation, created_at FROM cv_analyses ORDER BY created_at DESC LIMIT 5`;
        console.log('📋 Recent CV analyses:');
        recent.forEach(row => {
          console.log(`  ID: ${row.id}, App: ${row.application_id}, Score: ${row.score}, Rec: ${row.recommandation}, Date: ${row.created_at}`);
        });
      }
    } else {
      console.log('❌ cv_analyses table does not exist');

      // Try to create it
      console.log('🔧 Creating cv_analyses table...');
      await client`
        CREATE TABLE IF NOT EXISTS cv_analyses (
          id SERIAL PRIMARY KEY,
          application_id INTEGER REFERENCES job_applications(id),
          score INTEGER NOT NULL,
          recommandation TEXT NOT NULL,
          points_forts TEXT[],
          lacunes TEXT[],
          competences TEXT[],
          analyse_detaillee TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )
      `;
      console.log('✅ cv_analyses table created');
    }

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    if (client) await client.end();
  }
}

checkTables();
