const { PostgreSqlContainer } = require("@testcontainers/postgresql");
const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

module.exports = async () => {
    const container = await new PostgreSqlContainer("postgres:latest")
      .withDatabase(process.env.DB_NAME || "testdb")
      .start();

    process.env.DB_USER = container.getUsername();
    process.env.DB_PASSWORD = container.getPassword();
    process.env.DB_HOST = container.getHost();
    process.env.DB_PORT = container.getPort().toString();
    process.env.DB_NAME = container.getDatabase();

    const pool = new Pool({
      connectionString: container.getConnectionUri(),
    });

    const sqlPath = path.join(__dirname, "../config/databaseTest.sql");
    const createTableSQL = fs.readFileSync(sqlPath, "utf8");
    await pool.query(createTableSQL);

    await pool.end();

    global.__POSTGRES_CONTAINER__ = container;
};