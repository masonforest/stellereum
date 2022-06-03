const chai = require("chai");
const crypto = require("crypto");
const {expect} = chai;
const {ethers} = require("hardhat");
const {BigNumber} = require("ethers");
const {solidity} = require("ethereum-waffle");
const hre = require("hardhat");

var {
  Asset,
  Keypair,
  Server,
  TransactionBuilder,
  Operation,
  Networks,
  StrKey: {encodeSha256Hash, encodePreAuthTx},
} = require("stellar-sdk");
chai.use(solidity);

describe("stellar htlc", function () {
  it.only("works", async function () {
    const secret = crypto.randomBytes(32);
    const hashOfSecret = crypto.createHash("sha256").update(secret).digest();
    const [maker, taker] = await hre.ethers.getSigners();
    const makerKeyPair = Keypair.fromSecret(
      "SBYWX5W5CDKPCHDL3C5TZAKLC54KR6CRWGBMLHTLGCUP34D3XGHEV6AO"
    );
    const takerKeyPair = Keypair.fromSecret(
      "SBPPHF46DA2VG6OHC36XSXMVWRMN7KBKDLAW5BGERERFGK3A7NMV4ENU"
    );
    const server = new Server("https://horizon-testnet.stellar.org");
    const makerAccount = await server.loadAccount(makerKeyPair.publicKey());
    const escrowKeyPair = Keypair.random();
    const fee = await server.fetchBaseFee();
    const createEscrowTransaction = new TransactionBuilder(makerAccount, {
      fee,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.createAccount({
          destination: escrowKeyPair.publicKey(),
          startingBalance: "5.0000000",
        })
      )
      .addOperation(
        Operation.setOptions({
          signer: {
            ed25519PublicKey: makerKeyPair.publicKey(),
            weight: 1,
          },
          source: escrowKeyPair.publicKey(),
        })
      )
      .addOperation(
        Operation.setOptions({
          masterWeight: 0,
          lowThreshold: 2,
          medThreshold: 2,
          highThreshold: 2,
          signer: {
            ed25519PublicKey: takerKeyPair.publicKey(),
            weight: 1,
          },
          source: escrowKeyPair.publicKey(),
        })
      )
      .setTimeout(180)
      .build();

    createEscrowTransaction.sign(makerKeyPair)
    createEscrowTransaction.sign(escrowKeyPair);
    await server.submitTransaction(createEscrowTransaction);

    const escrowAccount = await server.loadAccount(escrowKeyPair.publicKey());
    // let refundTransaction = new TransactionBuilder(escrowAccount, {
    //   fee,
    //   networkPassphrase: Networks.TESTNET,
    // })
    //   .addOperation(
    //     Operation.accountMerge({
    //       destination: makerKeyPair.publicKey()
    //     })
    //   )
    //   .setTimeout(180)
    //   .build();
    // refundTransaction.sign(makerKeyPair)
    // refundTransaction.sign(takerKeyPair)
    // await server.submitTransaction(refundTransaction);
    let swapTransaction = new TransactionBuilder(escrowAccount, {
      fee,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.accountMerge({
          destination: takerKeyPair.publicKey()
        })
      )
      .setExtraSigners(
        [
          encodeSha256Hash(hashOfSecret)
        ]
      )
      .setTimeout(180)
      .build();
    swapTransaction.sign(makerKeyPair)
    swapTransaction.sign(takerKeyPair)
    swapTransaction.signHashX(secret);
    await server.submitTransaction(swapTransaction);

    

    

    // const escrowAccount = await server.loadAccount(escrowKeyPair.publicKey());
    // let escrowTransaction = new TransactionBuilder(escrowAccount, {
    //   fee,
    //   networkPassphrase: Networks.TESTNET,
    // })
    //   .addOperation(
    //     Operation.setOptions({
    //       signer: {
    //         ed25519PublicKey: makerKeyPair.publicKey(),
    //         weight: 1,
    //       },
    //     })
    //   )
    //   .addOperation(
    //     Operation.setOptions({
    //       masterWeight: 0,
    //       lowThreshold: 2,
    //       medThreshold: 2,
    //       highThreshold: 2,
    //       signer: {
    //         ed25519PublicKey: takerKeyPair.publicKey(),
    //         weight: 1,
    //       },
    //     })
    //   )
    //   .setTimeout(180)
    //   .build();
    // escrowTransaction.sign(escrowKeyPair);
    // await server.submitTransaction(escrowTransaction);
    //
    // swapTransaction = new TransactionBuilder(escrowAccount, {
    //   fee,
    //   networkPassphrase: Networks.TESTNET,
    // })
    //   .addOperation(
    //     Operation.payment({
    //       amount: "1",
    //       asset: Asset.native(),
    //       destination: takerKeyPair.publicKey(),
    //     })
    //   )
    //   .setExtraSigners(
    //     [
    //       encodePreAuthTx(escrowTransaction.hash()),
    //       encodeSha256Hash(hashOfSecret)
    //     ]
    //   )
    //   .setTimeout(180)
    //   .build();
    // transaction.sign(makerKeyPair);
    // transaction.sign(takerKeyPair);
    // transaction.signHashX(secret);
    // await server.submitTransaction(transaction);

  });
});
