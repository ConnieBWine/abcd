// web3.js
import { ethers } from 'ethers';
import { CONFIG } from './config';

export const getProvider = async () => {
  if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      
      if (!CONFIG.SUPPORTED_CHAIN_IDS.includes(network.chainId)) {
        throw new Error(`Please connect to a supported network. Current chainId: ${network.chainId}`);
      }
      
      return provider;
    } catch (error) {
      console.error('Provider error:', error);
      throw new Error('Failed to initialize Web3 provider');
    }
  }
  return new ethers.providers.JsonRpcProvider(CONFIG.RPC_URL);
};

export const getSigner = async () => {
  try {
    const provider = await getProvider();
    await provider.send("eth_requestAccounts", []);
    return provider.getSigner();
  } catch (error) {
    console.error('Signer error:', error);
    throw new Error('Failed to get signer');
  }
};

export const getContract = async (address, abi, signerOrProvider) => {
  try {
    const contract = new ethers.Contract(address, abi, signerOrProvider);
    await contract.deployed(); // Verify contract exists
    return contract;
  } catch (error) {
    console.error('Contract error:', error);
    throw new Error('Failed to initialize contract');
  }
};