import * as readline from "readline"
import * as bs58 from "bs58"
import * as sol from "@solana/web3.js"

const rl = readline.createInterface({input: process.stdin, output: process.stdout})

rl.question("Paste your private key array: ", (rawInput) => {
    let element: number
    let number: number
    let input: string[] = []
    let secretKey: number[] = []

    if (!rawInput.startsWith("[") || !rawInput.endsWith("]")) {
        console.error("\nPrivate key must be in brackets! Exit..")
        process.exit()
    }

    input = rawInput.split("[")
    input = input[1].split("]")
    input = input[0].split(",")

    if (input.length != 64) {
        console.error("\nPrivate key must be 64 numbers long! Exit..")
        process.exit()
    }

    for (number = 0; number < input.length; number++) {
        element = Number(input[number])

        if (isNaN(element)) {
            console.error("\nElements in private key must be numbers! Exit..")
            process.exit()
        }

        secretKey.push(element)
    }

    const walletKeyPair = sol.Keypair.fromSecretKey(bs58.decode(bs58.encode(secretKey)))

    console.log("\nSuccess! Your string private key ⇩")
    console.log(`${bs58.encode(walletKeyPair.secretKey)}`)

    rl.close()
})