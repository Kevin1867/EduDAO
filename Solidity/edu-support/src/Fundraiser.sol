// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Import for Foundry debugging only — remove before deployment to production
import {console} from "forge-std/Test.sol";

/**
 * @title Fundraiser
 * @dev A smart contract for managing decentralised fundraising campaigns.
 * Each fundraiser tracks donations per donor and allows withdrawal by the owner.
 */
contract Fundraiser {
    // =============================================================
    // State Variables
    // =============================================================

    string public name;
    string public url;
    string public imageURL;
    string public description;
    address public owner;
    address payable public beneficiary;

    uint256 public totalDonations;
    mapping(address => uint256) public myDonations;
    bool public isDAOApproved;

    // =============================================================
    // Events
    // =============================================================

    event DonationReceived(address indexed donor, uint256 amount);
    event DAOApprovalStatusChanged(bool isApproved);

    // =============================================================
    // Modifiers
    // =============================================================

    modifier onlyOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }

    // =============================================================
    // Functions
    // =============================================================

    constructor(
        string memory _name,
        string memory _url,
        string memory _imageURL,
        string memory _description,
        address _beneficiary,
        address _owner
    ) {
        name = _name;
        url = _url;
        imageURL = _imageURL;
        description = _description;
        beneficiary = payable(_beneficiary);
        owner = _owner;
    }

    /**
     * @dev Sets the DAO approval status. Can only be called by the contract owner.
     * In our design, the owner will be the EduDAO contract, which manages approvals.
     * @param _approved The new approval status.
     */
    function setDAOApproval(bool _approved) public onlyOwner {
        isDAOApproved = _approved;
        emit DAOApprovalStatusChanged(_approved);
    }

    function setBeneficiary(address payable _beneficiary) public onlyOwner {
        beneficiary = _beneficiary;
    }

    function donate() public payable {
        require(msg.value > 0, "Donation must be greater than 0");

        (bool success, ) = beneficiary.call{value: msg.value}("");
        require(success, "Transfer failed.");

        myDonations[msg.sender] += msg.value;
        totalDonations += msg.value;
        emit DonationReceived(msg.sender, msg.value);
    }
}
