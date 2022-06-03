import classnames from "classnames"
import Modal from "./Modal";
import CreateSellOrder from "./CreateSellOrder";
import {ORDER_BOOK} from "./contracts"
import {ONE_XLM, SIGNER} from "./constants"
import CreateBuyOrder from "./CreateBuyOrder";
import {Button} from "./Button";
import {ethers} from "ethers";
import {useQueryEth} from "./ethereum"
import OrderActionButton from "./OrderActionButton"
import {useState, useEffect} from "react";

const {
  utils: {formatEther}
} = ethers;
var {
  StrKey: {decodeEd25519PublicKey},
} = window.StellarSdk;
export default function OrderBook() {
  const [modal, setModal] = useState()//"CreateSellOrder")
  const [publicKey, setPublicKey] = useState()
  useEffect(() => {
    async function run() {
      setPublicKey(await window.freighterApi.getPublicKey())
    }
    run()
  }, [])
  
  const orders = useQueryEth(
    ORDER_BOOK,
    async (orderBook) => {
      const sellOrdersLength = (await orderBook.getSellOrdersLength()).toNumber();
      return Promise.all(Array(sellOrdersLength).fill().map(async (_, orderId) => {
return {orderId, ...await orderBook.sellOrders(orderId)}
}))
    },
  );
  return <div className="card">
  <div className="card-header">
    Orders
  </div>
  <div className="card-body">
    <h5 className="card-title">Order Book</h5>
    <table className="table table-striped">
      <thead>
    <tr>
      <th scope="col">XLM Amount</th>
      <th scope="col">ETH Amount</th>
      <th scope="col">Price (XLM/ETH)</th>
    </tr>
  </thead>
  <tbody>
    {orders && orders.map((order) =>
    <tr key={order.orderId}>
      <td>{order.XLMAmount.toNumber()/Number(ONE_XLM)} XLM</td>
      <td>{formatEther(order.ETHAmount)} ETH</td>
      <td>
{(order.XLMAmount.toNumber()/Number(ONE_XLM))/parseFloat(formatEther(order.ETHAmount))} XLM/ETH</td>
      <td>
</td>
<td>
<OrderActionButton order={order} publicKey={publicKey}/>
</td>
    </tr>
    )}
  </tbody>

  </table>
    <button type="button" onClick={() => setModal("CreateBuyOrder")} className="btn btn-primary me-2">
  Create XLM Buy Order
</button>
<CreateSellOrder isOpen={modal=="CreateSellOrder"} close={() => setModal(null)}/>
<CreateBuyOrder isOpen={modal=="CreateBuyOrder"} publicKey={publicKey} close={() => setModal(null)}/>
  </div>
</div>
}
