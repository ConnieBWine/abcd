// Create a new file: src/utils/ipfsService.js

import { create } from 'ipfs-http-client';

const auth = 'Basic ' + Buffer.from(
    process.env.REACT_APP_IPFS_PROJECT_ID + ':' + process.env.REACT_APP_IPFS_PROJECT_SECRET
).toString('base64');

const client = create({
    host: 'ipfs.infura.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});

// ipfsService.js
const uploadToIPFS = async (files) => {
    try {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        const response = await axios.post('/api/ipfs/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (!response.data || !response.data.hash) {
            throw new Error('Invalid IPFS upload response');
        }

        return response.data;
    } catch (error) {
        console.error('IPFS upload error:', error);
        throw new Error('Failed to upload files to IPFS');
    }
};

export const getFromIPFS = async (hash) => {
    try {
        const stream = client.cat(hash);
        const chunks = [];
        for await (const chunk of stream) {
            chunks.push(chunk);
        }
        return Buffer.concat(chunks);
    } catch (error) {
        console.error('Error fetching from IPFS:', error);
        throw error;
    }
};