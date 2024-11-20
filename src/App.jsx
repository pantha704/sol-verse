import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useRecoilValue } from "recoil";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "./App.css";
// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";
import Airdrop from "./components/Airdrop";
import { SendTokens } from "./components/SendTokens";
import WalletAdapter from "./components/WalletAdapter";
import { clusterApiUrl } from "@solana/web3.js";
import { rpcStringState } from "./lib/atoms";

function App() {
  const rpcString = useRecoilValue(rpcStringState);

  return (
    <BrowserRouter>
      <ConnectionProvider endpoint={clusterApiUrl(rpcString)}>
        <WalletProvider wallets={[]} autoConnect>
          <WalletModalProvider>
            <div className="flex flex-col gap-2 items-center justify-center">
              <div className="w-full max-w-md mx-auto">
                <Routes>
                  <Route
                    path="/"
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <WalletAdapter />
                      </Suspense>
                    }
                  />
                  <Route path="/airdrop" element={<Airdrop />} />
                  <Route path="/send-tokens" element={<SendTokens />} />
                </Routes>
              </div>
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </BrowserRouter>
  );
}

export default App;
