// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {EduDAO} from "../src/EduDAO.sol";
import {Fundraiser} from "../src/Fundraiser.sol";

contract EduDAOTest is Test {
    EduDAO public dao;
    Fundraiser public fundraiser;

    address public owner;
    address public member1;
    address public member2;
    address public nonMember;

    function setUp() public {
        // Use default test addresses provided by Foundry
        owner = makeAddr("owner");
        member1 = makeAddr("member1");
        member2 = makeAddr("member2");
        nonMember = makeAddr("nonMember");

        // Deploy EduDAO. The deployer ('owner') automatically becomes the first member.
        vm.prank(owner);
        dao = new EduDAO();

        // Add other members
        vm.prank(owner);
        dao.addMember(member1);
        vm.prank(owner);
        dao.addMember(member2);

        // Deploy a dummy Fundraiser contract. For this test, the DAO will be its owner.
        vm.prank(owner);
        fundraiser = new Fundraiser(
            "Test Project",
            "http://test.com",
            "http://image.com",
            "A test fundraiser",
            makeAddr("beneficiary"), // beneficiary
            address(dao)            // The DAO is the owner
        );
    }

    function test_CreateProposal_AsMember() public {
        // A member (member1) creates a proposal
        vm.prank(member1);
        dao.createProposal(payable(address(fundraiser)), "Fund Test Project");

        (address proposer, , , , , , EduDAO.ProposalState state) = dao.proposals(0);
        assertEq(proposer, member1);
        assertEq(uint(state), uint(EduDAO.ProposalState.Open));
    }

    function test_Fail_CreateProposal_AsNonMember() public {
        vm.prank(nonMember);
        vm.expectRevert("Only members can call this function.");
        dao.createProposal(payable(address(fundraiser)), "Should fail");
    }

    function test_Vote_OneForOneAgainst() public {
        // member1 creates a proposal
        vm.prank(member1);
        dao.createProposal(payable(address(fundraiser)), "Fund Test Project");

        // member1 votes 'for'
        vm.prank(member1);
        dao.vote(0, true);

        // member2 votes 'against'
        vm.prank(member2);
        dao.vote(0, false);

        (,,,,uint256 forVotes, uint256 againstVotes,) = dao.proposals(0);
        assertEq(forVotes, 1, "For votes should be 1");
        assertEq(againstVotes, 1, "Against votes should be 1");
    }

    function test_Fail_Vote_AsNonMember() public {
        vm.prank(member1);
        dao.createProposal(payable(address(fundraiser)), "Fund Test Project");

        vm.prank(nonMember);
        vm.expectRevert("Only members can call this function.");
        dao.vote(0, true);
    }

    function test_Fail_Vote_Twice() public {
        vm.prank(member1);
        dao.createProposal(payable(address(fundraiser)), "Fund Test Project");

        vm.prank(member2);
        dao.vote(0, true);

        vm.prank(member2);
        vm.expectRevert("Already voted");
        dao.vote(0, false); // Try to vote again
    }

    function test_ExecuteProposal_Approved() public {
        // member1 creates a proposal
        vm.prank(member1);
        dao.createProposal(payable(address(fundraiser)), "Fund Test Project");

        // member1 and owner vote 'for'
        vm.prank(member1);
        dao.vote(0, true);
        vm.prank(owner);
        dao.vote(0, true);

        // member2 votes 'against'
        vm.prank(member2);
        dao.vote(0, false);

        // Fast forward time to after the voting period
        uint256 votingPeriod = dao.VOTING_PERIOD();
        vm.warp(block.timestamp + votingPeriod + 1);

        // Owner executes the proposal
        vm.prank(owner);
        dao.executeProposal(0);

        // Check proposal state and fundraiser approval
        (,,,,,,EduDAO.ProposalState state) = dao.proposals(0);
        assertEq(uint(state), uint(EduDAO.ProposalState.Executed));
        assertTrue(fundraiser.isDAOApproved(), "Fundraiser should be marked as approved by the DAO");
    }
     function test_Fail_ExecuteProposal_ByNonOwner() public {
        vm.prank(member1);
        dao.createProposal(payable(address(fundraiser)), "Fund Test Project");
        
        uint256 votingPeriod = dao.VOTING_PERIOD();
        vm.warp(block.timestamp + votingPeriod + 1);

        vm.prank(member1); // A member tries to execute
        vm.expectRevert("Only owner can call this function.");
        dao.executeProposal(0);
    }
} 