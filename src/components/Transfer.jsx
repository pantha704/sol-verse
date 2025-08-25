import React, { useState, useCallback, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useNavigate } from "react-router-dom";
import {
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL,
  TransactionExpiredBlockheightExceededError,
  ComputeBudgetProgram,
} from "@solana/web3.js";
import { Buffer } from "buffer";
import toast from "react-hot-toast";

// make Buffer available in browsers
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

  const sendTokens = useCallback(
    async (retries = 3) => {
      if (!publicKey) {
        toast.error("Wallet not connected");
        return;
      }

      // validate recipient
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
      const pendingToastId = toast.loading("Sending transaction...");

      let signature;
      try {
        const lamports = Math.floor(amount * LAMPORTS_PER_SOL);
        const transaction = new Transaction().add(
          ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: 1000, // Adjust as needed
          }),
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey,
            lamports,
          })
        );

        // fresh blockhash with 'processed' commitment
        const latest = await connection.getLatestBlockhash("processed");
        transaction.recentBlockhash = latest.blockhash;
        transaction.feePayer = publicKey;

        // wallet signs & sends
        signature = await sendTransaction(transaction, connection);
        console.log("signature:", signature);

        // confirm transaction using built-in method with 'processed'
        const confirmStrategy = {
          signature,
          blockhash: latest.blockhash,
          lastValidBlockHeight: latest.lastValidBlockHeight,
        };
        await connection.confirmTransaction(confirmStrategy, "processed");

        // if we reach here, it's confirmed
      } catch (err) {
        if (
          err instanceof TransactionExpiredBlockheightExceededError &&
          retries > 0
        ) {
          // Retry logic
          toast.update(pendingToastId, {
            type: "loading",
            render: "Retrying transaction...",
          });
          setLoading(false);
          return sendTokens(retries - 1);
        } else if (err instanceof TransactionExpiredBlockheightExceededError) {
          // Final check with polling
          let confirmed = false;
          for (let i = 0; i < 15; i++) {
            // Poll 15 times, ~30s
            try {
              const tx = await connection.getTransaction(signature, {
                commitment: "confirmed",
                maxSupportedTransactionVersion: 0,
              });
              if (tx) {
                if (tx.meta && tx.meta.err) {
                  throw new Error(
                    "Transaction failed: " + JSON.stringify(tx.meta.err)
                  );
                }
                confirmed = true;
                break;
              }
              await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s
            } catch (pollErr) {
              console.error("Polling error:", pollErr);
            }
          }
          if (!confirmed) {
            console.error("Final check error:", err);
            toast.error("Transaction failed: " + (err?.message || err), {
              id: pendingToastId,
            });
            setLoading(false);
            return;
          }
        } else {
          console.error("sendTokens error:", err);
          toast.error("Transaction failed: " + (err?.message || err), {
            id: pendingToastId,
          });
          setLoading(false);
          return;
        }
      }

      // Success handling
      try {
        // cluster inference for explorer link
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
              href={`https://explorer.solana.com/tx/${signature}?cluster=${cluster}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              View on Explorer
            </a>
          </div>,
          { id: pendingToastId } // replace loading toast
        );

        await getBalance();
      } catch (err) {
        console.error("Post-confirmation error:", err);
        toast.error("Error after confirmation: " + (err?.message || err), {
          id: pendingToastId,
        });
      } finally {
        setLoading(false);
      }
    },
    [publicKey, sendTransaction, connection, recipient, amount, balance]
  );

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
          className="text-white hover:text-gray-300 mt-4 p-4 rounded-md w-auto border-purple-500 border-1 px-3 py-1 disabled:opacity-50"
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
