document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const stockSymbol = urlParams.get('symbol');
    if (stockSymbol) {
        fetchCompanyDetails(stockSymbol);
    }
});

function fetchCompanyDetails(symbol) {
    const url = `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${symbol}&apikey=GLAFZO4G47428B6O`; // Replace with your actual API key

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data) {
                displayCompanyDetails(data);
            } else {
                displayError('Company details not available.');
            }
        })
        .catch(error => {
            console.error('Error fetching company details:', error);
            displayError('Error fetching company details.');
        });
}

function displayCompanyDetails(details) {
    const detailsContainer = document.getElementById('companyDetails');
    detailsContainer.innerHTML = `
        <p><strong>Name:</strong> ${details.Name}</p>
        <p><strong>Sector:</strong> ${details.Sector}</p>
        <p><strong>Industry:</strong> ${details.Industry}</p>
        <p><strong>Description:</strong> ${details.Description}</p>
        <p><strong>Market Capitalization:</strong> ${details.MarketCapitalization}</p>
        <p><strong>EBITDA:</strong> ${details.EBITDA}</p>
        <p><strong>PE Ratio:</strong> ${details.PERatio}</p>
        <p><strong>Dividend Per Share:</strong> ${details.DividendPerShare}</p>
    `;
}

function displayError(message) {
    const detailsContainer = document.getElementById('companyDetails');
    detailsContainer.innerHTML = `<p>${message}</p>`;
}
