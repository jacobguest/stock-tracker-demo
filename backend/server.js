import express from "express";
import fetch from "node-fetch";

const app = express()

const ALPHAVANTAGE_API_BASE_URL = process.env.ALPHAVANTAGE_API_BASE_URL;
const ALPHAVANTAGE_API_KEY = process.env.ALPHAVANTAGE_API_KEY;

app.get("/prices/:symbol/sync/latest", async (req, res) => {
	try {
		const { symbol } = req.params;

		const result = await fetch(
			`${ALPHAVANTAGE_API_BASE_URL}/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHAVANTAGE_API_KEY}`
		);

		if (result.status >= 400) throw new Error(`Request to alphavantage failed: ${result.status}`);

		const data = await result.json();

		const timeSeries = data["Time Series (Daily)"];
		const latestDate = Object.keys(timeSeries)[0];
		const latest = timeSeries[latestDate];

		const tradingDate = new Date(latestDate)
		const open = parseFloat(latest["1. open"]); 
		const high = parseFloat(latest["2. high"]);
		const low = parseFloat(latest["3. low"]);
		const close = parseFloat(latest["4. close"]);
		const volume = parseInt(latest["5. volume"]);

		res.json({ symbol, tradingDate, open, high, low, close, volume });
	}
	catch (err) {
		console.error(err)
		res.status(500).json({ error: "Server Error" })
	}
});


app.listen(3000, () => console.log("API running on 3000"));