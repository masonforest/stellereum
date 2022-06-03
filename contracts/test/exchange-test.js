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

describe("exchange", function () {
  it("allows user to exchange tokens", async function () {
    const secret = crypto.randomBytes(32);
    const hashOfSecret = crypto.createHash("sha256").update(secret).digest();
    const [maker, taker] = await hre.ethers.getSigners();
    const makerKeyPair = Keypair.fromSecret(
      "SA5MOCJFK63VVC5JPW3MFDCJKXAGSRKX3KGO727JU6GXIR7U5QB6VLLP"
    );
    const takerKeyPair = Keypair.fromSecret(
      "SCY2ESVKLTZH5RZWGABE5FRRZEQEKLVAPDAUP3XKZ462BDWWGDB24YGN"
    );
    const server = new Server("https://horizon-testnet.stellar.org");
    const serverAccount = await server.loadAccount(makerKeyPair.publicKey());
    const escrowKeyPair = Keypair.random();
    const fee = await server.fetchBaseFee();
    let transaction = new TransactionBuilder(serverAccount, {
      fee,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.createAccount({
          destination: escrowKeyPair.publicKey(),
          startingBalance: "3.5000000",
        })
      )
      .setTimeout(180)
      .build();
    transaction.sign(makerKeyPair);
    await server.submitTransaction(transaction);
    const escrowAccount = await server.loadAccount(escrowKeyPair.publicKey());
    let escrowTransaction = new TransactionBuilder(escrowAccount, {
      fee,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.setOptions({
          signer: {
            ed25519PublicKey: makerKeyPair.publicKey(),
            weight: 1,
          },
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
        })
      )
      .setTimeout(180)
      .build();
    escrowTransaction.sign(escrowKeyPair);
    await server.submitTransaction(escrowTransaction);

    swapTransaction = new TransactionBuilder(escrowAccount, {
      fee,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.payment({
          amount: "1",
          asset: Asset.native(),
          destination: takerKeyPair.publicKey(),
        })
      )
      .setExtraSigners(
        [
          encodePreAuthTx(escrowTransaction.hash()),
          encodeSha256Hash(hashOfSecret)
        ]
      )
      .setTimeout(180)
      .build();
    transaction.sign(makerKeyPair);
    transaction.sign(takerKeyPair);
    transaction.signHashX(secret);
    await server.submitTransaction(transaction);

    const OrderBook = await ethers.getContractFactory("OrderBook");
    const orderBook = await OrderBook.deploy();
    await orderBook.deployed();
    const listTx = await orderBook.list(
      1,
      1,
      hashOfSecret,
      escrowKeyPair.rawPublicKey()
    );
    await listTx.wait();
    const timestamp = (
      await ethers.provider.getBlock(await ethers.provider.getBlockNumber())
    ).timestamp;
    const initiateSwapTx = await orderBook.connect(taker).initiateSwap(
      0,
      takerKeyPair.rawPublicKey(),
      {
        value: 1,
      }
    );
    await initiateSwapTx.wait();
    const executeSwapTx = await orderBook.connect(maker).executeSwap(0, secret);
    await executeSwapTx.wait();
  });
});
