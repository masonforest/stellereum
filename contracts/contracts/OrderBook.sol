// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.13 <0.9.0;

contract OrderBook {
    uint256 sellOrderIdCounter;

    struct SellOrder { 
        address makerETHAddress;
        bytes32 makerXLMAddress;
        address takerETHAddress;
        bytes32 takerXLMAddress;
        uint64 XLMAmount;
        uint256 ETHAmount;
        uint256 listedAt;
        bytes32 hashOfSecret;
        bytes32 signature;
    }

    SellOrder[] public sellOrders;

    function list(uint64 XLMAmount, bytes32 makerXLMAddress) public payable {   
        sellOrders.push(
          SellOrder ({
              makerETHAddress: msg.sender,
              makerXLMAddress: makerXLMAddress,
              XLMAmount: XLMAmount,
              ETHAmount: msg.value,
              listedAt: block.timestamp,
              hashOfSecret: 0,
              takerETHAddress: address(0),
              takerXLMAddress: 0,
              signature: 0
          })
        );
    }

    function getSellOrdersLength() public view returns (uint256) {
        return sellOrders.length;
    }

    function initiateSwap(uint256 sellOrderId, bytes32 takerXLMAddress, bytes32 signature) public {
      SellOrder storage sellOrder = sellOrders[sellOrderId];
      sellOrder.takerETHAddress = msg.sender;
      sellOrder.takerXLMAddress = takerXLMAddress;
      sellOrder.signature = signature;
    
    }

    /* function initiateSwap(uint256 sellOrderId, bytes32 recipient) public payable { */
    /*   SellOrder storage sellOrder = sellOrders[sellOrderId]; */
    /*   require(msg.value == sellOrder.ETHAmount, "invalid ETH amount"); */
    /*   sellOrders[sellOrderId].recipient = recipient; */
    /* } */

    /* function executeSwap(uint256 sellOrderId, bytes32 secret) public payable { */
    /*   SellOrder memory sellOrder = sellOrders[sellOrderId]; */
    /*   require(sha256(abi.encodePacked(secret)) == sellOrder.hashOfSecret, "invalid secret"); */
    /*   require(msg.sender == sellOrder.maker); */
    /*   payable(msg.sender).transfer(sellOrder.ETHAmount); */
    /* } */
}

