import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useNavigate } from 'react-router-dom'
import {
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import { useState, useCallback, useEffect } from 'react'
import { Buffer } from 'buffer'
import { error } from 'console'

// Ensure Buffer is available in the browser environment
if (typeof window !== 'undefined') {
  window.Buffer = window.Buffer || Buffer
}

export const Transfer = () => {
  const navigate = useNavigate()
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const wallet = useWallet()
  const [balance, setBalance] = useState(0)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState(0)

  useEffect(() => {
    if (!wallet.publicKey) {
      setBalance(0)
      return
    }
    if (!balance) {
      getBalance()
    }
  }, [wallet.publicKey, balance])

  const sendTokens = useCallback(async () => {
    if (!publicKey) {
      alert('Wallet not connected')
      return
    }
    console.log(recipient, amount)

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipient),
          lamports: amount * LAMPORTS_PER_SOL,
        })
      )
      const txHash = await sendTransaction(transaction, connection)

      alert(txHash ? 'Transaction successful' : 'Transaction failed')
    } catch (error) {
      alert('Transaction failed: ' + error.message)
    }
  }, [publicKey, sendTransaction, connection, recipient, amount])

  async function getBalance() {
    if (wallet.publicKey) {
      setBalance(
        (await connection.getBalance(wallet.publicKey)) / LAMPORTS_PER_SOL
      )
    }
  }

  return (
    <div className="flex flex-col gap-2 justify-center items-center">
      <div className="text-2xl font-bold text-center mb-4">Send Tokens</div>
      <input
        className="border-2 rounded-md p-2 border-black w-auto"
        type="text"
        placeholder="Recipient Address"
        onChange={(e) => setRecipient(e.target.value)}
      />
      <input
        className="border-2 rounded-md p-2 border-black w-auto"
        type="number"
        placeholder="Amount"
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <button
        className="text-white hover:text-gray-300 mt-4 rounded-md w-auto"
        onClick={() =>
          amount > 0 ? sendTokens() : alert('Amount must be greater than 0')
        }
        disabled={!publicKey}
      >
        Send
      </button>
      <button
        className="text-white hover:text-gray-300 mt-4 rounded-md w-auto"
        onClick={() => getBalance()}
      >
        Fetch Balance
      </button>
      {balance ? `You have ${balance} SOL in your wallet` : ''}
      <button
        className="bg-purple-500 hover:bg-purple-700 hover:text-gray-300 mt-6 rounded-md"
        onClick={() => navigate('/')}
      >
        Home
      </button>
    </div>
  )
}
