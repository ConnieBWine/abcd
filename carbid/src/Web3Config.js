// Create a new file: src/utils/web3Config.js

import { InjectedConnector } from '@web3-react/injected-connector';
import { ethers } from 'ethers';

export const injectedConnector = new InjectedConnector({
  supportedChainIds: [1337], // Local Ganache network
});

export const getContract = async (address, abi) => {
  try {
    if (typeof window.ethereum !== 'undefined') {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      return new ethers.Contract(address, abi, signer);
    }
    throw new Error('No Ethereum wallet detected');
  } catch (error) {
    console.error('Error initializing contract:', error);
    throw error;
  }
};

export const VEHICLE_HISTORY_ABI = [
  // Add the ABI from your compiled VehicleHistory.sol contract
  // You can get this from Remix IDE after compilation
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "vin",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "serviceType",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "description",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "documentHash",
        "type": "string"
      }
    ],
    "name": "addServiceRecord",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
];