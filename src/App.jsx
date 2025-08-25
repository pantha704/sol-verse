import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useRecoilValue } from "recoil";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "./App.css";
// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";
import Airdrop from "./components/Airdrop";
import { Transfer } from "./components/Transfer";
import WalletAdapter from "./components/Home";
import { clusterApiUrl } from "@solana/web3.js";
import { rpcStringState } from "./lib/atoms";
import Swap from "./components/Swap";
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
                  <Route
                    path="/airdrop"
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <Airdrop />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/transfer"
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <Transfer />
                      </Suspense>
                    }
                  />
                  <Route
                    path="/swap"
                    element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <Swap />
                      </Suspense>
                    }
                  />
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
