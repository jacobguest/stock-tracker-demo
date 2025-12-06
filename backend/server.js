import express from "express";
import pkg from "pg";

const PORT = process.env.PORT || 3000 
const app = express()

const { Pool } = pkg;
const pool = new Pool({
    host: process.env.HOST,
	user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE 
});

await pool.query(
	`CREATE TABLE IF NOT EXISTS stock_prices (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
	trading_date DATE NOT NULL,

	open NUMERIC(12,4),
    high NUMERIC(12,4),
    low NUMERIC(12,4),
    close NUMERIC(12,4),
    volume BIGINT,

	UNIQUE(symbol, trading_date)
);`
)

const ALPHAVANTAGE_API_BASE_URL = process.env.ALPHAVANTAGE_API_BASE_URL;
const ALPHAVANTAGE_API_KEY = process.env.ALPHAVANTAGE_API_KEY;

app.post("/prices/:symbol/sync/latest", async (req, res) => {
	try {
		const { symbol } = req.params;

		const result = await fetch(`${ALPHAVANTAGE_API_BASE_URL}/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHAVANTAGE_API_KEY}`);
    	if (result.status >= 400) throw new Error(`Request to alphavantage failed: ${result.status}`);
    	const data = await result.json();

		const timeSeries = data["Time Series (Daily)"];
		
		if (!timeSeries) {
			return res.status(404).json({ error: "No market data found" });
		}

		const latestDate = Object.keys(timeSeries)[0];
		const latest = timeSeries[latestDate];

		const tradingDate = new Date(latestDate)
		const open = latest["1. open"];
		const high = latest["2. high"];
		const low = latest["3. low"];
		const close = latest["4. close"];
		const volume = parseInt(latest["5. volume"]);

		await pool.query(
			`INSERT INTO stock_prices 
			(symbol, trading_date, open, high, low, close, volume)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
			ON CONFLICT (symbol, trading_date) DO NOTHING`,
			[symbol, tradingDate, open, high, low, close, volume]
		);

    	res.json({ symbol, tradingDate, open, high, low, close, volume });
	}
	catch (err) {
		console.error(err)
		res.status(500).json({ error: "Server Error" })
	}
});


app.get("/prices/:symbol", async (req, res) => {
	try {
		const { symbol } = req.params;

		const result = await pool.query(
			"SELECT * FROM stock_prices WHERE symbol = $1 ORDER BY trading_date DESC",
			[symbol]
		);

		res.json(result.rows);
	} 
	catch (err) {
		console.error(err)
		res.status(500).json({ error: "Server Error" })
	}
});


app.listen(PORT, () => console.log(`API running on ${PORT}`));