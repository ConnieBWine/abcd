// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract VehicleNFT is ERC721, Pausable, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Vehicle {
        string vin;
        string make;
        string model;
        uint256 year;
        string metadataURI;
        uint256 price;
        bool isForSale;
    }

    mapping(uint256 => Vehicle) public vehicles;
    mapping(string => bool) public vinExists;

    event VehicleRegistered(uint256 tokenId, string vin, address owner);
    event VehiclePriceUpdated(uint256 tokenId, uint256 newPrice);
    event VehicleStatusUpdated(uint256 tokenId, bool isForSale);

    constructor() ERC721("VehicleNFT", "VNFT") {}

    function registerVehicle(
        string memory vin,
        string memory make,
        string memory model,
        uint256 year,
        string memory metadataURI,
        uint256 price
    ) public returns (uint256) {
        require(!vinExists[vin], "VIN already registered");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        vehicles[newTokenId] = Vehicle(
            vin,
            make,
            model,
            year,
            metadataURI,
            price,
            true
        );

        vinExists[vin] = true;
        _mint(msg.sender, newTokenId);

        emit VehicleRegistered(newTokenId, vin, msg.sender);
        return newTokenId;
    }

    function updateVehiclePrice(uint256 tokenId, uint256 newPrice) public {
        require(_exists(tokenId), "Vehicle does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the vehicle owner");

        vehicles[tokenId].price = newPrice;
        emit VehiclePriceUpdated(tokenId, newPrice);
    }

    function setVehicleForSale(uint256 tokenId, bool isForSale) public {
        require(_exists(tokenId), "Vehicle does not exist");
        require(ownerOf(tokenId) == msg.sender, "Not the vehicle owner");

        vehicles[tokenId].isForSale = isForSale;
        emit VehicleStatusUpdated(tokenId, isForSale);
    }

    function getVehicle(uint256 tokenId) public view returns (Vehicle memory) {
        require(_exists(tokenId), "Vehicle does not exist");
        return vehicles[tokenId];
    }
}
