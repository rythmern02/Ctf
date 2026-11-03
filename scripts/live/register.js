// Registers the wallet for the BuidlGuidl CTF (Season 1, Challenge 1).
// Usage: RPC_URL=<rpc> CHALLENGE1=<addr> NAME="lord voldemort" node scripts/live/register.js
import { JsonRpcProvider, Wallet, Contract } from "ethers";
import { readFileSync } from "fs";

const env = Object.fromEntries(
  readFileSync(new URL("../../.env", import.meta.url), "utf8")
    .split("\n").filter(Boolean).map((l) => l.split("=").map((s) => s.trim()))
);

const RPC_URL = process.env.RPC_URL;
const CHALLENGE1 = process.env.CHALLENGE1;
const NAME = process.env.NAME || "lord voldemort";
if (!RPC_URL || !CHALLENGE1) throw new Error("Set RPC_URL and CHALLENGE1 env vars");

const provider = new JsonRpcProvider(RPC_URL);
const wallet = new Wallet(env.PRIVATE_KEY, provider);

const abi = [
  "function registerMe(string _name) public",
  "function builderNames(address) view returns (string)",
];
const c = new Contract(CHALLENGE1, abi, wallet);

const net = await provider.getNetwork();
const bal = await provider.getBalance(wallet.address);
console.log(`Chain ${net.chainId} | ${wallet.address} | balance ${bal} wei`);
if (bal === 0n) throw new Error("Wallet has 0 balance on this chain — fund it first.");

console.log(`Registering as "${NAME}" on ${CHALLENGE1} ...`);
const tx = await c.registerMe(NAME);
console.log("tx sent:", tx.hash);
const r = await tx.wait();
console.log("confirmed in block", r.blockNumber, "status", r.status);
console.log("on-chain name:", await c.builderNames(wallet.address));
