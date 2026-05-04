require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const initDatabase = require("./db/init");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
};

let pool;

async function setup() {
  await initDatabase(dbConfig);
  pool = mysql.createPool(dbConfig);
}

app.get("/api/recommendations", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM recommendations ORDER BY created_at DESC");
    res.json(rows);
  } catch (err) {
    console.error("❌ GET ERROR:", err.message);
    res.status(500).json([]);
  }
});

app.post("/api/recommendations", async (req, res) => {
  console.log("📥 Received POST request with data:", req.body);
  const { title, type, genre, year, comment, rating, image_url } = req.body;
  try {
    await pool.query(
      `INSERT INTO recommendations (title, type, genre, year, comment, rating, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, type, genre, year, comment, rating, image_url]
    );
    console.log("✅ Successfully inserted into DB");
    res.status(201).json({ message: "Created" });
  } catch (err) {
    console.error("❌ DATABASE INSERT ERROR:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = { app, setup };