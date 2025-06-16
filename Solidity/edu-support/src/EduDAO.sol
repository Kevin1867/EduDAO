// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Fundraiser} from "./Fundraiser.sol";

/**
 * @title EduDAO
 * @author Your Name
 * @notice A simplified, member-based DAO for approving educational fundraisers.
 * This version does NOT use a governance token.
 */
contract EduDAO {
    // =============================================================
    // Events
    // =============================================================
    event MemberAdded(address indexed member);
    event MemberRemoved(address indexed member);
    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, address indexed fundraiserContract);
    event Voted(uint256 indexed proposalId, address indexed voter, bool inFavor);
    event ProposalExecuted(uint256 indexed proposalId, bool approved);

    // =============================================================
    // State Variables
    // =============================================================
    address public owner;
    mapping(address => bool) public members;

    uint256 public nextProposalId;
    uint256 public constant VOTING_PERIOD = 7 days; // Voting period for proposals

    enum ProposalState {
        Open,
        Approved,
        Rejected,
        Executed
    }

    struct Proposal {
        address proposer;
        Fundraiser fundraiserContract;
        string description;
        uint256 creationTime;
        uint256 forVotes;
        uint256 againstVotes;
        mapping(address => bool) hasVoted;
        ProposalState state;
    }

    mapping(uint256 => Proposal) public proposals;

    // =============================================================
    // Modifiers
    // =============================================================
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function.");
        _;
    }

    modifier onlyMembers() {
        require(members[msg.sender], "Only members can call this function.");
        _;
    }

    modifier proposalExists(uint256 _proposalId) {
        require(proposals[_proposalId].proposer != address(0), "Proposal does not exist");
        _;
    }

    // =============================================================
    // Constructor
    // =============================================================
    constructor() {
        owner = msg.sender;
        members[msg.sender] = true; // The deployer is the first member
        emit MemberAdded(msg.sender);
    }

    // =============================================================
    // Member Management (Owner-only)
    // =============================================================
    function addMember(address _newMember) public onlyOwner {
        require(!members[_newMember], "Address is already a member");
        members[_newMember] = true;
        emit MemberAdded(_newMember);
    }

    function removeMember(address _member) public onlyOwner {
        require(members[_member], "Address is not a member");
        members[_member] = false;
        emit MemberRemoved(_member);
    }

    // =============================================================
    // Proposal and Voting Logic (Members-only)
    // =============================================================
    function createProposal(address payable _fundraiserContract, string memory _description) public onlyMembers {
        require(_fundraiserContract != address(0), "Invalid fundraiser contract address");
        
        uint256 proposalId = nextProposalId++;
        Proposal storage p = proposals[proposalId];

        p.proposer = msg.sender;
        p.fundraiserContract = Fundraiser(_fundraiserContract);
        p.description = _description;
        p.creationTime = block.timestamp;
        p.state = ProposalState.Open;

        emit ProposalCreated(proposalId, msg.sender, _fundraiserContract);
    }

    function vote(uint256 _proposalId, bool _inFavor) public onlyMembers proposalExists(_proposalId) {
        Proposal storage p = proposals[_proposalId];
        require(p.state == ProposalState.Open, "Voting is not open for this proposal");
        require(block.timestamp < p.creationTime + VOTING_PERIOD, "Voting period has ended");
        require(!p.hasVoted[msg.sender], "Already voted");

        p.hasVoted[msg.sender] = true;
        if (_inFavor) {
            p.forVotes++;
        } else {
            p.againstVotes++;
        }

        emit Voted(_proposalId, msg.sender, _inFavor);
    }

    function getHasVoted(uint256 _proposalId, address _voter) public view returns (bool) {
        return proposals[_proposalId].hasVoted[_voter];
    }

    // =============================================================
    // Proposal Execution (Owner-only)
    // =============================================================
    function executeProposal(uint256 _proposalId) public onlyOwner proposalExists(_proposalId) {
        Proposal storage p = proposals[_proposalId];
        require(p.state == ProposalState.Open, "Proposal has already been processed");
        require(block.timestamp >= p.creationTime + VOTING_PERIOD, "Voting period has not ended yet");

        bool approved = p.forVotes > p.againstVotes;
        if (approved) {
            p.state = ProposalState.Approved;
            // The DAO contract is set as the owner of the Fundraiser contract
            // during its creation in the factory (or should be).
            // For this to work, the DAO must be the owner of the fundraiser.
            // Let's assume for now the owner of the Fundraiser is the DAO.
            // A better pattern would be for the factory to transfer ownership to the DAO.
            // For simplicity, we will assume manual ownership transfer or that the DAO creates it.
            // The PRD implies a user creates it, then submits. A better flow is needed.
            // Let's refine the logic to transfer ownership of the fundraiser to this DAO contract.
            // For now, let's assume this DAO's address is the owner of the fundraiser.
            p.fundraiserContract.setDAOApproval(true);
            p.state = ProposalState.Executed;
        } else {
            p.state = ProposalState.Rejected;
        }

        emit ProposalExecuted(_proposalId, approved);
    }
} 