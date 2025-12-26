async function TestCandleRoute() {

  const apiKey = "jfSHqrXDvcuzYsPMkHFOgVlBrvBxhQShKzKgYtEDUsGMwoOeBKoNdQuuJEgCFfNQ"; // Replace with your actual API key
  const API_URL = "http://localhost:3000/api/candles";

  console.log("Testing /api/candles route...");

  // Define test parameters
  const payload = {
    symbols: ["AAPL"],
    start: 1672531200, 
    end: 1672976800,
    timeframe: "1d"
  };

  console.log("Sending payload:", JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey
      },
      body: JSON.stringify(payload)
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (response.status !== 200) {
      const errorText = await response.text();
      console.error("Request failed:", errorText);
      process.exit(1);
    }

    const data = await response.json();
    
    // Verify response structure
    const symbol = payload.symbols[0];
    if (!data[symbol]) {
      console.error(`Response missing data for symbol ${symbol}`);
      console.log("Received:", JSON.stringify(data, null, 2));
      process.exit(1);
    }

    const candles = data[symbol];
    console.log(`Success! Received ${candles.length} candles for ${symbol}.`);

    if (candles.length > 0) {
      console.log("\nSample Candle Data:");
      console.log(JSON.stringify(candles[0], null, 2));
    } else {
      console.warn("No candles returned for the specified range.");
    }

  } catch (error) {
    console.error("Error calling API:", error);
  }
}

TestCandleRoute().catch((e) => {
  console.error(e);
  process.exit(1);
});
