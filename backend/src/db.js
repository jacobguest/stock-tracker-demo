const { Pool } = require("pg");

const createPool = () => new Pool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
});

const initDb = async (pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS stock_prices (
      id SERIAL PRIMARY KEY,
      symbol VARCHAR(10) NOT NULL,
      trading_date DATE NOT NULL,
      open NUMERIC(12,4),
      high NUMERIC(12,4),
      low NUMERIC(12,4),
      close NUMERIC(12,4),
      volume BIGINT,
      UNIQUE(symbol, trading_date)
    );
  `);
};

module.exports = { createPool, initDb };
