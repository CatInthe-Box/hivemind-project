# Honey Chain

Blockchain + IoT + AI honey traceability for rural beekeepers — built for
Smart India Hackathon 2026 (SIH26021, KVIC / Ministry of MSME).

**Live demo flow:** register a beekeeper → register a hive → register a
harvested batch → the app hashes the batch data, writes that hash to a
smart contract on the Polygon Amoy testnet, and generates a QR code.
Anyone who scans the QR lands on a public verification page that proves
the batch record has not been tampered with.

## What's in here

- `pages/index.js` — dashboard: forms + live batch list with QR codes
- `pages/verify/[batchId].js` — public consumer-facing verification page
- `pages/api/*` — REST API for beekeepers, hives, batches (MongoDB-backed)
- `contracts/HoneyChain.sol` — the on-chain traceability contract
- `contracts/HoneyChainABI.json` — its ABI (already matches the contract)
- `lib/db.js` — MongoDB connection (cached for serverless)
- `lib/blockchain.js` — talks to the smart contract via ethers.js

The app **works fully without the blockchain configured** — batches just
save with status "Saved (blockchain not configured)" until you add the
blockchain env vars. This means you can deploy and demo the whole flow
first, then layer blockchain on top without anything breaking.

---

## Step 1 — Get a free MongoDB database

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free
   account.
2. Create a free (M0) cluster.
3. Under **Database Access**, create a DB user + password.
4. Under **Network Access**, click "Allow Access from Anywhere"
   (0.0.0.0/0) — needed since Vercel's IPs change.
5. Click **Connect → Drivers**, copy the connection string. It looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/`
6. Add `honeychain` as the database name at the end:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/honeychain`

This is your `MONGODB_URI`.

## Step 2 — Run it locally first

```bash
npm install
cp .env.example .env.local
# paste your MONGODB_URI into .env.local
npm run dev
```

Open http://localhost:3000 — add a beekeeper, a hive, and a batch. It
should all work even with blockchain env vars still blank.

## Step 3 — Deploy the smart contract (adds the blockchain proof)

You don't need Hardhat or any command-line tooling — use Remix, which
runs entirely in the browser:

1. Go to https://remix.ethereum.org
2. Create a new file, paste in the contents of `contracts/HoneyChain.sol`.
3. Compile it (left sidebar → Solidity Compiler → Compile, use version
   0.8.19+).
4. Install the MetaMask browser extension, create a wallet **you'll use
   for testing only**.
5. Switch MetaMask to the "Polygon Amoy Testnet" (add it if it's not
   listed — chain ID 80002, or search "Polygon Amoy" in MetaMask's
   network picker).
6. Get free test MATIC for that wallet at https://faucet.polygon.technology
7. Back in Remix → Deploy & Run Transactions tab → set Environment to
   "Injected Provider - MetaMask" → click **Deploy** → confirm in
   MetaMask.
8. Copy the deployed contract address (shown under "Deployed Contracts").

That address is your `CONTRACT_ADDRESS`.

## Step 4 — Get an RPC URL and your private key

1. Sign up free at https://www.alchemy.com (or https://www.infura.io).
2. Create an app for "Polygon Amoy" and copy its HTTPS RPC URL — that's
   your `RPC_URL`.
3. In MetaMask, open your test wallet → Account details → Export Private
   Key. **Only ever do this for a test-only wallet, never a real one.**
   That's your `PRIVATE_KEY`.

Add all three (`RPC_URL`, `PRIVATE_KEY`, `CONTRACT_ADDRESS`) to
`.env.local` and restart `npm run dev`. Register a new batch — it should
now come back with status "Verified on blockchain" and a working
Polygonscan link.

## Step 5 — Push to GitHub

```bash
git init
git add .
git commit -m "Honey Chain"
gh repo create honeychain-app --public --source=. --push
```

(No `gh` CLI? Create a repo on github.com, then `git remote add origin
<url>` and `git push -u origin main`.)

`.env.local` is already in `.gitignore` — your secrets won't be
committed.

## Step 6 — Deploy to Vercel

1. Go to https://vercel.com, sign in with GitHub.
2. Click **Add New… → Project**, select your `honeychain-app` repo.
3. Vercel auto-detects Next.js — leave build settings as default.
4. Before clicking Deploy, open **Environment Variables** and add:
   - `MONGODB_URI`
   - `RPC_URL`
   - `PRIVATE_KEY`
   - `CONTRACT_ADDRESS`
   (same values as your `.env.local`)
5. Click **Deploy**.

Once it's live, open the URL, register a batch, and scan the generated
QR with your phone — it should open the verification page on your live
Vercel domain.

## Judge-facing talking points

- **Immutability**: the contract's `registerBatch` reverts if a
  `batchId` already exists — records can be created but never silently
  altered.
- **Tamper-evidence**: the verification page independently recomputes
  nothing client-side — it compares the database's stored hash against
  the hash actually stored on-chain (`hashMatch`), so any DB tampering
  would be visible.
- **IoT → AI pipeline**: `sensorReadings` on each hive feed a disease
  risk score (`lib/estimateDiseaseRisk` inside
  `pages/api/batches/index.js`) — currently rule-based, designed to be
  swapped for a trained model without changing the API contract.
- **Scalable for rural clusters**: no wallet or crypto knowledge is
  required from beekeepers — a field agent or KVIC officer logs the
  batch, the backend wallet signs the transaction on their behalf.
