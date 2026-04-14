const { Client } = require("pg");

async function initDatabase(config) {
const client = new Client({
  host: config.host,
  user: config.user,
  password: config.password,
  port: config.port,
  database: config.database,
  // DELETE the ssl: { ... } lines here too
});

  await client.connect();

  // Create Custom Types for ENUMs if they don't exist
  await client.query(`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'movie_type') THEN
        CREATE TYPE movie_type AS ENUM ('movie', 'series');
      END IF;
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'genre_type') THEN
        CREATE TYPE genre_type AS ENUM ('Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Animation');
      END IF;
    END $$;
  `);

  // Create Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS recommendations (
      id SERIAL PRIMARY KEY,
      title VARCHAR(150),
      type movie_type,
      genre genre_type,
      year INT,
      comment TEXT,
      rating INT,
      image_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await client.end();
}

module.exports = initDatabase;