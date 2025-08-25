import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Buffer } from "buffer";

window.Buffer = Buffer;

const Airdrop = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [amount, setAmount] = useState();
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
      <div className="text-2xl font-bold text-center mb-4">Airdrop</div>
      <form>
        <input
          className="border-2 rounded-md p-2 border-black w-auto"
          type="number"
          placeholder="Amount ( in SOL )"
          onChange={(e) => setAmount(e.target.value)}
          value={amount}
        />
        <p className="text-sm text-gray-500">Max 5 SOL at once</p>
        <button
          className="text-white hover:text-gray-300 m-2 w-20 rounded-md"
          type="submit"
          onClick={() =>
            amount > 0
              ? sendAirdropToUser()
              : alert("Amount must be greater than 0")
          }
        >
          Send
        </button>
      </form>
      <br />
      <button
        className="text-white hover:text-gray-300 w-auto"
        onClick={getBalance}
      >
        Fetch Balance
      </button>
      {balance ? `You have ${balance} SOL in your wallet` : ""}
      <button
        className="bg-purple-500 hover:bg-purple-700 text-white hover:text-gray-300 mt-6 rounded-md"
        onClick={() => navigate("/")}
      >
        Home
      </button>
    </div>
  );
};
export default Airdrop;
