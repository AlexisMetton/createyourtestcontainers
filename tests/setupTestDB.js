// test/setupTestDB.js
const { PostgreSqlContainer } = require("@testcontainers/postgresql");
const { Pool } = require("pg");
const { setPool } = require("../models/notesModel");
const fs = require("fs");
const path = require("path");

let container;
let pool;

const setupTestDB = async () => {
    container = await new PostgreSqlContainer("postgres:latest")
        .withDatabase(process.env.DB_NAME || "testdb")
        .start();

    // Retrieve the connection URI and pass it to config via an environment variable
    const connectionUri = container.getConnectionUri();
    pool = new Pool({ connectionString: connectionUri });

    // pool test on our model
    setPool(pool);

    // Create table "notes"
    // await pool.query(`
    //     CREATE TABLE IF NOT EXISTS notes (
    //     id SERIAL PRIMARY KEY,
    //     title VARCHAR(255),
    //     content TEXT
    //     );
    // `);

    // Read SQL file and create table
    const sqlPath = path.join(__dirname, "../config/databaseTest.sql");
    const createTableSQL = fs.readFileSync(sqlPath, "utf8");
    await pool.query(createTableSQL);

    return { pool, container };
};

const teardownTestDB = async () => {
    if (pool) await pool.end();
    if (container) await container.stop();
};

module.exports = { setupTestDB, teardownTestDB };
