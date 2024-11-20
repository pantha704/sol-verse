import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Buffer } from "buffer";

window.Buffer = Buffer;

const Airdrop = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [amount, setAmount] = useState(2.5);
  const [balance, setBalance] = useState(0);
  const navigate = useNavigate();

  async function sendAirdropToUser() {
    try {
      await connection.requestAirdrop(
        wallet.publicKey,
        amount * LAMPORTS_PER_SOL
      );
      alert(`Airdropped ${amount} SOL successfully`);
    } catch (err) {
      alert(err.message);
    }
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
      <p className="text-sm text-gray-500">
        (Try airdropping not more than 5 SOL, else it will fail)
      </p>
      <button
        className="text-white m-2 rounded-md"
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
