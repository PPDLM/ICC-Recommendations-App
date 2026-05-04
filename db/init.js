const mysql = require("mysql2/promise");

async function initDatabase(config) {
  // Connect WITHOUT specifying the database first
  const connection = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    port: config.port,
    ssl: config.ssl
  });

  // 1. Create the database if it doesn't exist
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\`;`);
  
  // 2. Switch to the newly created database
  await connection.query(`USE \`${config.database}\`;`);

  // 3. Create Table with MySQL syntax
  await connection.query(`
    CREATE TABLE IF NOT EXISTS recommendations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(150),
      type ENUM('movie', 'series'),
      genre ENUM('Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Animation'),
      year INT,
      comment TEXT,
      rating INT,
      image_url VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await connection.end();
}

module.exports = initDatabase;