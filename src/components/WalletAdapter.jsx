import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

function App() {
  // const [rpcUrl, setRpcUrl] = useState(clusterApiUrl("devnet"));
  const wallet = useWallet();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-2 items-center justify-center">
      <div className="text-2xl font-bold text-center mb-4">Wallet Adapter</div>
      <div className="flex flex-col w-auto justify-center pb-4">
        <WalletMultiButton />
        {/* <WalletDisconnectButton /> */}
      </div>
      {wallet.connected ? (
        <div className="flex flex-col w-auto gap-2 justify-center">
          <button
            className="bg-blue-500 text-white p-2 rounded-md"
            onClick={() => {
              navigate("/airdrop");
            }}
          >
            Airdrop
          </button>
          <button
            className="bg-blue-500 text-white p-2 rounded-md"
            onClick={() => {
              navigate("/send-tokens");
            }}
          >
            Send Tokens
          </button>
        </div>
      ) : (
        <div>Please connect your wallet first</div>
      )}
    </div>
  );
}

export default App;
