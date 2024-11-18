// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./VehicleNFT.sol";

contract VehicleMarketplace is ReentrancyGuard {
    VehicleNFT public vehicleNFT;

    struct Listing {
        address seller;
        uint256 price;
        bool isActive;
    }

    mapping(uint256 => Listing) public listings;

    event VehicleListed(uint256 tokenId, address seller, uint256 price);
    event VehicleSold(
        uint256 tokenId,
        address seller,
        address buyer,
        uint256 price
    );
    event ListingCanceled(uint256 tokenId, address seller);

    constructor(address _vehicleNFTAddress) {
        vehicleNFT = VehicleNFT(_vehicleNFTAddress);
    }

    function listVehicle(uint256 tokenId, uint256 price) public {
        require(
            vehicleNFT.ownerOf(tokenId) == msg.sender,
            "Not the vehicle owner"
        );
        require(
            vehicleNFT.getApproved(tokenId) == address(this),
            "Marketplace not approved"
        );

        listings[tokenId] = Listing(msg.sender, price, true);
        emit VehicleListed(tokenId, msg.sender, price);
    }

    function buyVehicle(uint256 tokenId) public payable nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.isActive, "Vehicle not for sale");
        require(msg.value == listing.price, "Incorrect price");
        require(msg.sender != listing.seller, "Seller cannot be buyer");

        listings[tokenId].isActive = false;
        payable(listing.seller).transfer(msg.value);
        vehicleNFT.transferFrom(listing.seller, msg.sender, tokenId);

        emit VehicleSold(tokenId, listing.seller, msg.sender, msg.value);
    }

    function cancelListing(uint256 tokenId) public {
        require(listings[tokenId].seller == msg.sender, "Not the seller");
        require(listings[tokenId].isActive, "Listing not active");

        listings[tokenId].isActive = false;
        emit ListingCanceled(tokenId, msg.sender);
    }
}
