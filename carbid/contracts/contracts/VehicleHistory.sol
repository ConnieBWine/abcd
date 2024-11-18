// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

contract VehicleHistory {
    struct ServiceRecord {
        uint256 timestamp;
        string serviceType;
        string description;
        uint256 mileage;
        address serviceCenter;
        string documentHash;
    }

    struct AccidentRecord {
        uint256 timestamp;
        string description;
        string severity;
        string documentHash;
    }

    struct OwnershipRecord {
        address owner;
        uint256 timestamp;
        string documentHash;
    }

    struct VehicleInfo {
        string vin;
        string make;
        string model;
        uint256 year;
        bool isRegistered;
    }

    mapping(string => VehicleInfo) public vehicles;
    mapping(string => ServiceRecord[]) public serviceRecords;
    mapping(string => AccidentRecord[]) public accidentRecords;
    mapping(string => OwnershipRecord[]) public ownershipRecords;
    mapping(address => bool) public authorizedServiceCenters;

    address public owner;
    uint256 public version = 1;
    
    event VehicleRegistered(string indexed vin, string make, string model, uint256 year);
    event ServiceRecordAdded(string indexed vin, string serviceType, uint256 timestamp);
    event AccidentRecordAdded(string indexed vin, string severity, uint256 timestamp);
    event OwnershipChanged(string indexed vin, address newOwner, uint256 timestamp);
    event ServiceCenterAuthorized(address indexed serviceCenter);
    event ServiceCenterDeauthorized(address indexed serviceCenter);
    event ContractOwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "VehicleHistory: caller is not the owner");
        _;
    }

    modifier onlyAuthorizedServiceCenter() {
        require(authorizedServiceCenters[msg.sender], "VehicleHistory: caller is not an authorized service center");
        _;
    }

    modifier vehicleExists(string memory vin) {
        require(vehicles[vin].isRegistered, "VehicleHistory: vehicle not registered");
        _;
    }

    constructor() {
        owner = msg.sender;
        // Authorize the contract deployer as first service center
        authorizedServiceCenters[msg.sender] = true;
        emit ServiceCenterAuthorized(msg.sender);
    }

    // Fallback function
    fallback() external payable {
        revert("VehicleHistory: function not found");
    }

    // Receive function
    receive() external payable {
        revert("VehicleHistory: direct ETH payments not accepted");
    }

    function transferContractOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "VehicleHistory: new owner is the zero address");
        require(newOwner != owner, "VehicleHistory: new owner is the current owner");
        
        address previousOwner = owner;
        owner = newOwner;
        emit ContractOwnershipTransferred(previousOwner, newOwner);
    }

    function registerVehicle(
        string memory vin,
        string memory make,
        string memory model,
        uint256 year
    ) public {
        require(bytes(vin).length > 0, "VehicleHistory: VIN cannot be empty");
        require(bytes(make).length > 0, "VehicleHistory: make cannot be empty");
        require(bytes(model).length > 0, "VehicleHistory: model cannot be empty");
        require(year > 1900 && year <= block.timestamp / 365 days + 1970, "VehicleHistory: invalid year");
        require(!vehicles[vin].isRegistered, "VehicleHistory: vehicle already registered");
        vehicles[vin] = VehicleInfo({
            vin: vin,
            make: make,
            model: model,
            year: year,
            isRegistered: true
        });

        ownershipRecords[vin].push(OwnershipRecord({
            owner: msg.sender,
            timestamp: block.timestamp,
            documentHash: ""
        }));

        emit VehicleRegistered(vin, make, model, year);
    }

    function addServiceRecord(
        string memory vin,
        string memory serviceType,
        string memory description,
        uint256 mileage,
        string memory documentHash
    ) public onlyAuthorizedServiceCenter vehicleExists(vin) {
        require(bytes(serviceType).length > 0, "VehicleHistory: serviceType cannot be empty");
        require(bytes(description).length > 0, "VehicleHistory: description cannot be empty");
        
        serviceRecords[vin].push(ServiceRecord({
            timestamp: block.timestamp,
            serviceType: serviceType,
            description: description,
            mileage: mileage,
            serviceCenter: msg.sender,
            documentHash: documentHash
        }));

        emit ServiceRecordAdded(vin, serviceType, block.timestamp);
    }

    function addAccidentRecord(
        string memory vin,
        string memory description,
        string memory severity,
        string memory documentHash
    ) public onlyAuthorizedServiceCenter vehicleExists(vin) {
        require(bytes(description).length > 0, "VehicleHistory: description cannot be empty");
        require(bytes(severity).length > 0, "VehicleHistory: severity cannot be empty");

        accidentRecords[vin].push(AccidentRecord({
            timestamp: block.timestamp,
            description: description,
            severity: severity,
            documentHash: documentHash
        }));

        emit AccidentRecordAdded(vin, severity, block.timestamp);
    }

    function authorizeServiceCenter(address serviceCenter) public onlyOwner {
        require(serviceCenter != address(0), "VehicleHistory: invalid service center address");
        require(!authorizedServiceCenters[serviceCenter], "VehicleHistory: service center already authorized");
        
        authorizedServiceCenters[serviceCenter] = true;
        emit ServiceCenterAuthorized(serviceCenter);
    }

    function deauthorizeServiceCenter(address serviceCenter) public onlyOwner {
        require(serviceCenter != owner, "VehicleHistory: cannot deauthorize owner");
        require(authorizedServiceCenters[serviceCenter], "VehicleHistory: service center not authorized");
        
        authorizedServiceCenters[serviceCenter] = false;
        emit ServiceCenterDeauthorized(serviceCenter);
    }

    function transferOwnership(
        string memory vin,
        address newOwner,
        string memory documentHash
    ) public vehicleExists(vin) {
        require(newOwner != address(0), "VehicleHistory: invalid new owner address");
        require(msg.sender == ownershipRecords[vin][ownershipRecords[vin].length - 1].owner, 
                "VehicleHistory: caller is not the current owner");

        ownershipRecords[vin].push(OwnershipRecord({
            owner: newOwner,
            timestamp: block.timestamp,
            documentHash: documentHash
        }));

        emit OwnershipChanged(vin, newOwner, block.timestamp);
    }

    // View functions
    function getServiceRecords(string memory vin) public view returns (ServiceRecord[] memory) {
        return serviceRecords[vin];
    }

    function getAccidentRecords(string memory vin) public view returns (AccidentRecord[] memory) {
        return accidentRecords[vin];
    }

    function getOwnershipRecords(string memory vin) public view returns (OwnershipRecord[] memory) {
        return ownershipRecords[vin];
    }

    function getVehicleInfo(string memory vin) public view returns (VehicleInfo memory) {
        return vehicles[vin];
    }

    function isServiceCenterAuthorized(address serviceCenter) public view returns (bool) {
        return authorizedServiceCenters[serviceCenter];
    }
}