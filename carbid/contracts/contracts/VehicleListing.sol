// VehicleListing.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract VehicleListing is ERC721, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    struct Vehicle {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool isForSale;
        bool isAuction;
        uint256 auctionEndTime;
        uint256 highestBid;
        address highestBidder;
    }
    
    mapping(uint256 => Vehicle) public vehicles;
    mapping(uint256 => mapping(address => uint256)) public pendingReturns;
    
    event VehicleListed(uint256 tokenId, address seller, uint256 price, bool isAuction);
    event BidPlaced(uint256 tokenId, address bidder, uint256 amount);
    event AuctionEnded(uint256 tokenId, address winner, uint256 amount);
    
    constructor() ERC721("VehicleListing", "VL") {}
    
    function listVehicle(uint256 price, bool isAuction, uint256 auctionDuration) external returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(msg.sender, newTokenId);
        
        vehicles[newTokenId] = Vehicle({
            tokenId: newTokenId,
            seller: msg.sender,
            price: price,
            isForSale: true,
            isAuction: isAuction,
            auctionEndTime: isAuction ? block.timestamp + auctionDuration : 0,
            highestBid: 0,
            highestBidder: address(0)
        });
        
        emit VehicleListed(newTokenId, msg.sender, price, isAuction);
        return newTokenId;
    }
    
    function placeBid(uint256 tokenId) external payable nonReentrant {
        Vehicle storage vehicle = vehicles[tokenId];
        require(vehicle.isAuction, "Not an auction");
        require(block.timestamp < vehicle.auctionEndTime, "Auction ended");
        require(msg.value > vehicle.highestBid, "Bid too low");
        
        if (vehicle.highestBid != 0) {
            pendingReturns[tokenId][vehicle.highestBidder] += vehicle.highestBid;
        }
        
        vehicle.highestBidder = msg.sender;
        vehicle.highestBid = msg.value;
        
        emit BidPlaced(tokenId, msg.sender, msg.value);
    }
    
    function endAuction(uint256 tokenId) external {
        Vehicle storage vehicle = vehicles[tokenId];
        require(vehicle.isAuction, "Not an auction");
        require(block.timestamp >= vehicle.auctionEndTime, "Auction not ended");
        
        if (vehicle.highestBidder != address(0)) {
            payable(vehicle.seller).transfer(vehicle.highestBid);
            _transfer(vehicle.seller, vehicle.highestBidder, tokenId);
        }
        
        vehicle.isForSale = false;
        emit AuctionEnded(tokenId, vehicle.highestBidder, vehicle.highestBid);
    }
}