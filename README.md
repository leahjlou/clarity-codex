## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Updating data snapshots

This application references a data set from a snapshot rather than being dynamically-driven. To update this snapshot to reflect the latest activity on the Stacks blockchain, run the following steps.

1. Copy `.env.example` into `.env` and add your API keys.
2. Run `node scripts/get-popular-contracts.js` (long-running script)
3. Run `node scripts/analyze-contracts.js`
4. Commit and push all file updates