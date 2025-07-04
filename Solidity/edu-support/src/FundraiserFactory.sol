// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Fundraiser} from "./Fundraiser.sol";

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
    address public daoAddress;

    // =============================================================
    // Events
    // =============================================================

    event FundraiserCreated(address indexed fundraiserAddress, address indexed owner);

    // =============================================================
    // Functions
    // =============================================================

    constructor(address _daoAddress) {
        daoAddress = _daoAddress;
    }

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
        Fundraiser newFundraiser = new Fundraiser(
            _name,
            _url,
            _imageURL,
            _description,
            _beneficiary,
            msg.sender,
            daoAddress
        );
        fundraisers.push(newFundraiser);
        fundraisersCount++;
        emit FundraiserCreated(address(newFundraiser), msg.sender);
    }

    function getAllFundraisers() public view returns (Fundraiser[] memory) {
        return fundraisers;
    }
}
