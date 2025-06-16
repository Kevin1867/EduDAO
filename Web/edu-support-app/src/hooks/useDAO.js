import { useState, useEffect, useCallback } from 'react';
import { 
  EDU_DAO_ABI, 
  EDU_DAO_ADDRESS,
  FUNDRAISER_ABI 
} from '../contracts.js';
import { useWeb3 } from '../context/Web3Context.jsx';

const useDAO = () => {
  const { web3, account } = useWeb3();
  const [daoContract, setDaoContract] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  const getProposalState = (state) => {
    const states = ['Open', 'Approved', 'Rejected', 'Executed'];
    return states[Number(state)] || 'Unknown';
  };

  const fetchProposals = useCallback(async (contract) => {
    if (!contract || !account) return;
    setLoading(true);
    try {
      const proposalCount = await contract.methods.nextProposalId().call();
      const fetchedProposals = [];

      for (let i = 0; i < proposalCount; i++) {
        const p = await contract.methods.proposals(i).call();
        if (p.proposer === '0x0000000000000000000000000000000000000000') continue;

        const fundraiserContract = new web3.eth.Contract(FUNDRAISER_ABI, p.fundraiserContract);
        const fundraiserName = await fundraiserContract.methods.name().call();
        const hasVoted = await contract.methods.getHasVoted(i, account).call();

        fetchedProposals.push({
          id: i,
          ...p,
          fundraiserName,
          hasVoted,
          state: getProposalState(p.state),
        });
      }
      setProposals(fetchedProposals.reverse());
    } catch (error) {
      console.error("Failed to fetch proposals", error);
      setProposals([]); // Clear proposals on error
    } finally {
      setLoading(false);
    }
  }, [account, web3]);

  useEffect(() => {
    const init = async () => {
      if (!web3 || !account) {
        setLoading(false);
        return;
      }
      
      const contract = new web3.eth.Contract(EDU_DAO_ABI, EDU_DAO_ADDRESS);
      setDaoContract(contract);

      try {
        const [memberStatus, ownerAddress] = await Promise.all([
          contract.methods.members(account).call(),
          contract.methods.owner().call(),
        ]);
        
        setIsMember(memberStatus);
        setIsOwner(ownerAddress.toLowerCase() === account.toLowerCase());
        
        await fetchProposals(contract);
      } catch (error) {
        console.error('Error initializing DAO hook:', error);
        setLoading(false);
      }
    };
    init();
  }, [web3, account, fetchProposals]);

  const handleVote = async (proposalId, inFavor) => {
    if (!daoContract || !account) return;
    try {
      await daoContract.methods.vote(proposalId, inFavor).send({ from: account });
      alert('Vote cast successfully!');
      fetchProposals(daoContract);
    } catch (error) {
      console.error('Voting failed:', error);
      alert(`Voting failed: ${error.message}`);
    }
  };

  const handleExecute = async (proposalId) => {
    if (!daoContract || !account) return;
    try {
      await daoContract.methods.executeProposal(proposalId).send({ from: account });
      alert('Proposal executed successfully!');
      fetchProposals(daoContract);
    } catch (error) {
      console.error('Execution failed:', error);
      alert(`Execution failed: ${error.message}`);
    }
  };
  
  const handleAddMember = async (newMemberAddress) => {
    if (!daoContract || !account) return;
    if (!web3.utils.isAddress(newMemberAddress)) {
      alert("Please enter a valid Ethereum address.");
      return;
    }
    try {
      await daoContract.methods.addMember(newMemberAddress).send({ from: account });
      alert('Member added successfully!');
    } catch (error) {
      console.error('Failed to add member:', error);
      alert(`Failed to add member: ${error.message}`);
    }
  };

  return {
    proposals,
    isMember,
    isOwner,
    loading,
    handleVote,
    handleExecute,
    handleAddMember,
  };
};

export default useDAO; 