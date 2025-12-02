## Base Identity & Reputation

On-chain identity and reputation MVP for the Base ecosystem.

This repository contains a minimal but complete example of a **proof-of-identity & reputation system** on **Base (Base Sepolia, chainId 84532)**:

- **Smart contract** that stores profiles and reputation on-chain.
- **Frontend dApp** that lets users register their profile, update metadata and give reputation to other addresses.

> Status: MVP. Deployed and tested on **Base Sepolia**. Can be extended to Base mainnet later.

### Idea

- Register an on-chain profile by wallet address.
- Store profile metadata as a simple string / URL / IPFS URI.
- Allow users to **give reputation** (upvotes) to other addresses with a per-pair limit.
- Expose a simple read API (contract + frontend) to fetch profile & reputation for any address.

### Tech stack

- `contracts/` — Solidity smart contract + Hardhat (`BaseIdentityReputation.sol`).
- `frontend/` — React + TypeScript + Vite, using `wagmi` + `viem` for wallet connection and contract calls.

The project is designed as a small, composable building block for **identity / proof-of-humanity / reputation** flows on Base.

---

### Contracts: setup & deploy (Base Sepolia)

1. Go to the contracts directory:

   ```bash
   cd contracts
   npm install
   ```

2. Create a `.env` file with Base Sepolia RPC and deployer key:

   ```bash
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   PRIVATE_KEY=0xYOUR_PRIVATE_KEY
   ```

   The private key should belong to the account you want to deploy from (no quotes).

3. Compile the contract:

   ```bash
   npx hardhat compile
   ```

4. Deploy to **Base Sepolia**:

   ```bash
   npx hardhat run scripts/deploy.js --network baseSepolia
   ```

   The script will print the deployed contract address:

   ```text
   BaseIdentityReputation deployed to: 0x...
   ```

   Copy this address — you will need it for the frontend.

**Base Sepolia deployment**

- Network: `Base Sepolia` (chainId `84532`)
- Contract: `BaseIdentityReputation`
- Address: `0x5B3Ff49Cd951c676F982B14c10eDD0E19056Ac2e`
- Explorer: [BaseScan (Sepolia)](https://sepolia.basescan.org/address/0x5B3Ff49Cd951c676F982B14c10eDD0E19056Ac2e)

> If deployed to Base mainnet in the future, add the mainnet address and explorer link here as well.

---

### Frontend: setup & run

1. Go to the frontend directory:

   ```bash
   cd ../frontend
   npm install
   ```

2. Create a `.env` file (next to `package.json`) with:

   ```bash
   VITE_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   VITE_IDENTITY_CONTRACT_ADDRESS=0x5B3Ff49Cd951c676F982B14c10eDD0E19056Ac2e
   ```

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open the URL printed in the console (usually `http://localhost:5173`) and:

   - connect your wallet (MetaMask) to **Base Sepolia (chainId 84532)**;
   - register your on-chain profile (metadata URI can be any string / URL / IPFS link);
   - optionally give reputation to other addresses (up to 100 points per address).

After deployment, remember to copy the contract address into `VITE_IDENTITY_CONTRACT_ADDRESS` in the frontend `.env`.

> TODO: once hosted (e.g. on Vercel/Netlify), add a **Live demo** link here.

