import xrplService from './xrplService';
import loginHelper from '../db/loginHelper';
import { Wallet } from 'xrpl';

const getXrpBalance = async (username: string) => {
    const client = await xrplService.connect();

    let wallet: Wallet = undefined;
    try {
        // Check if username already has a wallet
        const loginResult = loginHelper(username);
        if (loginResult.wallet) {
            wallet = Wallet.fromSeed(loginResult.wallet.seed);
        }
    } catch(err) {
        throw new Error(`Cannot fund unregistered username: ${username}`)
    }

    const result = await client.getXrpBalance(wallet.address);

    xrplService.disconnect();
    return result;
}

export default getXrpBalance;
