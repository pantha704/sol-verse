import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
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
import { useRecoilState } from "recoil";
import { rpcStringState } from "../lib/atoms";

function WalletAdapter() {
  const [rpcString, setRpcString] = useRecoilState(rpcStringState);

  const connection = useConnection();
  const wallet = useWallet();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-2 items-center justify-center">
      <div className="text-2xl font-bold text-center mb-4">Wallet Adapter</div>
      <div className="text-center mb-4 font-semibold">
        ON{" "}
        <select
          className="m-2 font-bold text-center p-1 rounded-lg"
          onChange={(e) => setRpcString(e.target.value)}
          value={rpcString}
        >
          <option value="devnet">Devnet</option>
          <option value="mainnet-beta">Mainnet-Beta</option>
          <option value="testnet">Testnet</option>
        </select>
      </div>
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

export default WalletAdapter;
