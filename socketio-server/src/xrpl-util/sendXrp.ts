import { Wallet } from 'xrpl';
const xrpl = require('xrpl');
import xrplService from './xrplService';
import loginHelper from '../db/loginHelper';

const sendXrp = async (fromUsername, toUsername, xrp) => {
    const client = await xrplService.connect();

    const fromWallet = Wallet.fromSeed(loginHelper(fromUsername).wallet.seed);
    const toWallet = Wallet.fromSeed(loginHelper(toUsername).wallet.seed);

    const prepared = await client.autofill({
        "TransactionType": "Payment",
        "Account": fromWallet.address,
        "Amount": xrpl.xrpToDrops(xrp),
        "Destination": toWallet.address,
    });

    console.log('submitting payment...');

    const tx = await client.submitAndWait(prepared, { wallet: fromWallet });

    console.log('submit validated');

    xrplService.disconnect();
    return tx;
}

export default sendXrp;
