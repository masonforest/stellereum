import Modal from "./Modal";
import {useState} from "react";
import {ethers} from "ethers";
import {bufferToHex} from "./utils.js";
import {ONE_XLM, SIGNER} from "./constants.js"
import TokenAmountInput from "./TokenAmountInput";
import {ORDER_BOOK} from "./contracts.js"
import {Button} from "./Button";

var {
  Asset,
  Keypair,
  Server,
  TransactionBuilder,
  Operation,
  Memo,
  Networks,
  StrKey: {encodeSha256Hash, encodePreAuthTx},
} = window.StellarSdk;
const {
  utils: {parseEther, sha256}
} = ethers;

export default function CreateSellOrder(props) {
  const {isOpen, close} = props
  const [isLoading, setIsLoading] = useState(false)
  const [xlmAmount, setXlmAmount] = useState(BigInt(Number(ONE_XLM)*7.5))
  const [ethAmount, setEthAmount] = useState(parseEther("0.0005").toBigInt())
  const createOrder = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const seed = new Uint32Array(8);
    window.crypto.getRandomValues(seed);
    const publicKey = await window.freighterApi.getPublicKey();
    const server = new Server("https://horizon-testnet.stellar.org");
    const serverAccount = await server.loadAccount(publicKey);
    const escrowKeyPair = Keypair.random();
    const fee = await server.fetchBaseFee();
    let transaction = new TransactionBuilder(serverAccount, {
      fee,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.createAccount({
          destination: escrowKeyPair.publicKey(),
          startingBalance: ((parseInt(xlmAmount) + Number(ONE_XLM))/Number(ONE_XLM)).toString(),
        })
      )
      .addMemo(Memo.hash(bufferToHex(seed.buffer)))
      .setTimeout(180)
      .build();
    const signedTransaction = await window.freighterApi.signTransaction(transaction.toXDR(), "TESTNET")
    await server.submitTransaction(TransactionBuilder.fromXDR(signedTransaction, "https://horizon-testnet.stellar.org"));
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
const account = accounts[0];
const signature = await ethereum.request({ method: 'personal_sign', params: [ `0x${bufferToHex(seed.buffer)}`, account ] }); 
    const preImage = sha256(signature)
    const hash = sha256(preImage)
    const listTx = await ORDER_BOOK.connect(SIGNER).list(
      xlmAmount,
      ethAmount,
      hash,
      `0x${bufferToHex(escrowKeyPair.rawPublicKey())}`
    );
    await listTx.wait();
    setIsLoading(false)
    close()
  }
  return <Modal show={isOpen}>
      <div className="modal-header">
        <h5 className="modal-title">Create XLM Sell Order</h5>
        <button
          type="button"
          aria-label="Close"
          className="btn-close"
          onClick={close}
        />
      </div>
      <div className="modal-body">
<form>
  <div className="form-group mb-2">
  <TokenAmountInput
  label="XLM Amount"
        onChange={(xlmAmount) => setXlmAmount(xlmAmount)}
        decimals={6}
        options={{defaultValue: "7.5"}}
        value={xlmAmount}
        />
  <TokenAmountInput
  label="ETH Amount"
        onChange={(ethAmount) => setEthAmount(ethAmount)}
        decimals={18}
        options={{defaultValue: "0.0005"}}
        value={ethAmount}
        />
  </div>
  <Button loading={isLoading} onClick={createOrder} className="btn btn-primary">Submit</Button>
</form>
      
      </div>
</Modal>
}
