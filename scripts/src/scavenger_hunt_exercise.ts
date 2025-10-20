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
const suiAddress = keypair.getPublicKey().toSuiAddress();

const PACKAGE_ID = `0x9603a31f4b3f32843b819b8ed85a5dd3929bf1919c6693465ad7468f9788ef39`;
const VAULT_ID = `0x8d85d37761d2a4e391c1b547c033eb0e22eb5b825820cbcc0c386b8ecb22be33`;

const rpcUrl = getFullnodeUrl("testnet");
const suiClient = new SuiClient({ url: rpcUrl });

/**
 * Scavenger Hunt: Exercise 3
 *
 * In this exercise, you use Sui objects as inputs in a PTB to update the value of a shared object.
 *
 * When finished, run the following command in the scripts directory to test your solution:
 *
 * pnpm scavenger-hunt
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
   * Create a new key using the `key::new` function.
   */
  const key = tx.moveCall({
    target: `${PACKAGE_ID}::key::new`,
    typeArguments: [],
    arguments: [],
  });

  /**
   * Task 3:
   *
   * Set the key code correctly using the `key::set_code` function.
   */
  tx.moveCall({
    target: `${PACKAGE_ID}::key::set_code`,
    typeArguments: [],
    arguments: [key, tx.pure.u64(1504)],
  });

  /**
   * Task 4:
   *
   * Use the key to withdraw the `SUI` coin from the vault using the `vault::withdraw` function.
   */

  const sui = tx.moveCall({
    target: `${PACKAGE_ID}::vault::withdraw`,
    typeArguments: ["0x2::sui::SUI"],
    arguments: [tx.object(VAULT_ID), key],
  });
  
  // Loop 89 more times (90 total withdrawals)
  const suiCoins = [sui];
  for (let i = 0; i < 1; i++) {
    const loopKey = tx.moveCall({
      target: `${PACKAGE_ID}::key::new`,
      typeArguments: [],
      arguments: [],
    });

    tx.moveCall({
      target: `${PACKAGE_ID}::key::set_code`,
      typeArguments: [],
      arguments: [loopKey, tx.pure.u64(1504)],
    });

    const loopSui = tx.moveCall({
      target: `${PACKAGE_ID}::vault::withdraw`,
      typeArguments: ["0x2::sui::SUI"],
      arguments: [tx.object(VAULT_ID), loopKey],
    });

    suiCoins.push(loopSui);
  }

  /**
   * Task 5:
   *
   * Transfer the `SUI` coin to your account.
   */

  tx.transferObjects(suiCoins, suiAddress);



  /**
   * Task 6:
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
   * Task 7: Run the script with the command below and ensure it works!
   * 
   * pnpm scavenger-hunt
   * 
   * Verify the transaction on the Sui Explorer: https://suiscan.xyz/testnet/home
   */
};

main();
