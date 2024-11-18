// ServiceCenterAuth.sol - Deploy this in Remix IDE
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ServiceCenterAuth {
    address public owner;
    mapping(address => bool) public authorizedCenters;
    
    event CenterAuthorized(address indexed center);
    event CenterDeauthorized(address indexed center);
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    
    function authorizeCenter(address _center) public onlyOwner {
        require(!authorizedCenters[_center], "Center already authorized");
        authorizedCenters[_center] = true;
        emit CenterAuthorized(_center);
    }
    
    function deauthorizeCenter(address _center) public onlyOwner {
        require(authorizedCenters[_center], "Center not authorized");
        authorizedCenters[_center] = false;
        emit CenterDeauthorized(_center);
    }
    
    function isAuthorized(address _center) public view returns (bool) {
        return authorizedCenters[_center];
    }
}