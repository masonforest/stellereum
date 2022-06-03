
import {useState} from "react";
import {ONE_XLM, SIGNER} from "./constants.js"
import {bufferToHex} from "./utils.js";
import {ORDER_BOOK} from "./contracts.js"
import TokenAmountInput from "./TokenAmountInput";
import {Button} from "./Button";
import {ethers} from "ethers";
import Modal from "./Modal";
const {
  utils: {parseEther, sha256}
} = ethers;
var {
  Asset,
  Keypair,
  Server,
  TransactionBuilder,
  Operation,
  Memo,
  Networks,
  StrKey: {decodeEd25519PublicKey, encodeEd25519PublicKey, encodeSha256Hash, encodePreAuthTx},
} = window.StellarSdk;

export default function CreateBuyOrder(props) {
  const {isOpen, close, publicKey} = props
  const [isLoading, setIsLoading] = useState(false)
  const [xlmAmount, setXlmAmount] = useState(BigInt(Number(ONE_XLM)*7.5))
  const [ethAmount, setEthAmount] = useState(parseEther("0.0005").toBigInt())
  const createBuyOrder = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const seed = new Uint32Array(8);
    window.crypto.getRandomValues(seed);
    console.log(`0x${bufferToHex(decodeEd25519PublicKey(publicKey).buffer)}`)
  console.log([
      xlmAmount,
      `0x${bufferToHex(decodeEd25519PublicKey(publicKey).buffer)}`,
])
    const listTx = await ORDER_BOOK.connect(SIGNER).list(
      xlmAmount,
      `0x${bufferToHex(decodeEd25519PublicKey(publicKey).buffer)}`,
     {value: ethAmount});
    await listTx.wait();
    setIsLoading(false)
    close()
  }
  return <Modal show={isOpen}>
      <div className="modal-header">
        <h5 className="modal-title">Create XLM Buy Order</h5>
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
    <Button loading={isLoading} onClick={createBuyOrder} className="btn btn-primary">Submit</Button>
  </form>
        
      </div>
</Modal>
}
