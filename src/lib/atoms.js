import { atom, selector } from "recoil";
import axios from "axios";

export const rpcStringState = atom({
  key: "rpcStringState",
  default: "devnet",
});

export const swapQuote = selector({
  key: "swapQuote",
  get: async () => {
    try {
      const response = await axios.get(
        "https://quote-api.jup.ag/v6/quote?inputMint=So11111111111111111111111111111111111111112&outputMint=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&amount=100000000&slippageBps=50"
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch swap quote:", error);
      throw new Error("Failed to fetch swap quote");
    }
  },
});
