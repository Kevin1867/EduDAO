// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Fundraiser} from "./Fundraiser.sol";
import {EduDAO} from "./EduDAO.sol";

/**
 * @title FundraiserFactory
 * @dev Deploys and keeps track of multiple Fundraiser contracts.
 */
contract FundraiserFactory {
    // =============================================================
    // State Variables
    // =============================================================

    Fundraiser[] public fundraisers;
    uint256 public fundraisersCount;
    address public daoAddress; // Address of the EduDAO contract

    // =============================================================
    // Events
    // =============================================================

    event FundraiserCreated(
        address indexed fundraiserAddress, 
        address indexed beneficiary, 
        address indexed owner
    );

    // =============================================================
    // Constructor
    // =============================================================
    
    constructor(address _daoAddress) {
        require(_daoAddress != address(0), "Invalid DAO address");
        daoAddress = _daoAddress;
    }

    // =============================================================
    // Functions
    // =============================================================

    /**
     * @dev Creates a new Fundraiser contract and stores it.
     * @param _name The name of the fundraiser
     * @param _url A link to the campaign website
     * @param _imageURL An image representing the campaign
     * @param _description A short description of the campaign
     * @param _beneficiary The address that will receive withdrawn donations
     *
     * Only addresses marked as `payable` are allowed to receive ETH,
     * so the beneficiary must be declared payable.
     */
    function createFundraiser(
        string memory _name,
        string memory _url,
        string memory _imageURL,
        string memory _description,
        address _beneficiary
    ) public {
        // Create the new Fundraiser contract. The DAO is set as its owner.
        Fundraiser newFundraiser = new Fundraiser(
            _name,
            _url,
            _imageURL,
            _description,
            _beneficiary,
            daoAddress 
        );

        // Store the new fundraiser
        fundraisers.push(newFundraiser);
        fundraisersCount++;

        // Automatically create a proposal in the DAO for the new fundraiser
        // This requires the factory to be a member of the DAO.
        EduDAO(daoAddress).createProposal(
            payable(address(newFundraiser)), 
            _description
        );

        // Emit an event
        emit FundraiserCreated(
            address(newFundraiser), 
            _beneficiary, 
            daoAddress
        );
    }

    function getAllFundraisers() public view returns (Fundraiser[] memory) {
        return fundraisers;
    }
}
