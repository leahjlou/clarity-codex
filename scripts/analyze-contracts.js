const axios = require("axios");
const fs = require("fs");
const OpenAI = require("openai");

require("dotenv").config();

// initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "no key found - check your .env file",
});

const NUM_CONTRACTS_TO_ANALYZE = 50;

const MODEL_COSTS = {
  "gpt-4-0125-preview": {
    input: 0.01 / 1000, // $0.01 per 1k input tokens
    output: 0.03 / 1000, // $0.03 per 1k output tokens
  },
};

async function getContractSource(contractId) {
  const url = `https://api.hiro.so/extended/v1/contract/${contractId}`;
  try {
    const response = await axios.get(url, {
      timeout: 30000,
      headers: process.env.HIRO_API_KEY
        ? {
            "x-api-key": process.env.HIRO_API_KEY,
          }
        : {},
    });
    return response.data.source_code;
  } catch (error) {
    console.error(`Failed to fetch source for ${contractId}:`, error.message);
    return null;
  }
}

// rough estimate of costs before starting
async function estimateTotalCost() {
  // read first contract to get a size estimate
  const contracts = JSON.parse(fs.readFileSync("popular_contracts.json"));
  const firstSource = await getContractSource(contracts[0].contract);

  // estimate tokens (very roughly - 1 token ~= 4 chars)
  const tokensPerContract = Math.ceil(firstSource.length / 4);
  const outputTokens = 500; // rough estimate for analysis output

  const costPerContract =
    tokensPerContract * MODEL_COSTS["gpt-4-0125-preview"].input +
    outputTokens * MODEL_COSTS["gpt-4-0125-preview"].output;

  const totalEstimate = costPerContract * NUM_CONTRACTS_TO_ANALYZE;

  console.log(
    `\nEstimated cost for ${NUM_CONTRACTS_TO_ANALYZE} contracts: $${totalEstimate.toFixed(
      2
    )}`
  );
  console.log(`(based on first contract size of ${firstSource.length} chars)`);

  // give them a chance to bail
  console.log("\npress ctrl+c to cancel, or wait 5s to continue...");
  await new Promise((resolve) => setTimeout(resolve, 5000));
}

async function analyzeContract(source) {
  // add line numbers to source
  const numberedLines = source
    .split("\n")
    .map((line, i) => `${(i + 1).toString().padStart(4, " ")}  ${line}`)
    .join("\n");

  const prompt = `Analyze this Clarity smart contract and provide your response in the following JSON format:

{
  "summary": "short 1-2 sentence summary of what the contract does",
  "explanation": "Start with a high-level architectural overview, then walk through the code line-by-line:
  
  1. First list and explain all the contract's data vars and constants
  2. Then analyze each function in order of appearance, explaining:
     - The function's purpose and when it's called
     - Each parameter and its role
     - The exact logic/steps of what the function does
     - Any important safety checks or error conditions
     - How it interacts with other functions/contracts
  
  For EVERY code reference, use line number annotations:
  - Single line: <L42> 
  - Multiple lines: <L15-20>
  
  Example format:
  The contract defines a data variable 'total-supply' <L12> to track the total number of tokens.
  
  The 'transfer' function <L45-60> handles token transfers between accounts. It first checks if the sender has sufficient balance <L47>, then updates both accounts' balances <L52-53>...",
  
  Please make sure this analysis is very thorough, using language that a non-technical audience can understand.

  Finish the analysis by noting in a list any notable qualities or things that stand out about this contract which make it unique.

  "tags": ["Pick 2-4 tags that best describe the contract's category/purpose: NFT, fungible-token, DeFi, DEX, lending, staking, governance, bridge, oracle, protocol, utility, game"]
}

Contract source, with line numbers:
${numberedLines}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-0125-preview",
      messages: [
        {
          role: "system",
          content:
            "You are an expert in analyzing Clarity smart contracts for the Stacks blockchain and teaching developers who are new to Clarity how to write it well. Provide clear, technical analysis focusing on the contract's purpose and implementation details. Format your response as valid JSON with the specified fields.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    // parse the json response
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI API error:", error.message);
    return null;
  }
}

async function main() {
  // read popular contracts
  const contracts = JSON.parse(fs.readFileSync("popular_contracts.json"));
  const analyses = [];

  for (
    let i = 0;
    i < Math.min(NUM_CONTRACTS_TO_ANALYZE, contracts.length);
    i++
  ) {
    const contract = contracts[i];
    console.log(
      `\nAnalyzing ${i + 1}/${NUM_CONTRACTS_TO_ANALYZE}: ${contract.contract}`
    );

    const source = await getContractSource(contract.contract);
    if (!source) {
      console.log("Failed to fetch source, skipping...");
      continue;
    }

    const analysis = await analyzeContract(source);
    if (!analysis) {
      console.log("Failed to analyze, skipping...");
      continue;
    }

    analyses.push({
      rank: contract.rank,
      contract: contract.contract,
      calls: contract.calls,
      source,
      analysis,
    });

    // save progress after each successful analysis
    fs.writeFileSync(
      "contract_analyses.json",
      JSON.stringify(analyses, null, 2)
    );

    // wait a bit between requests to avoid rate limits
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log("\nAnalysis complete! Results saved to contract_analyses.json");
}

// check for required API key
if (!process.env.OPENAI_API_KEY) {
  console.error("Please set OPENAI_API_KEY environment variable");
  process.exit(1);
}

estimateTotalCost()
  .then(() => {
    main().catch(console.error);
  })
  .catch(console.error);
