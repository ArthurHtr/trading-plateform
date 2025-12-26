async function TestSymbolsRoute() {

  const apiKey = "jfSHqrXDvcuzYsPMkHFOgVlBrvBxhQShKzKgYtEDUsGMwoOeBKoNdQuuJEgCFfNQ"; 
  const API_URL = "http://localhost:3000/api/symbols";

  console.log("Testing /api/symbols route...");
  console.log(`Using API Key: ${apiKey.substring(0, 5)}...`);

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "x-api-key": apiKey
      }
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (response.status !== 200) {
      const errorText = await response.text();
      console.error("Request failed:", errorText);
      process.exit(1);
    }

    const data = await response.json();
    
    if (!Array.isArray(data)) {
      console.error("Response is not an array");
      process.exit(1);
    }

    console.log(`Success! Received ${data.length} symbols.`);

    if (data.length > 0) {
      const sample = data[2];
      console.log("\nSample Symbol Data:");
      console.log(JSON.stringify(sample, null, 2));
    } else {
      console.warn("No symbols returned.");
    }

  } catch (error) {
    console.error("Error calling API:", error);
  }
}

TestSymbolsRoute().catch((e) => {
  console.error(e);
  process.exit(1);
});
