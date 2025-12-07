const API_BASE_URL = window.ENV.API_BASE_URL;
const stockSymbol = "AAPL"
const pricesTable = document.getElementById("pricesTable")
const outputMessage = document.getElementById("outputMessage");

async function saveLatestPrice(){
	try {
		const latestPrice = await fetchData(
			`${API_BASE_URL}/prices/${stockSymbol}/sync/latest`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" }
			}
		);
		
		if (latestPrice.inserted) {
			showMessage("Saved latest price. Displaying it below...")
		}
		else {
			showMessage("Latest price already saved. Displaying it below...")
		}
		
		renderPricesTable([latestPrice.data])
	} 
	catch (err) {
		showMessage(`Error: ${err.message}`);
		pricesTable.style.display = "none"
	}
};

async function viewSavedPrices() {
	try {
		const savedPrices = await fetchData(`${API_BASE_URL}/prices/${stockSymbol}`);

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

async function fetchData(url, options = {}) {
    const res = await fetch(url, options);
    if (res.status >= 400) throw new Error(`Request failed: ${res.status}`);
    return res.json();
}

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
