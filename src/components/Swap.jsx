// require("dotenv").config();
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { useRecoilValue } from "recoil";
import { swapQuote } from "../lib/atoms";

async function getQuote() {
  //   const response = await axios.get(
  //     "https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=100000000&slippageBps=50"
  //   );
  //   const quoteResponse = response.data;
  //   console.log(swapQuote);
}

const Swap = () => {
  const navigate = useNavigate();
  const wallet = useWallet();
  const connection = useConnection();

  // get quote
  const quote = useRecoilValue(swapQuote);
  const [quoteData, setQuoteData] = useState(null);

  useEffect(() => {
    if (quote) {
      setQuoteData(quote);
    }
  }, [quote]);

  // swap
  const swap = async () => {
    if (!quoteData) return;

    // Creating transaction from jupiter quote
    try {
      const response = await axios.post("https://quote-api.jup.ag/v6/swap", {
        ...quoteData,
        userPublicKey: wallet.publicKey.toBase58(),
      });

      if (response.status !== 200) {
        throw new Error(`Request failed with status code ${response.status}`);
      }

      const swapTransaction = response.data.swapTransaction;

      // Convert Swap Transaction to Buffer or Bytes
      const swapTransactionBuffer = Buffer.from(swapTransaction, "base64");

      // Deserialize Swap Transaction
      const swapTx = VersionedTransaction.deserialize(swapTransactionBuffer);
      console.log(swapTx);
      // Created transaction from jupiter quote

      // Sign Swap Transaction
      const signedTx = await wallet.signTransaction(swapTx);

      // Send Swap Transaction
      const latestBlockhash = await connection.getLatestBlockhash();
      signedTx.recentBlockhash = latestBlockhash.blockhash;

      const rawTx = signedTx.serialize();
      const txHash = await connection.sendRawTransaction(rawTx, {
        skipPreflight: true,
        maxRetries: 3,
      });
      await connection.confirmTransaction({
        commitment: "confirmed",
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        signature: txHash,
      });
      console.log("https://explorer.solana.com/" + txHash);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          data: error.response?.data,
        });
      } else {
        console.error("Swap error:", error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Swap (Coming Soon)</h1>
      <div className="w-full max-w-md rounded-lg p-6">
        <div className="mb-3">
          <label
            className="block text-white text-sm font-bold mb-1"
            htmlFor="fromToken"
          >
            From
          </label>
          <input
            id="fromToken"
            type="text"
            placeholder="Enter token to swap from"
            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-white bg-gray-800 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-3">
          <label
            className="block text-white text-sm font-bold mb-1"
            htmlFor="toToken"
          >
            To
          </label>
          <input
            id="toToken"
            type="text"
            placeholder="Enter token to swap to"
            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-white bg-gray-800 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-3">
          <label
            className="block text-white text-sm font-bold mb-1"
            htmlFor="amount"
          >
            Amount
          </label>
          <input
            id="amount"
            type="number"
            placeholder="Enter amount"
            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-white bg-gray-800 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <button
          className="text-white hover:text-gray-300 mt-8 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-auto"
          onClick={swap}
        >
          Execute Swap
        </button>
        <br />
        <button
          className="text-white bg-purple-500 hover:bg-purple-700 hover:text-gray-300 mt-10 font-bold py-2 rounded-lg focus:outline-none focus:shadow-outline w-auto"
          onClick={() => {
            navigate("/");
          }}
        >
          Home
        </button>
      </div>
    </div>
  );
};

export default Swap;

//      // Partial Sign Swap Transaction
//       const signedTx = await wallet.signTransaction(swapTx);

//       // Add more signers if needed
//       // Example: const additionalSigner = [...];
//       // signedTx.partialSign(additionalSigner);

//       // Send Partially Signed Transaction
//       const transactionHash = await connection.sendRawTransaction(signedTx.serialize(), {
//         skipPreflight: true,
//         maxRetries: 3,
//       });

//       await connection.confirmTransaction({
//         commitment: "confirmed",
//         blockhash: latestBlockhash.blockhash,
//         lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
//         signature: transactionHash,
//       });

//       console.log("https://explorer.solana.com/tx/" + transactionHash);
