document.addEventListener('DOMContentLoaded', function() {
    let selectedSymbol = '';

    document.getElementById('getChart').addEventListener('click', function() {
        const stockSymbol = document.getElementById('stockSymbol').value.trim().toUpperCase();
        if (stockSymbol) {
            displayStockData(stockSymbol);
            selectedSymbol = stockSymbol;
        } else {
            alert('Please enter a stock symbol.');
        }
    });

    document.getElementById('addFavorite').addEventListener('click', function() {
        const stockSymbolInput = document.getElementById('addFavoriteSymbol');
        const stockSymbol = stockSymbolInput.value.trim().toUpperCase();
        if (stockSymbol) {
            addFavoriteStock(stockSymbol);
            stockSymbolInput.value = ''; // Clear input field
        }
    });

    document.getElementById('addToCompare').addEventListener('click', function() {
        const stockSymbol = document.getElementById('stockSymbol').value.trim().toUpperCase();
        if (stockSymbol) {
            addToCompare(stockSymbol);
        }
    });

    document.getElementById('viewCompare').addEventListener('click', function() {
        window.location.href = 'compare.html';
    });

    document.getElementById('viewDetails').addEventListener('click', function() {
        if (selectedSymbol) {
            window.location.href = `details.html?symbol=${selectedSymbol}`;
        } else {
            alert('Please select a company to view details.');
        }
    });

    displayFavorites(); // Display saved favorites on page load

    function displayStockData(symbol) {
        displayChart(symbol);
        fetchCurrentPrice(symbol);
    }

    function displayChart(symbol) {
        const chartContainer = document.getElementById('chartContainer');
        chartContainer.innerHTML = '';  // Clear previous chart if any

        const iframe = document.createElement('iframe');
        iframe.src = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_abcdef&symbol=${symbol}&interval=D&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=["MA@tv-basicstudies"]&theme=light&style=1&timezone=Etc/UTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en&utm_source=&utm_medium=widget&utm_campaign=chart&utm_term=${symbol}`;
        iframe.width = '100%';
        iframe.height = '400px';
        iframe.frameBorder = '0';
        iframe.allowTransparency = 'true';

        chartContainer.appendChild(iframe);
    }

    function fetchCurrentPrice(symbol) {
        const apiKey = '7Q99NBNB55I38GK0'; // Replace with your actual Alpha Vantage API key
        const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`;

        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data && data['Global Quote'] && data['Global Quote']['05. price']) {
                    const price = parseFloat(data['Global Quote']['05. price']);
                    const priceInINR = price * 74.50; // Replace with the appropriate exchange rate
                    displayCurrentPrice(priceInINR);
                    storeDataLocally(symbol, priceInINR);
                } else {
                    displayCurrentPrice('Price not available');
                }
            })
            .catch(error => {
                console.error('Error fetching current price:', error);
                displayCurrentPrice('Error fetching current price');
            });
    }

    function displayCurrentPrice(price) {
        const priceContainer = document.getElementById('currentPrice');
        priceContainer.textContent = typeof price === 'number' ? `${price.toFixed(2)}` : price;
    }

    function addFavoriteStock(symbol) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        if (!favorites.includes(symbol)) {
            favorites.push(symbol);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            displayFavorites();
        }
    }

    function removeFavoriteStock(symbol) {
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites = favorites.filter(fav => fav !== symbol);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        displayFavorites();
    }

    function displayFavorites() {
        const favoritesList = document.getElementById('favoritesList');
        favoritesList.innerHTML = '';
        let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
        favorites.forEach(symbol => {
            const li = document.createElement('li');
            li.textContent = symbol;

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.classList.add('button-remove-favorite');
            removeButton.addEventListener('click', function(event) {
                event.stopPropagation();
                removeFavoriteStock(symbol);
            });
            li.appendChild(removeButton);

            const addToCompareButton = document.createElement('button');
            addToCompareButton.textContent = 'Add to Compare';
            addToCompareButton.classList.add('button-add-to-compare');
            addToCompareButton.addEventListener('click', function(event) {
                event.stopPropagation();
                addToCompare(symbol);
            });
            li.appendChild(addToCompareButton);

            li.addEventListener('click', function() {
                displayStockData(symbol); // Fetch and display chart and current price
                selectedSymbol = symbol; // Store the selected symbol
            });

            favoritesList.appendChild(li);
        });
    }

    function storeDataLocally(symbol, price) {
        const date = new Date().toLocaleString();
        let stockData = JSON.parse(localStorage.getItem('stockData')) || [];
        stockData.push({ symbol, price: price.toFixed(2), date });
        localStorage.setItem('stockData', JSON.stringify(stockData));
    }

    function addToCompare(symbol) {
        let compareList = JSON.parse(localStorage.getItem('compareList')) || [];
        if (!compareList.includes(symbol)) {
            compareList.push(symbol);
            localStorage.setItem('compareList', JSON.stringify(compareList));
            alert(`${symbol} added to comparison list.`);
        } else {
            alert(`${symbol} is already in the comparison list.`);
        }
    }
});
