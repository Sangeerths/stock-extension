chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'fetchAnalysis') {
        fetchStockAnalysis(message.symbol).then(analysis => {
            sendResponse({ analysis });
        }).catch(error => {
            console.error('Error fetching stock analysis:', error);
            sendResponse({ error: 'Error fetching stock analysis' });
        });
        return true;  // Indicates that the response will be sent asynchronously
    }
});

async function fetchStockAnalysis(symbol) {
    const endDate = Math.floor(Date.now() / 1000);
    const startDate = endDate - 30 * 24 * 60 * 60; // Last 30 days
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?symbol=${symbol}&period1=${startDate}&period2=${endDate}&interval=1d`;

    const response = await fetch(url);
    const data = await response.json();
    const prices = data.chart.result[0].indicators.quote[0].close;
    const lowestPrice = Math.min(...prices);
    const highestPrice = Math.max(...prices);
    return { lowestPrice, highestPrice };
}

console.log('Background script running...');
