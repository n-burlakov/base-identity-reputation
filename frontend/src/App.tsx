import type { FormEvent } from 'react'
import { useMemo, useState } from 'react'
import {
  useAccount,
  useConnect,
  useDisconnect,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi'
import './App.css'

const CONTRACT_ADDRESS = import.meta.env.VITE_IDENTITY_CONTRACT_ADDRESS as `0x${string}` | undefined

const contractAbi = [
  {
    type: 'function',
    name: 'register',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'metadataURI', type: 'string' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'updateMetadata',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'metadataURI', type: 'string' }],
    outputs: [],
  },
  {
    type: 'function',
    name: 'giveReputation',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getProfile',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [
      { name: 'registered', type: 'bool' },
      { name: 'metadataURI', type: 'string' },
      { name: 'reputation', type: 'uint256' },
    ],
  },
] as const

function App() {
  const { address, isConnected, chain } = useAccount()
  const {
    connect,
    connectors,
    isPending: isConnectPending,
    error: connectError,
  } = useConnect()
  const { disconnect } = useDisconnect()

  const [metadata, setMetadata] = useState('')
  const [targetAddress, setTargetAddress] = useState('')
  const [amount, setAmount] = useState('0')

  const {
    data: profileData,
    refetch: refetchProfile,
    isLoading: isProfileLoading,
  } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: contractAbi,
    functionName: 'getProfile',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address && CONTRACT_ADDRESS),
    },
  })

  const isRegistered = useMemo(() => {
    if (!profileData) return false
    const [registered] = profileData as [boolean, string, bigint]
    return registered
  }, [profileData])

  const currentMetadata = useMemo(() => {
    if (!profileData) return ''
    const [, meta] = profileData as [boolean, string, bigint]
    return meta
  }, [profileData])

  const currentReputation = useMemo(() => {
    if (!profileData) return 0n
    const [, , rep] = profileData as [boolean, string, bigint]
    return rep
  }, [profileData])

  const {
    writeContractAsync,
    data: txHash,
    isPending: isTxPending,
    error: txError,
  } = useWriteContract()

  const { isLoading: isTxConfirming, isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault()
    if (!CONTRACT_ADDRESS || !metadata) return
    await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: isRegistered ? 'updateMetadata' : 'register',
      args: [metadata],
    })
    void refetchProfile()
  }

  const handleGiveReputation = async (e: FormEvent) => {
    e.preventDefault()
    if (!CONTRACT_ADDRESS || !targetAddress) return
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) return
    await writeContractAsync({
      address: CONTRACT_ADDRESS,
      abi: contractAbi,
      functionName: 'giveReputation',
      args: [targetAddress as `0x${string}`, BigInt(value)],
    })
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Base Identity & Reputation</h1>
        <p className="subtitle">On-chain proof-of-humanity & reputation system on Base Sepolia</p>
        <div className="wallet">
          {isConnected ? (
            <>
              <span className="pill">
                {chain?.name ?? 'Unknown'} · {address?.slice(0, 6)}…{address?.slice(-4)}
              </span>
              <button type="button" onClick={() => disconnect()}>
                Disconnect
              </button>
            </>
          ) : connectors.length === 0 ? (
            <span className="pill">
              No injected wallet found. Install MetaMask or a compatible browser wallet.
            </span>
          ) : (
            <div className="wallet-actions">
              <button
                type="button"
                onClick={() => connect({ connector: connectors[0] })}
                disabled={isConnectPending}
              >
                {isConnectPending ? 'Connecting…' : 'Connect Wallet'}
              </button>
              {connectError && (
                <span className="error small">Connect error: {connectError.message}</span>
              )}
            </div>
          )}
        </div>
      </header>

      {!CONTRACT_ADDRESS && (
        <div className="warning">
          <strong>VITE_IDENTITY_CONTRACT_ADDRESS</strong> is not set. Add it to your frontend
          <code>.env</code> file after deploying the contract.
        </div>
      )}

      <main className="grid">
        <section className="card">
          <h2>Your profile</h2>
          {!isConnected && <p>Connect your wallet to register and manage your on-chain profile.</p>}
          {isConnected && (
            <>
              {isProfileLoading ? (
                <p>Loading profile…</p>
              ) : (
                <div className="profile">
                  <p>
                    <strong>Status:</strong> {isRegistered ? 'Registered' : 'Not registered'}
                  </p>
                  {isRegistered && (
                    <>
                      <p>
                        <strong>Metadata URI:</strong> {currentMetadata || '—'}
                      </p>
                      <p>
                        <strong>Reputation:</strong> {currentReputation.toString()}
                      </p>
                    </>
                  )}
                </div>
              )}

              <form onSubmit={handleRegister} className="form">
                <label>
                  Metadata URI (IPFS / URL / JSON):
                  <input
                    type="text"
                    value={metadata}
                    onChange={(e) => setMetadata(e.target.value)}
                    placeholder={currentMetadata || 'ipfs://... or https://...'}
                  />
                </label>
                <button
                  type="submit"
                  disabled={isTxPending || isTxConfirming || !metadata || !CONTRACT_ADDRESS}
                >
                  {isTxPending || isTxConfirming
                    ? 'Pending…'
                    : isRegistered
                      ? 'Update metadata'
                      : 'Register profile'}
                </button>
              </form>
            </>
          )}
        </section>

        <section className="card">
          <h2>Give reputation</h2>
          {!isConnected && <p>Connect your wallet to give reputation to other addresses.</p>}
          {isConnected && (
            <form onSubmit={handleGiveReputation} className="form">
              <label>
                To address:
                <input
                  type="text"
                  value={targetAddress}
                  onChange={(e) => setTargetAddress(e.target.value)}
                  placeholder="0xRecipient..."
                />
              </label>
              <label>
                Amount (max 100 per address):
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </label>
              <button
                type="submit"
                disabled={isTxPending || isTxConfirming || !CONTRACT_ADDRESS || !targetAddress}
              >
                {isTxPending || isTxConfirming ? 'Sending…' : 'Give reputation'}
              </button>
              {txError && (
                <p className="error">
                  Transaction error: {txError.message}
                </p>
              )}
              {isTxSuccess && (
                <p className="success">
                  Transaction confirmed. Reputation updated (if the recipient is registered).
                </p>
              )}
            </form>
          )}
        </section>

        <section className="card">
          <h2>Statistics & Analytics</h2>
          <div className="stats">
            <p>
              View on-chain activity and contract statistics on{' '}
              <a
                href={`https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                BaseScan
              </a>
              :
            </p>
            <ul className="stats-list">
              <li>
                <strong>Contract:</strong>{' '}
                <a
                  href={`https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  {CONTRACT_ADDRESS?.slice(0, 6)}…{CONTRACT_ADDRESS?.slice(-4)}
                </a>
              </li>
              <li>
                <strong>Events:</strong>{' '}
                <a
                  href={`https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}#events`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  View Registered, ReputationGiven events
                </a>
              </li>
              <li>
                <strong>Transactions:</strong>{' '}
                <a
                  href={`https://sepolia.basescan.org/address/${CONTRACT_ADDRESS}#internaltx`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                >
                  View all contract interactions
                </a>
              </li>
            </ul>
            <p className="stats-note">
              💡 <strong>Tip:</strong> Use BaseScan to track total registrations, reputation given,
              and contract usage metrics.
            </p>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          Network: <strong>Base Sepolia (chainId 84532)</strong>. Make sure your wallet is on this
          network.
        </p>
      </footer>
    </div>
  )
}

export default App
