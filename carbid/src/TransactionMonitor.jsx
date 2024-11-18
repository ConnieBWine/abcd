import React from 'react';
import { useTransactionStatus } from '../hooks/useTransaction';

const TransactionMonitor = ({ hash }) => {
    const status = useTransactionStatus(hash);

    return (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm">
            <h3 className="font-bold mb-2">Transaction Status</h3>
            
            {status === 'success' && (
                <div className="text-green-600 flex items-center">
                    <FiCheckCircle className="mr-2" />
                    Transaction confirmed
                </div>
            )}
            
            {status === 'pending' && (
                <div className="text-yellow-600 flex items-center">
                    <FiClock className="mr-2 animate-spin" />
                    Transaction pending
                </div>
            )}
            
            {status === 'failed' && (
                <div className="text-red-600 flex items-center">
                    <FiXCircle className="mr-2" />
                    Transaction failed
                </div>
            )}
            
            <div className="mt-2 text-sm text-gray-600">
                <a 
                    href={`https://etherscan.io/tx/${hash}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                >
                    View on Etherscan
                </a>
            </div>
        </div>
    );
};

export default TransactionMonitor;