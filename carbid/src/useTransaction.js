import { useState, useCallback } from 'react';
import { useWeb3React } from '@web3-react/core';

export const useTransaction = () => {
    const { library } = useWeb3React();
    const [pending, setPending] = useState(false);
    const [hash, setHash] = useState(null);
    const [receipt, setReceipt] = useState(null);
    const [error, setError] = useState(null);

    const execute = useCallback(async (transaction) => {
        try {
            setPending(true);
            setHash(null);
            setReceipt(null);
            setError(null);

            const tx = await transaction();
            setHash(tx.hash);

            const receipt = await tx.wait();
            setReceipt(receipt);

            return receipt;
        } catch (error) {
            setError(error);
            throw error;
        } finally {
            setPending(false);
        }
    }, [library]);

    return {
        execute,
        // src/hooks/useTransaction.js (continued)
        pending,
        hash,
        receipt,
        error
    };
};

// Add transaction status tracking
export const useTransactionStatus = (hash) => {
    const { library } = useWeb3React();
    const [status, setStatus] = useState(null);

    useEffect(() => {
        if (!hash || !library) return;

        const checkStatus = async () => {
            try {
                const receipt = await library.getTransactionReceipt(hash);
                if (receipt) {
                    setStatus(receipt.status ? 'success' : 'failed');
                }
            } catch (error) {
                setStatus('error');
            }
        };

        const interval = setInterval(checkStatus, 1000);
        return () => clearInterval(interval);
    }, [hash, library]);

    return status;
};