pragma solidity ^0.6.0;

import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './fmAuction.sol';

contract FreeMarket is ERC721, Ownable {
    constructor() ERC721("FreeMarket", "FMD") public {}

    // cast a payable address for the market owner to be the beneficiary 
    // in the auction
    // this contract is designed to have the owner of this contract to pay 
    // for most of the function calls (all but bid and withdraw)

    address payable ownerAddress = msg.sender;

    mapping(uint => fmAuction) public auctions;

    function registerProduct(string memory tokenURI) public payable onlyOwner {
        uint _id = totalSupply();
        _mint(ownerAddress, _id);
        _setTokenURI(_id, tokenURI);
        createAuction(_id);
    }

    function createAuction(uint tokenId) public onlyOwner {
        // your code here...
        auctions[tokenId] = new fmAuction(ownerAddress);
    }

    function getAuction(uint tokenId) public view returns(fmAuction) {
        // your code here...
        require(_exists(tokenId), "Product not registered!");
        fmAuction auction = auctions[tokenId];
        return auction;
    }
    function endAuction(uint tokenId) public onlyOwner {
        fmAuction auction = getAuction(tokenId);
        // your code here...
        auction.auctionEnd();
        safeTransferFrom(owner(), auction.highestBidder(), tokenId);
    }

    function auctionEnded(uint tokenId) public view returns(bool) {
        // your code here...
        fmAuction auction = getAuction(tokenId);
        return auction.ended();
    }

    function highestBid(uint tokenId) public view returns(uint) {
        // your code here...
        fmAuction auction = getAuction(tokenId);
        return auction.highestBid();
    }

    function pendingReturn(uint tokenId, address sender) public view returns(uint) {
        // your code here...
        fmAuction auction = getAuction(tokenId);
        return auction.pendingReturn(sender);
    }

    function bid(uint tokenId) public payable {
        // your code here...
        fmAuction auction = getAuction(tokenId);
        auction.bid{value:(msg.value)}(msg.sender);
    }

}
