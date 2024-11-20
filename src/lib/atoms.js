import { atom } from "recoil";

export const rpcStringState = atom({
  key: "rpcStringState",
  default: "devnet",
});
