import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { decodeSuiPrivateKey } from "@mysten/sui/cryptography";
import keyPairJson from "../keypair.json";

/**
 *
 * Global variables
 *
 * These variables are used throughout the exercise below.
 *
 */
const { secretKey } = decodeSuiPrivateKey(keyPairJson.privateKey);
const keypair = Ed25519Keypair.fromSecretKey(secretKey);

const PACKAGE_ID = `0xb3491c9657444a947c97d7eeccff0d4988b432f8a37e7f9a26fb6ed4fbc3df9a`;

const COUNTER_OBJECT_ID = `0x8a6f2bc3af32c71a93a35d397fd47c14f67b7aa252002c907df9b172e95c0ec6`;

const rpcUrl = getFullnodeUrl("testnet");
const suiClient = new SuiClient({ url: rpcUrl });

/**
 * Objects as input: Exercise 1
 *
 * In this exercise, you use Sui objects as inputs in a PTB to update the value of a shared object.
 *
 * When finished, run the following command in the scripts directory to test your solution:
 *
 * pnpm input-objects
 *
 * RESOURCES:
 * - https://sdk.mystenlabs.com/typescript/transaction-building/basics#transactions
 */
const main = async () => {
  /**
   * Task 1:
   *
   * Create a new Transaction instance from the @mysten/sui/transactions module.
   */

  const tx = new Transaction();

  /**
   * Task 2:
   *
   * Create a coin to pay the fee for incrementing the counter.
   * Based on the counter.move file, we need to provide a SUI coin with at least the minimum fee (10).
   * We use the `splitCoins` function to create a coin with the minimum fee from our gas fee.
   *
   * Resources:
   * - SplitCoins: https://sdk.mystenlabs.com/typescript/transaction-building/basics
   */

  const fee = tx.splitCoins(tx.gas, [tx.pure.u64(10)]);
  const counter = tx.object(COUNTER_OBJECT_ID);

  /**
   * Task 3:
   *
   * Execute the call to the `counter::increment` function to the transaction instance.
   *
   * The target should be in the format {package address}::{module name}::{function name}. The
   * package address is provided above. The module name is `counter` and the function name is
   * `increment`.
   *
   * Resources:
   * - Object inputs: https://sdk.mystenlabs.com/typescript/transaction-building/basics#object-references
   */

  tx.moveCall({
    target: `${PACKAGE_ID}::counter::increment`,
    typeArguments: [],
    arguments: [counter, fee],
  });


  /**
   * Task 4:
   *
   * Sign and execute the transaction using the SuiClient instance created above.
   *
   * Print the result to the console.
   *
   * Resources:
   * - Observing transaction results: https://sdk.mystenlabs.com/typescript/transaction-building/basics#observing-the-results-of-a-transaction
   */

  const result = await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
  });

  console.log(result);
  console.log(`https://suiscan.xyz/testnet/tx/${result.digest}`);
  

  /**
   * Task 5: Run the script with the command below and ensure it works!
   * 
   * pnpm input-objects
   * 
   * Verify the transaction on the Sui Explorer: https://suiscan.xyz/testnet/home
   */
};

main();
