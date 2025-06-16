// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {FundraiserFactory} from "../src/FundraiserFactory.sol";
import {Fundraiser} from "../src/Fundraiser.sol";
import {EduDAO} from "../src/EduDAO.sol";

contract FundraiserFactoryTest is Test {
    FundraiserFactory public factory;
    EduDAO public dao;
    address public owner = makeAddr("owner");
    address public beneficiary = makeAddr("beneficiary");

    function setUp() public {
        vm.prank(owner);
        dao = new EduDAO();
        
        vm.prank(owner);
        factory = new FundraiserFactory(address(dao));

        // Add factory as a member of the DAO so it can create proposals
        vm.prank(owner);
        dao.addMember(address(factory));
    }

    function test_CreateFundraiser() public {
        vm.prank(owner);
        factory.createFundraiser(
            "Test Fundraiser",
            "test.com",
            "image.com",
            "Test description",
            beneficiary
        );

        assertEq(factory.fundraisersCount(), 1, "Fundraiser count should be 1");
        
        Fundraiser[] memory fundraisers = factory.getAllFundraisers();
        assertEq(fundraisers.length, 1, "Fundraisers array length should be 1");

        Fundraiser createdFundraiser = fundraisers[0];
        assertEq(createdFundraiser.name(), "Test Fundraiser", "Fundraiser name mismatch");
        assertEq(createdFundraiser.beneficiary(), beneficiary, "Beneficiary mismatch");
        assertEq(createdFundraiser.owner(), address(dao), "Owner should be the DAO contract");
    }

    function test_CreateFundraiser_CreatesDAOPorposal() public {
        vm.prank(owner);
        factory.createFundraiser(
            "Test Fundraiser",
            "test.com",
            "image.com",
            "Test description",
            beneficiary
        );

        // Check that a proposal was created in the DAO
        (address proposer,,,,,,) = dao.proposals(0);
        assertEq(dao.nextProposalId(), 1, "Next proposal ID should be 1");
        assertEq(proposer, address(factory), "Proposal creator should be the factory");
    }

    function test_GetAllFundraisers() public {
        vm.prank(owner);
        factory.createFundraiser("Fundraiser 1", "", "", "", beneficiary);
        
        address anotherBeneficiary = makeAddr("anotherBeneficiary");
        vm.prank(owner); // The owner of the factory creates the fundraiser
        factory.createFundraiser("Fundraiser 2", "", "", "", anotherBeneficiary);

        Fundraiser[] memory fundraisers = factory.getAllFundraisers();
        assertEq(fundraisers.length, 2, "Should have 2 fundraisers");

        assertEq(fundraisers[0].name(), "Fundraiser 1");
        assertEq(fundraisers[1].name(), "Fundraiser 2");
    }
} 