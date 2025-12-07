const API_BASE_URL = window.ENV.API_BASE_URL;
const stockSymbol = "AAPL"
const pricesTable = document.getElementById("pricesTable")
const outputMessage = document.getElementById("outputMessage");

async function saveLatestPrice(){
	pricesTable.style.display = "none"
	try {
		const res = await fetch(
			`${API_BASE_URL}/prices/${stockSymbol}/sync/latest`,
			{ method: "POST" }
		);
		
		if (res.status === 201)
			showMessage(`Saved latest price for ${stockSymbol}.`)
		else if (res.status == 200)
			showMessage(`Latest price already saved for: ${stockSymbol}`)
		else
			throw new Error(`Unexpected status: ${res.status}`)
	} 
	catch (err) {
		showMessage(`Error: ${err.message}`);
	}
};

async function viewSavedPrices() {
	try {
		const res = await fetch(`${API_BASE_URL}/prices/${stockSymbol}`);

		if (res.status >= 400) throw new Error(`Request failed: ${res.status}`);

		const savedPrices = await res.json()

		if (!savedPrices.length) {
			showMessage("No saved prices yet.");
			return;
		}
		
		showMessage("Showing all saved prices below...")
		renderPricesTable(savedPrices)
	} 
	catch (err) {
		showMessage(`Error: ${err.message}`);
		pricesTable.style.display = "none"
	}
};

function renderPricesTable(prices) {
    pricesTable.tBodies[0].innerHTML = "";

    prices.forEach(row => {
        const tr = document.createElement("tr");
        [
            new Date(row.trading_date).toLocaleDateString(),
            row.open,
            row.high,
            row.low,
            row.close,
            row.volume
        ].forEach(value => {
            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);
        });
        pricesTable.tBodies[0].appendChild(tr);
    });

    pricesTable.style.display = "inline";
}

function showMessage(message) {
	outputMessage.textContent = message;
}
