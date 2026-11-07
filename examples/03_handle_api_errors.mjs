// SPDX-License-Identifier: MIT
import { PepkioClient, PepkioAPIError } from "../dist/index.js";

async function runWithRetry(client, payload, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await client.run(payload);
    } catch (err) {
      if (err instanceof PepkioAPIError && err.status >= 500 && attempt < maxRetries) {
        const sleepMs = Math.pow(2, attempt) * 1000;
        console.log(`[Attempt ${attempt}] Server error ${err.status}, retrying in ${sleepMs}ms...`);
        await new Promise((r) => setTimeout(r, sleepMs));
        continue;
      }
      throw err;
    }
  }
}

async function main() {
  const apiKey = process.env.PEPKIO_API_KEY || "your-api-key";
  const client = new PepkioClient({ apiKey });

  console.log("1. Testing invalid input error handling...");
  try {
    // @ts-expect-error deliberately passing empty object to test validation
    await client.run({});
  } catch (err) {
    if (err instanceof PepkioAPIError) {
      console.log(`Caught expected API error: HTTP ${err.status} - ${err.message}`);
    } else {
      console.log(`Caught validation error:`, err.message);
    }
  }

  const examples = client.listExamples();
  if (examples.length > 0) {
    const validInput = await client.getExampleInput(examples[0].name);
    try {
      const result = await runWithRetry(client, validInput);
      console.log(`Resilient run succeeded: status=${result.status}`);
    } catch (err) {
      console.error("Run failed after retries:", err.message);
    }
  }
}

main().catch(console.error);
