import {ORDER_BOOK} from "./contracts"
import {ONE_XLM, SIGNER} from "./constants.js"
import {Button} from "./Button";
import {bufferToHex, hexToBuffer} from "./utils.js";
import {useState, useEffect} from "react";
import {ethers} from "ethers";
var {
  Asset,
  Keypair,
  Server,
  Transaction,
  TransactionBuilder,
  Operation,
  Memo,
  Networks,
  StrKey: {decodeEd25519PublicKey, encodeEd25519PublicKey, encodeSha256Hash, encodePreAuthTx},
} = window.StellarSdk;
const {
  constants: {HashZero},
  utils: {arrayify, hexlify, sha256}
} = ethers;

export default function OrderActionButton(props) {
  const {order, publicKey} = props
  // const publicKey = decodeEd25519PublicKey(await window.freighterApi.getPublicKey());
  const initiateSwap = async (e) => {
    const preImage = new Uint32Array(8);
    window.crypto.getRandomValues(preImage);
    const hashOfSecret = hexToBuffer(sha256(`0x${bufferToHex(preImage.buffer)}`).slice(2))
    const takerKeyPublicKey = encodeEd25519PublicKey(hexToBuffer(order.makerXLMAddress.slice(2), "hex")); 
    const server = new Server("https://horizon-testnet.stellar.org");
    const makerAccount = await server.loadAccount(publicKey);
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
            ed25519PublicKey: publicKey,
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
            ed25519PublicKey: takerKeyPublicKey,
            weight: 1,
          },
          source: escrowKeyPair.publicKey(),
        })
      )
      .setTimeout(180)
      .build();

    // createEscrowTransaction.sign(makerKeyPair)
    createEscrowTransaction.sign(escrowKeyPair);
    const signedTransaction = await window.freighterApi.signTransaction(createEscrowTransaction.toXDR(), "TESTNET")
    // await server.submitTransaction(createEscrowTransaction);
    await server.submitTransaction(TransactionBuilder.fromXDR(signedTransaction, "https://horizon-testnet.stellar.org"));

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
          destination: takerKeyPublicKey
        })
      )
      .setExtraSigners(
        [
          encodeSha256Hash(hashOfSecret)
        ]
      )
      .setTimeout(180)
      .build();
    const signedTransaction2 = await window.freighterApi.signTransaction(swapTransaction.toXDR(), "TESTNET")
    // const transaction = new Transaction(swapTransaction.toXDR(), "TESTNET");
    
    // swapTransaction.
    // swapTransaction.sign(makerKeyPair)
    // swapTransaction.sign(takerKeyPair)
    // swapTransaction.signHashX(secret);
    // await server.submitTransaction(swapTransaction);
  }

  const acceptOffer = async (e) => {
    const escrowAccount = await server.loadAccount(escrowKeyPair.publicKey());
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
  }

  if (order.takerXLMAddress === HashZero) {
    return <Button onClick={initiateSwap}>Initiate Swap</Button>
  } else if (true) {
    return <Button className="btn btn-success" onClick={acceptOffer}>Accept Offer</Button>
  }
}
