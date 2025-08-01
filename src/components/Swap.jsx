import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import SwapInputField from "./SwapInputField";
import { LAMPORTS_PER_SOL, VersionedTransaction } from "@solana/web3.js";
import { useRecoilValue } from "recoil";
import { rpcStringState } from "../lib/atoms";
import { ConfirmModal } from "./ConfirmModal";

const Swap = () => {
  const cluster = useRecoilValue(rpcStringState);

  const getQuote = async ({ inputMint, outputMint, amount, slippageBps }) => {
    try {
      const url = `https://quote-api.jup.ag/v6/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}${
        cluster !== "mainnet-beta" ? "&cluster=" + cluster : ""
      }&wrapUnwrapOnly=true`;
      console.log("Fetching quote from:", url);
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching quote:", {
        message: error.message,
        response: error.response?.data,
      });
      throw error;
    }
  };

  const navigate = useNavigate();
  const wallet = useWallet();
  const { connection } = useConnection();

  const [swapParams, setSwapParams] = useState({
    inputMint: "So11111111111111111111111111111111111111112", // Default SOL mint address
    inputSymbol: "SOL",
    outputMint:
      cluster !== "mainnet-beta"
        ? "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"
        : "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC mint address
    outputSymbol: "USDC",
    amount: 1,
    slippageBps: 50, // Default slippage of 0.5%
  });
  const [quoteData, setQuoteData] = useState(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [tokenMap, setTokenMap] = useState({});

  // Function to fetch token list from Jupiter API and create a map of token addresses to symbols
  useEffect(() => {
    async function loadTokenList() {
      try {
        // Fetching token list from Jupiter API
        // Map your cluster value to Jupiter's network parameter
        const networkParam = cluster === "mainnet" ? "mainnet" : cluster;
        const url = `https://token.jup.ag/all?network=${networkParam}`;
        const response = await fetch(url);
        const tokens = await response.json();

        // Creating a map of token addresses to symbols
        const map = tokens.reduce((acc, token) => {
          acc[token.address] = {
            symbol: token.symbol,
            decimals: token.decimals,
            name: token.name,
            logoURI: token.logoURI,
            chainId: token.chainId,
          };
          return acc;
        }, {});

        setTokenMap(map);
      } catch (error) {
        console.error("Failed to load token list", error);
      }
    }
    loadTokenList();
  }, [cluster]);

  // Format amount with proper decimals
  const formatAmount = (amount, mint) => {
    const token = tokenMap[mint];
    if (!token) return (amount / 1e9).toFixed(6);

    return (amount / 10 ** token.decimals).toFixed(6);
  };

  // Format the quote for display
  const displayQuoteDetails = () => {
    if (!quoteData) return null;

    const inputToken = tokenMap[quoteData.inputMint] || {
      symbol: "Unknown",
      decimals: 9,
    };
    const outputToken = tokenMap[quoteData.outputMint] || {
      symbol: "Unknown",
      decimals: 6,
    };

    const inAmount = formatAmount(quoteData.inAmount, quoteData.inputMint);
    const outAmount = formatAmount(quoteData.outAmount, quoteData.outputMint);
    const minReceived = formatAmount(
      quoteData.otherAmountThreshold,
      quoteData.outputMint
    );
    const feeAmount = quoteData.routePlan[0]?.swapInfo?.feeAmount
      ? formatAmount(
          quoteData.routePlan[0].swapInfo.feeAmount,
          quoteData.inputMint
        )
      : "0";

    const slippage = (quoteData.slippageBps / 100).toFixed(2);
    const dexName = quoteData.routePlan[0]?.swapInfo?.label || "Unknown DEX";

    return {
      inAmount,
      outAmount,
      minReceived,
      feeAmount,
      slippage,
      dexName,
      inputSymbol: inputToken.symbol,
      outputSymbol: outputToken.symbol,
    };
  };

  // main swap function
  const swap = async () => {
    if (!quoteData) return;

    setIsQuoteModalOpen(false); // Close modal before swap

    // Creating transaction from jupiter quote
    try {
      const response = await axios.post("https://quote-api.jup.ag/v6/swap", {
        quoteResponse: quoteData, // THIS IS THE CRITICAL CHANGE
        userPublicKey: wallet.publicKey.toBase58(),
        ...(cluster !== "mainnet-beta" && { cluster }),
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

      console.log(
        `Swap successful! Tx: https://explorer.solana.com/tx/${txHash}`
      );
    } catch (error) {
      console.error("Swap error details:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        requestBody: {
          quoteResponse: quoteData,
          userPublicKey: wallet.publicKey.toBase58(),
          ...(cluster !== "mainnet-beta" && { cluster }),
        },
      });
      // Rest of your error handling

      if (error.response?.status === 422) {
        const errorMessage =
          error.response.data?.error || "Invalid swap request";
        alert(`Swap failed: ${errorMessage}. Please try getting a new quote.`);
      } else {
        alert(`Swap failed: ${error.message}`);
      }

      // Reopen modal on error so user can try again
      setIsQuoteModalOpen(true);
    }
  };

  const handleGetQuote = async () => {
    try {
      // Get input token decimals
      const inputToken = tokenMap[swapParams.inputMint];
      const decimals = inputToken?.decimals || 9; // Default to SOL's 9 decimals
      // Convert user input to la   mports
      const amountInLamports = swapParams.amount * 10 ** decimals;
      const quote = await getQuote({
        inputMint: swapParams.inputMint,
        outputMint: swapParams.outputMint,
        amount: amountInLamports,
        slippageBps: swapParams.slippageBps,
      });

      setQuoteData(quote);
      setIsQuoteModalOpen(true);
    } catch (error) {
      console.error("Quote fetch failed:", error);
      alert(
        `Failed to get quote: ${error.response?.data?.error || error.message}`
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Swap</h1>
      <div className="w-full max-w-md rounded-lg p-6">
        {/* Input Field */}
        <SwapInputField
          label={"From"}
          id={"fromToken"}
          type="text"
          value={swapParams.inputMint}
          onChange={(e) => {
            const mint = e.target.value;
            const token = tokenMap[mint] || {};
            setSwapParams({
              ...swapParams,
              inputMint: mint,
              inputSymbol: token.symbol || mint.slice(0, 4) + "...",
            });
          }}
          extraLabel={swapParams.inputSymbol}
        />

        <SwapInputField
          label={"To"}
          id={"toToken"}
          type="text"
          value={swapParams.outputMint}
          onChange={(e) => {
            const mint = e.target.value;
            const token = tokenMap[mint] || {};
            setSwapParams({
              ...swapParams,
              outputMint: mint,
              outputSymbol: token.symbol || mint.slice(0, 4) + "...",
            });
          }}
          extraLabel={swapParams.outputSymbol}
        />

        <SwapInputField
          label={"Amount"}
          id={"amount"}
          type="number"
          step="any"
          value={swapParams.amount}
          onChange={(e) => {
            setSwapParams({ ...swapParams, amount: e.target.value });
            console.log(swapParams.amount, e.target.value);
          }}
          extraLabel={"unit(s)"}
        />

        <SwapInputField
          label={"Max Slippage (bps)"}
          id={"slippageBps"}
          type="number"
          value={swapParams.slippageBps}
          onChange={(e) => {
            // Enforce reasonable slippage limits
            let bps = parseInt(e.target.value) || 50;
            bps = Math.max(1, Math.min(500, bps)); // 0.01% to 5%
            setSwapParams({ ...swapParams, slippageBps: bps });
          }}
          extraLabel={`${(swapParams.slippageBps / 100).toFixed(2)}%`}
        />

        {/* Action Buttons */}
        <div className="mb-3 ">
          <button
            className="text-white hover:text-gray-300 mt-8 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-auto"
            onClick={handleGetQuote}
          >
            Get Quote
          </button>
          {/* <button
            className="text-white hover:text-gray-300 mt-8 font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline w-auto"
            onClick={swap}
          >
            Execute Swap
          </button> */}
        </div>
        <button
          className="text-white bg-purple-500 hover:bg-purple-700 hover:text-gray-300 mt-8 font-bold py-2 rounded-lg focus:outline-none focus:shadow-outline w-auto"
          onClick={() => {
            navigate("/");
          }}
        >
          Home
        </button>
      </div>

      {/* Quote Confirmation Modal */}
      {isQuoteModalOpen && quoteData && (
        <ConfirmModal
          onClick={() => setIsQuoteModalOpen(false)}
          displayQuoteDetails={displayQuoteDetails}
          swap={swap}
        />
      )}
    </div>
  );
};

export default Swap;
