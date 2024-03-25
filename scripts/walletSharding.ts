import * as bs58 from "bs58";

import * as solana from "@solana/web3.js";
import * as splToken from "@solana/spl-token";
import * as mplToken from "@metaplex-foundation/mpl-token-metadata";
import * as umi from '@metaplex-foundation/umi-bundle-defaults';

import * as config from "./walletShardingConfig.json";

const solanaNet = "devnet"
const solanaContractAddress = "So11111111111111111111111111111111111111112"

let mainWalletSecretKey: number[] | string | any = config.mainWalletSecretKey;

const sendToWalletPublicKeys: string[] = config.sendToWalletPublicKeys;
const tokenContractAddress: string = config.tokenContractAddress;
const tokenAmountPercentToSend: null | number = config.tokenAmountPercentToSend === null ? (100 / sendToWalletPublicKeys.length) : config.tokenAmountPercentToSend;
const enableLogs: boolean = config.enableLogs;
const timeBetweenTransfers: number = config.timeBetweenTransfers === null ? Math.floor(1000) : config.timeBetweenTransfers;


async function main() {
    console.log(`${"=".repeat(25)} WALLET SHARDING ${"=".repeat(25)}\n`);

    console.log(`Config:`);
    console.log(` - Token CA:\t${tokenContractAddress}`);
    console.log(` - Wallets:\t${sendToWalletPublicKeys.length}`);
    console.log(` - Send:\t${tokenAmountPercentToSend}% per wallet`);
    console.log(` - Time out:\t${timeBetweenTransfers} ms between transfer`);
    console.log(` - Logs:\t${enableLogs}\n`);

    let connection: solana.Connection = new solana.Connection(
        solana.clusterApiUrl(solanaNet),
        "confirmed",
    )

    if (!await connection.getEpochInfo()) { 
        process.exit()
    }

    if (typeof(mainWalletSecretKey) === "string") {
        mainWalletSecretKey = bs58.decode(mainWalletSecretKey)
    }
    else if (mainWalletSecretKey instanceof Array) {
        mainWalletSecretKey = bs58.encode(mainWalletSecretKey)
        mainWalletSecretKey = bs58.decode(mainWalletSecretKey)
    }
    else {
        process.exit()
    }

    const mainWalletKeyPair = solana.Keypair.fromSecretKey(mainWalletSecretKey)

    if (!mainWalletKeyPair.publicKey) { 
        process.exit()
    }

    console.log(`Main wallet public key: ${mainWalletKeyPair.publicKey}\n`)

    let MainWalletSolAmount = await connection.getBalance(mainWalletKeyPair.publicKey)

    console.log(`Main wallet $SOL:\t${MainWalletSolAmount / solana.LAMPORTS_PER_SOL}`)

    const TokenPublicKey = new solana.PublicKey(tokenContractAddress)

    const TokenAccountOwner = await connection.getTokenAccountsByOwner(
        mainWalletKeyPair.publicKey,
        {
            mint: TokenPublicKey,
            programId: splToken.TOKEN_PROGRAM_ID,
        },
    )

    let MainWalletTokenAmount = splToken.AccountLayout.decode(TokenAccountOwner.value[0].account.data).amount

    const TokenMint = await splToken.getMint(connection, TokenPublicKey);

    const TokenDecimals = 10 ** TokenMint.decimals

    console.log(`Main wallet token:\t${Number(MainWalletTokenAmount / BigInt(TokenDecimals))}\n`)

    if (MainWalletTokenAmount == BigInt(0)) {
        process.exit()
    }


    for (let wallet = 0; wallet < sendToWalletPublicKeys.length; wallet++) {
        console.log(`${wallet + 1}. Wallet ${sendToWalletPublicKeys[wallet]}`)
    }

    return;
}


(async () => {
    await main();
})();