const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://distrinov:distrinov_dev@localhost:5432/distrinov'
});

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Initialiser live_state
    await pool.query(
      \INSERT INTO live_state (id, data) VALUES (\, \)
       ON CONFLICT (id) DO NOTHING\,
      [
        'current',
        JSON.stringify({
          part: 1,
          slide: 'welcome',
          timer: null,
          kanbios: false
        })
      ]
    );

    console.log('✅ Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
