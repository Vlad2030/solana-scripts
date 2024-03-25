import * as solana from "@solana/web3.js";


function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

async function checkWallets(
        connection: solana.Connection,
        walletToCheckSecretKey: Uint8Array,
        walletToSendPublicKey: string,
) {
    console.log(`started checking..`)

    const WalletToCheck = solana.Keypair.fromSecretKey(walletToCheckSecretKey)

    while (true) {
        let walletBalanceLamports = await connection.getBalance(WalletToCheck.publicKey)
        let minumumBalanceForRent = await connection.getMinimumBalanceForRentExemption(walletToCheckSecretKey.length)

        console.log(`found ${walletBalanceLamports / solana.LAMPORTS_PER_SOL} (${walletBalanceLamports}) SOL`)

        if (walletBalanceLamports >= minumumBalanceForRent) {
            console.log(`sending..`)
            
            let transaction = new solana.Transaction()

            transaction.add(
                solana.SystemProgram.transfer({
                    fromPubkey: WalletToCheck.publicKey,
                    toPubkey: new solana.PublicKey(walletToSendPublicKey),
                    lamports: Math.floor(walletBalanceLamports - minumumBalanceForRent),
                }),
            );

            try {
                await solana.sendAndConfirmTransaction(connection, transaction, [WalletToCheck])
                console.log(`sended ${Math.floor(walletBalanceLamports - minumumBalanceForRent) / solana.LAMPORTS_PER_SOL} SOL!`)
            }
            catch (exception) {
                console.log(exception)
            }
        }

        await delay(1000);
    }
}

async function checkFewWallets(
        connection: solana.Connection,
        walletsToCheckSecretKey: Uint8Array[],
        walletToSendPublicKey: string,
) {
    console.log(`started checking..`)

    let walletToCheckKeypairList: solana.Keypair[] = []

    for (let wallets = 0; wallets < walletsToCheckSecretKey.length; wallets++) {
        const walletToCheckKeypair = solana.Keypair.fromSecretKey(walletsToCheckSecretKey[wallets])
        walletToCheckKeypairList.push.apply(walletToCheckKeypairList, walletToCheckKeypair)
    }


    while (true) {
        for (let wallets = 0; wallets < walletToCheckKeypairList.length; wallets++) {
            let walletBalanceLamports = await connection.getBalance(walletToCheckKeypairList[wallets].publicKey)
            let minumumBalanceForRent = await connection.getMinimumBalanceForRentExemption(walletsToCheckSecretKey[wallets].length)
        
            console.log(
                `${walletToCheckKeypairList[wallets].publicKey}\t`,
                `| found ${walletBalanceLamports / solana.LAMPORTS_PER_SOL} (${walletBalanceLamports}) SOL`
            )
        
            if (walletBalanceLamports >= minumumBalanceForRent) {
                console.log(`${walletToCheckKeypairList[wallets].publicKey}\t| sending..`)
                
                let transaction = new solana.Transaction()
    
                transaction.add(
                    solana.SystemProgram.transfer({
                        fromPubkey: walletToCheckKeypairList[wallets].publicKey,
                        toPubkey: new solana.PublicKey(walletToSendPublicKey),
                        lamports: Math.floor(walletBalanceLamports - minumumBalanceForRent),
                    }),
                );

                try {
                    await solana.sendAndConfirmTransaction(connection, transaction, [walletToCheckKeypairList[wallets]])
                    console.log(
                        `${walletToCheckKeypairList[wallets].publicKey}\t| sended `,
                        `${Math.floor(walletBalanceLamports - minumumBalanceForRent) / solana.LAMPORTS_PER_SOL} SOL!`
                    )
                }
                catch (exception) {
                    console.log(exception)
                }
            }
            await delay(100);
        }
    }
}

async function main() {
    let connection = new solana.Connection(solana.clusterApiUrl("mainnet-beta"), "confirmed")

    const walletToCheckSecretKey = Uint8Array.from([])
    const walletToSendPublicKey = ""

    await checkWallets(connection, walletToCheckSecretKey, walletToSendPublicKey);
}

(async() => {
    await main();
})();
