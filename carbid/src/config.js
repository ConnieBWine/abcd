// config.js
export const CONFIG = {
    VEHICLE_HISTORY_CONTRACT_ADDRESS: '0x1465822386967e182b95c670f6a34aa86abb6f88',
    SUPPORTED_CHAIN_IDS: [1337, 31337],
    RPC_URL: 'http://localhost:8545',
    DEFAULT_GAS_LIMIT: 500000,  // Increased default gas limit
    NETWORK_PARAMS: {
        chainId: '0x539', // 1337 in hex
        chainName: 'Ganache Local',
        rpcUrls: ['http://localhost:8545'],
        nativeCurrency: {
            name: 'ETH',
            symbol: 'ETH',
            decimals: 18
        }
    },
    ACCOUNT_ADDRESS: '0x78031CB9533b033F949A9725b7ac9107B6dd1334',
    PRIVATE_KEY: '0x4c0db826ed1cf63a9bb1a3b5193bb180c066dd71a307c4da1903ba01efcb333b',
    GAS_PRICE_BUFFER: 1.2, // 20% buffer for gas price
    TRANSACTION_TIMEOUT: 60000, // 60 seconds timeout
    MAX_RETRIES: 3 // Maximum number of retry attempts
};