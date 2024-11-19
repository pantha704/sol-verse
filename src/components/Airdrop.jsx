import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Buffer } from "buffer";

window.Buffer = Buffer;

const Airdrop = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [amount, setAmount] = useState(0);
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();

  async function sendAirdropToUser() {
    try {
      await connection.requestAirdrop(
        wallet.publicKey,
        balance * LAMPORTS_PER_SOL
      );
    } catch (err) {
      alert(err);
      error = err;
    }

    if (!error) alert(`Airdropped ${amount} SOL successfully`);
  }

  async function getBalance() {
    if (wallet.publicKey) {
      setBalance(
        (await connection.getBalance(wallet.publicKey)) / LAMPORTS_PER_SOL
      );
    }
  }

  useEffect(() => {
    if (!wallet.publicKey) {
      setBalance(0);
      return;
    }
    if (!balance) {
      getBalance();
    }
  }, [wallet.publicKey, balance]);

  return (
    <div className="flex flex-col gap-2 justify-center items-center">
      <input
        className="border-2 rounded-md p-2 border-black"
        type="number"
        placeholder="Amount ( in SOL )"
        onChange={(e) => setAmount(e.target.value)}
        value={amount}
      />
      <button
        onClick={() =>
          amount > 0
            ? sendAirdropToUser()
            : alert("Amount must be greater than 0")
        }
      >
        Send
      </button>
      <br />
      <button onClick={getBalance}>Fetch Balance</button>
      {balance ? `You have ${balance} SOL in your wallet` : ""}
      <button
        className="bg-purple-500 text-white mt-6 rounded-md"
        onClick={() => navigate("/")}
      >
        Home
      </button>
    </div>
  );
};
export default Airdrop;