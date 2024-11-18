import { ethers } from 'ethers';

export class AuthenticationService {
    static async generateNonce() {
        return Math.floor(Math.random() * 1000000).toString();
    }

    static async signMessage(message, provider) {
        try {
            const signer = provider.getSigner();
            const signature = await signer.signMessage(message);
            return signature;
        } catch (error) {
            console.error('Error signing message:', error);
            throw error;
        }
    }

    static async verifySignature(message, signature, address) {
        try {
            const recoveredAddress = ethers.utils.verifyMessage(message, signature);
            return recoveredAddress.toLowerCase() === address.toLowerCase();
        } catch (error) {
            console.error('Error verifying signature:', error);
            return false;
        }
    }
}