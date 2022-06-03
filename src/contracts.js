import { ethers } from "ethers";
import AMMABI from "./abis/AMMABI.json";
import OrderBookABI from "./abis/OrderBookABI.json";
import ERC20JSON from "@openzeppelin/contracts/build/contracts/ERC20";
import { OPTIMISM_KOVAN_PROVIDER, SIGNER } from "./constants";

const {
  constants: { AddressZero },
} = ethers;

export const ORDER_BOOK = new ethers.Contract(
  "0xa1F3646ee48B2B2488366Fb30c4C22D6CFFad6F0",
  OrderBookABI,
  OPTIMISM_KOVAN_PROVIDER
);

export const AMM = new ethers.Contract(
  "0x0000000000000000000000000000000000000001",
  AMMABI,
  OPTIMISM_KOVAN_PROVIDER
);

export const MOONSHINE_BRIDGE = new ethers.Contract(
  "0x0000000000000000000000000000000000000001",
  ["function createWithdrawlRequest(int64 underlyingAmount, address token)"],
  SIGNER
);

export const MOONSHINE_AMM = new ethers.Contract(
  "0x0000000000000000000000000000000000000000",
  [
    "function buy(int64 amount, address token, int64 minimumOutputAmount)",
    "function sell(int64 amount, address token, int64 minimumOutputAmount)",
    "function addLiquidity(int64 amount, address token)",
    "function removeLiquidity(int64 percentage, address token)",
    "function createPool(int64 amount, address token, int64 initialPrice)",
  ],
  SIGNER
);
window.ethereumListeners = {};
export const PROVIDER = SIGNER.provider;
export const DECIMALS = 6;
