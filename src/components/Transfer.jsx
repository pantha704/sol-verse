// src/components/Transfer.jsx
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import {
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { useState, useCallback, useEffect } from "react";
import { Buffer } from "buffer";
import toast from "react-hot-toast";

// Ensure Buffer is available in the browser environment
if (typeof window !== "undefined") {
  window.Buffer = window.Buffer || Buffer;
}

export const Transfer = () => {
  const navigate = useNavigate();
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const wallet = useWallet();
  const [balance, setBalance] = useState(0);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!wallet.publicKey) {
      setBalance(0);
      return;
    }
    // always refresh when wallet changes
    getBalance();
    // eslint-disable-next-line
  }, [wallet.publicKey]);

  async function getBalance() {
    if (wallet.publicKey) {
      try {
        setBalance(
          (await connection.getBalance(wallet.publicKey)) / LAMPORTS_PER_SOL
        );
      } catch (err) {
        console.error("getBalance error:", err);
        toast.error("Failed to fetch balance");
      }
    }
  }

  const sendTokens = useCallback(async () => {
    if (!publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    // basic validation
    let toPubkey;
    try {
      toPubkey = new PublicKey(recipient);
    } catch {
      toast.error("Invalid recipient address");
      return;
    }

    if (!amount || amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }

    if (balance && amount > balance) {
      toast.error("Insufficient funds");
      return;
    }

    setLoading(true);
    const pending = toast.loading("Sending transaction...");

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: toPubkey,
          lamports: Math.floor(amount * LAMPORTS_PER_SOL),
        })
      );

      const txHash = await sendTransaction(transaction, connection);

      // confirm transaction
      const latest = await connection.getLatestBlockhash();
      await connection.confirmTransaction(
        { signature: txHash, ...latest },
        "confirmed"
      );

      // infer cluster for explorer link
      const endpoint = connection.rpcEndpoint || "";
      const cluster = endpoint.includes("devnet")
        ? "devnet"
        : endpoint.includes("testnet")
        ? "testnet"
        : "mainnet";

      toast.success(
        <div>
          <div>Transaction confirmed ✅</div>
          <a
            href={`https://explorer.solana.com/tx/${txHash}?cluster=${cluster}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            View on Explorer
          </a>
        </div>,
        { id: pending }
      );

      // refresh balance
      await getBalance();
    } catch (err) {
      console.error("sendTokens error:", err);
      toast.error("Transaction failed: " + (err?.message || err));
      toast.dismiss(pending);
    } finally {
      setLoading(false);
    }
  }, [publicKey, sendTransaction, connection, recipient, amount, balance]);

  return (
    <div className="flex flex-col gap-2 justify-center items-center">
      <div className="text-2xl font-bold text-center mb-4">Send Tokens</div>

      <form
        className="flex flex-col gap-2 items-center"
        onSubmit={(e) => {
          e.preventDefault();
          sendTokens();
        }}
      >
        <input
          className="border-2 rounded-md p-2 border-black w-auto"
          type="text"
          placeholder="Recipient Address"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
        />
        <input
          className="border-2 rounded-md p-2 border-black w-auto"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <button
          className="text-white hover:text-gray-300 mt-4 rounded-md w-20 disabled:opacity-50"
          type="submit"
          disabled={!publicKey || loading}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </form>

      <button
        className="text-white hover:text-gray-300 mt-4 rounded-md w-auto"
        onClick={() => getBalance()}
        disabled={loading}
      >
        Fetch Balance
      </button>
      {balance
        ? `You have ${balance} SOL in your wallet`
        : "Connect wallet to see balance"}
      <button
        className="bg-purple-500 hover:bg-purple-700 hover:text-gray-300 mt-6 rounded-md"
        onClick={() => navigate("/")}
      >
        Home
      </button>
    </div>
  );
};
