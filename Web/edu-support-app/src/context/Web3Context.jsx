import { createContext, useState, useEffect, useContext } from 'react';
import Web3 from 'web3';

const Web3Context = createContext();

export const useWeb3 = () => {
  return useContext(Web3Context);
};

export const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          setWeb3(web3Instance);

          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }

          window.ethereum.on('accountsChanged', (accounts) => {
            setAccount(accounts[0] || null);
          });

        } catch (e) {
          setError("Failed to initialize Web3. Please check your MetaMask setup.");
          console.error(e);
        }
      } else {
        setError('MetaMask is not installed. Please install it to use this app.');
      }
      setLoading(false);
    };

    initWeb3();
  }, []);

  const connectWallet = async () => {
    if (web3) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (e) {
        setError("Failed to connect wallet.");
        console.error(e);
      }
    } else {
        setError('Web3 is not initialized.');
    }
  };

  const value = {
    web3,
    account,
    connectWallet,
    loading,
    error,
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}; 