import { ethers } from 'ethers';
import contractArtifact from '../contracts/HoneyChainABI.json';

const RPC_URL = process.env.RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;

function isConfigured() {
  return Boolean(RPC_URL && CONTRACT_ADDRESS);
}

function getProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

function getSigner() {
  if (!PRIVATE_KEY) throw new Error('PRIVATE_KEY is not set');
  return new ethers.Wallet(PRIVATE_KEY, getProvider());
}

function getContract(withSigner) {
  if (!isConfigured()) {
    throw new Error('Blockchain is not configured yet (RPC_URL / CONTRACT_ADDRESS missing)');
  }
  const signerOrProvider = withSigner ? getSigner() : getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, contractArtifact.abi, signerOrProvider);
}

/**
 * Deterministically hashes the batch data so the DB copy and the on-chain
 * copy can be compared to prove nothing was tampered with.
 */
export function computeDataHash(data) {
  const json = JSON.stringify(data);
  return ethers.keccak256(ethers.toUtf8Bytes(json));
}

/**
 * Writes the batch's hash to the smart contract. Throws if blockchain
 * env vars aren't set yet - callers should catch this and fall back to
 * "saved, not yet on-chain" so the app still works before you deploy
 * the contract.
 */
export async function registerBatchOnChain(batchId, dataHash) {
  const contract = getContract(true);
  const tx = await contract.registerBatch(batchId, dataHash);
  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
}

/**
 * Reads a batch's record back from the contract for the public
 * verification page. Returns null if not configured or not found.
 */
export async function getBatchFromChain(batchId) {
  if (!isConfigured()) return null;
  try {
    const contract = getContract(false);
    const result = await contract.getBatch(batchId);
    return {
      dataHash: result[0],
      timestamp: Number(result[1]),
      registeredBy: result[2],
    };
  } catch (err) {
    return null;
  }
}
