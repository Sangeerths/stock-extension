document.addEventListener('DOMContentLoaded', function() {
    displayComparisonData();
    document.getElementById('saveComparison').addEventListener('click', saveComparisonDataToCSV);
    document.getElementById('backButton').addEventListener('click', function() {
        window.location.href = 'popup.html';
    });
});

function displayComparisonData() {
    const compareList = JSON.parse(localStorage.getItem('compareList')) || [];
    const comparisonContainer = document.getElementById('comparisonContainer');
    comparisonContainer.innerHTML = '';

    if (compareList.length === 0) {
        comparisonContainer.innerHTML = '<p>No stocks added for comparison.</p>';
        return;
    }

    compareList.forEach(symbol => {
        fetchStockOverview(symbol).then(data => {
            if (data) {
                const stockDiv = document.createElement('div');
                stockDiv.innerHTML = `
                    <h2>${symbol}</h2>
                    <p><strong>Current Price:</strong> &#8377${data.price.toFixed(2)}</p>
                    <p><strong>Market Capitalization:</strong> ${data.marketCap}</p>
                    <p><strong>EBITDA:</strong> ${data.ebitda}</p>
                    <p><strong>Dividend per Share:</strong> ${data.dividendPerShare}</p>
                    <p><strong>PE Ratio:</strong> ${data.peRatio}</p>
                    <p><strong>Date:</strong> ${data.date}</p>
                    <button class="removeButton" data-symbol="${symbol}">Remove</button>
                `;
                comparisonContainer.appendChild(stockDiv);
            }
        }).catch(error => {
            console.error(`Error fetching data for ${symbol}:`, error);
        });
    });

    comparisonContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('removeButton')) {
            const symbol = event.target.getAttribute('data-symbol');
            removeStockFromComparison(symbol);
        }
    });
}

function fetchStockOverview(symbol) {
    const apiKey = '7Q99NBNB55I38GK0'; // Replace with your actual Alpha Vantage API key
    const urlQuote = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;
    const urlOverview = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=${apiKey}`;

    return Promise.all([fetch(urlQuote), fetch(urlOverview)])
        .then(responses => Promise.all(responses.map(response => response.json())))
        .then(([quoteData, overviewData]) => {
            if (quoteData && quoteData['Global Quote'] && quoteData['Global Quote']['05. price'] &&
                overviewData && overviewData.MarketCapitalization && overviewData.EBITDA && overviewData.DividendPerShare && overviewData.PERatio) {
                const price = parseFloat(quoteData['Global Quote']['05. price']);
                const priceInINR = price * 74.50; // Replace with the appropriate exchange rate
                const date = new Date().toLocaleString();
                return {
                    symbol,
                    price: priceInINR,
                    marketCap: overviewData.MarketCapitalization,
                    ebitda: overviewData.EBITDA,
                    dividendPerShare: overviewData.DividendPerShare,
                    peRatio: overviewData.PERatio,
                    date
                };
            } else {
                throw new Error('Required data not available');
            }
        });
}

function saveComparisonDataToCSV() {
    const compareList = JSON.parse(localStorage.getItem('compareList')) || [];
    if (compareList.length === 0) {
        alert('No data to save.');
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Symbol,Price,Market Capitalization,EBITDA,Dividend per Share,PE Ratio,Date\n";

    compareList.forEach(symbol => {
        fetchStockOverview(symbol).then(data => {
            if (data) {
                csvContent += `${data.symbol},${data.price.toFixed(2)},${data.marketCap},${data.ebitda},${data.dividendPerShare},${data.peRatio},${data.date}\n`;
            }

            if (symbol === compareList[compareList.length - 1]) {
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'comparison_data.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
        }).catch(error => {
            console.error(`Error fetching data for ${symbol}:`, error);
        });
    });
}

function removeStockFromComparison(symbol) {
    let compareList = JSON.parse(localStorage.getItem('compareList')) || [];
    compareList = compareList.filter(item => item !== symbol);
    localStorage.setItem('compareList', JSON.stringify(compareList));
    displayComparisonData();
}
