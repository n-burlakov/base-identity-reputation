# Integration Example: Using Base Identity & Reputation in Your dApp

This guide shows how to integrate the `BaseIdentityReputation` contract into your own dApp or smart contract.

## Contract Address

**Base Sepolia (Testnet):**
- Address: `0x5B3Ff49Cd951c676F982B14c10eDD0E19056Ac2e`
- Explorer: [BaseScan (Sepolia)](https://sepolia.basescan.org/address/0x5B3Ff49Cd951c676F982B14c10eDD0E19056Ac2e)

## Contract ABI

```json
[
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "string", "name": "metadataURI", "type": "string"}
    ],
    "name": "Registered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "from", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "to", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256"}
    ],
    "name": "ReputationGiven",
    "type": "event"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getProfile",
    "outputs": [
      {"internalType": "bool", "name": "registered", "type": "bool"},
      {"internalType": "string", "name": "metadataURI", "type": "string"},
      {"internalType": "uint256", "name": "reputation", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "isRegistered",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "reputationOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]
```

## Example 1: Using with viem (TypeScript/JavaScript)

```typescript
import { createPublicClient, createWalletClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'

// Setup clients
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org')
})

const account = privateKeyToAccount('0x...') // Your private key
const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http('https://sepolia.base.org')
})

const IDENTITY_CONTRACT = '0x5B3Ff49Cd951c676F982B14c10eDD0E19056Ac2e' as `0x${string}`

const IDENTITY_ABI = [
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'getProfile',
    outputs: [
      { name: 'registered', type: 'bool' },
      { name: 'metadataURI', type: 'string' },
      { name: 'reputation', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'isRegistered',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'user', type: 'address' }],
    name: 'reputationOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'metadataURI', type: 'string' }],
    name: 'register',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'giveReputation',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const

// Read operations
async function checkUserProfile(userAddress: `0x${string}`) {
  const profile = await publicClient.readContract({
    address: IDENTITY_CONTRACT,
    abi: IDENTITY_ABI,
    functionName: 'getProfile',
    args: [userAddress]
  })
  
  console.log('Registered:', profile[0])
  console.log('Metadata URI:', profile[1])
  console.log('Reputation:', profile[2].toString())
  
  return profile
}

async function checkRegistration(userAddress: `0x${string}`) {
  const isRegistered = await publicClient.readContract({
    address: IDENTITY_CONTRACT,
    abi: IDENTITY_ABI,
    functionName: 'isRegistered',
    args: [userAddress]
  })
  
  return isRegistered
}

async function getReputation(userAddress: `0x${string}`) {
  const reputation = await publicClient.readContract({
    address: IDENTITY_CONTRACT,
    abi: IDENTITY_ABI,
    functionName: 'reputationOf',
    args: [userAddress]
  })
  
  return reputation
}

// Write operations
async function registerProfile(metadataURI: string) {
  const hash = await walletClient.writeContract({
    address: IDENTITY_CONTRACT,
    abi: IDENTITY_ABI,
    functionName: 'register',
    args: [metadataURI]
  })
  
  await publicClient.waitForTransactionReceipt({ hash })
  console.log('Profile registered!')
}

async function giveReputation(to: `0x${string}`, amount: bigint) {
  const hash = await walletClient.writeContract({
    address: IDENTITY_CONTRACT,
    abi: IDENTITY_ABI,
    functionName: 'giveReputation',
    args: [to, amount]
  })
  
  await publicClient.waitForTransactionReceipt({ hash })
  console.log('Reputation given!')
}
```

## Example 2: Using with ethers.js

```javascript
const { ethers } = require('ethers')

const IDENTITY_CONTRACT = '0x5B3Ff49Cd951c676F982B14c10eDD0E19056Ac2e'
const RPC_URL = 'https://sepolia.base.org'

// Setup provider and signer
const provider = new ethers.JsonRpcProvider(RPC_URL)
const signer = new ethers.Wallet('YOUR_PRIVATE_KEY', provider)

// Contract ABI (simplified)
const IDENTITY_ABI = [
  'function getProfile(address user) view returns (bool registered, string memory metadataURI, uint256 reputation)',
  'function isRegistered(address user) view returns (bool)',
  'function reputationOf(address user) view returns (uint256)',
  'function register(string memory metadataURI)',
  'function giveReputation(address to, uint256 amount)'
]

const identityContract = new ethers.Contract(IDENTITY_CONTRACT, IDENTITY_ABI, signer)

// Read operations
async function checkProfile(userAddress) {
  const profile = await identityContract.getProfile(userAddress)
  console.log('Registered:', profile.registered)
  console.log('Metadata:', profile.metadataURI)
  console.log('Reputation:', profile.reputation.toString())
}

async function checkIfRegistered(userAddress) {
  const isRegistered = await identityContract.isRegistered(userAddress)
  return isRegistered
}

// Write operations
async function register(metadataURI) {
  const tx = await identityContract.register(metadataURI)
  await tx.wait()
  console.log('Profile registered!')
}

async function giveReputation(to, amount) {
  const tx = await identityContract.giveReputation(to, amount)
  await tx.wait()
  console.log('Reputation given!')
}
```

## Example 3: Using in Another Smart Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBaseIdentityReputation {
    function isRegistered(address user) external view returns (bool);
    function reputationOf(address user) external view returns (uint256);
    function getProfile(address user) external view returns (
        bool registered,
        string memory metadataURI,
        uint256 reputation
    );
}

contract MyDApp {
    IBaseIdentityReputation public identityContract;
    
    constructor(address _identityContract) {
        identityContract = IBaseIdentityReputation(_identityContract);
    }
    
    // Example: Only allow registered users
    modifier onlyRegistered() {
        require(
            identityContract.isRegistered(msg.sender),
            "User must be registered"
        );
        _;
    }
    
    // Example: Require minimum reputation
    function doSomethingImportant() external onlyRegistered {
        uint256 reputation = identityContract.reputationOf(msg.sender);
        require(reputation >= 50, "Insufficient reputation");
        
        // Your logic here
    }
    
    // Example: Use reputation for weighted voting
    function vote(uint256 proposalId, bool support) external onlyRegistered {
        uint256 reputation = identityContract.reputationOf(msg.sender);
        // Weight vote by reputation
        // Your voting logic here
    }
}
```

## Example 4: Listening to Events

```typescript
import { createPublicClient, http } from 'viem'
import { baseSepolia } from 'viem/chains'

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http('https://sepolia.base.org')
})

const IDENTITY_CONTRACT = '0x5B3Ff49Cd951c676F982B14c10eDD0E19056Ac2e' as `0x${string}`

// Listen to Registered events
const registeredLogs = await publicClient.getLogs({
  address: IDENTITY_CONTRACT,
  event: {
    type: 'event',
    name: 'Registered',
    inputs: [
      { indexed: true, name: 'user', type: 'address' },
      { indexed: false, name: 'metadataURI', type: 'string' }
    ]
  },
  fromBlock: 'earliest'
})

// Listen to ReputationGiven events
const reputationLogs = await publicClient.getLogs({
  address: IDENTITY_CONTRACT,
  event: {
    type: 'event',
    name: 'ReputationGiven',
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' }
    ]
  },
  fromBlock: 'earliest'
})

console.log('Total registrations:', registeredLogs.length)
console.log('Total reputation given:', reputationLogs.length)
```

## Use Cases

### 1. Lending Protocol
Use reputation as a credit score to determine loan eligibility and interest rates.

### 2. DAO Governance
Weight votes by reputation score instead of token holdings.

### 3. Social dApp
Show reputation badges, filter content by user reputation.

### 4. Private Applications
Require minimum reputation to access premium features.

### 5. Marketplace
Display seller reputation to build trust.

## Notes

- All reputation is stored on-chain and publicly verifiable
- Reputation limit: 100 points per address pair
- Users must register before giving reputation
- Metadata URI can be IPFS, HTTP URL, or any string

## Support

For questions or issues, open an issue on [GitHub](https://github.com/n-burlakov/base-identity-reputation).

