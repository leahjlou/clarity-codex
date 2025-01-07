const axios = require("axios");
const fs = require("fs");

require("dotenv").config();

const PAGE_SIZE = 50;
const MIN_CALLS = 5; // minimum number of contract calls to include in output

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getContractCalls(offset = 0, retries = 3) {
  const url = `https://api.mainnet.hiro.so/extended/v1/tx`;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await axios.get(url, {
        params: {
          limit: PAGE_SIZE,
          offset,
          type: "contract_call",
        },
        timeout: 30000,
        headers: process.env.HIRO_API_KEY
          ? {
              "x-api-key": process.env.HIRO_API_KEY,
            }
          : {},
      });
      return response.data;
    } catch (error) {
      console.error(
        `API error on attempt ${attempt + 1}/${retries}:`,
        error.message
      );
      console.log(error?.response?.data || "unknown error data");

      if (attempt < retries - 1) {
        // wait longer between each retry
        const delayMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s between retries
        console.log(`Retrying in ${delayMs / 1000} seconds...`);
        await sleep(delayMs);
      } else {
        console.error("All retry attempts failed");
        return { results: [] };
      }
    }
  }
}

async function getAllCalls() {
  const contractCalls = new Map();
  let offset = 0;
  const currentTime = Math.floor(Date.now() / 1000);
  const threeMonthsAgo = currentTime - 90 * 24 * 60 * 60; // changed from 365 to 90 days

  while (true) {
    console.log(`fetching offset ${offset}...`);
    const data = await getContractCalls(offset);

    if (!data.results || data.results.length === 0) {
      console.log("failed with offset: " + offset);
      break;
    }

    let reachedOldData = false;
    for (const tx of data.results) {
      if (parseInt(tx.burn_block_time) < threeMonthsAgo) {
        reachedOldData = true;
        break;
      }
      const contractId = tx.contract_call.contract_id;
      contractCalls.set(contractId, (contractCalls.get(contractId) || 0) + 1);
    }

    if (reachedOldData) break;
    offset += PAGE_SIZE;
  }

  // convert to array, filter low-activity contracts, and sort
  const sorted = [...contractCalls.entries()]
    .filter(([, calls]) => calls >= MIN_CALLS) // only keep contracts with 5+ calls
    .sort(([, a], [, b]) => b - a)
    .map(([contract, calls], index) => ({
      rank: index + 1,
      contract,
      calls,
    }));

  // write to file
  fs.writeFileSync("popular_contracts.json", JSON.stringify(sorted, null, 2));
  console.log("\nsaved top contracts to popular_contracts.json");

  // log top 20 to console
  sorted.slice(0, 20).forEach(({ rank, contract, calls }) => {
    console.log(`${rank}. ${contract}: ${calls} calls`);
  });
}

getAllCalls();
