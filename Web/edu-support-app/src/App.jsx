import { Outlet, BrowserRouter, Routes, Route } from 'react-router-dom';

import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

import DAOPage from './pages/DAOPage';
import HomePage from './pages/HomePage.jsx';
import BrowseProposalsPage from './pages/BrowseProposalsPage';
import CreateProposalPage from './pages/CreateProposalPage';
import { Web3Provider } from './context/Web3Context.jsx';

const Header = () => {
  const { account, connectWallet, error } = useWeb3();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <a href="/" style={{ textDecoration: 'none', color: 'inherit' }}>EduDAO</a>
        </Typography>
        <Button color="inherit" href="/browse">Browse Proposals</Button>
        <Button color="inherit" href="/create">Create Proposal</Button>
        <Button color="inherit" href="/dao">DAO</Button>
        {account ? (
          <Button color="inherit" variant="outlined" sx={{ ml: 2 }}>
            {`${account.substring(0, 6)}...${account.substring(account.length - 4)}`}
          </Button>
        ) : (
          <Button color="inherit" variant="contained" sx={{ ml: 2 }} onClick={connectWallet}>
            Connect Wallet
          </Button>
        )}
      </Toolbar>
      {error && <Typography color="error" align="center">{error}</Typography>}
    </AppBar>
  );
};

const MainLayout = () => {
  const { account } = useWeb3();
  return (
    <Box>
      <Header />
      <main>
        <Outlet context={{ walletAddress: account }} />
      </main>
    </Box>
  );
};

const App = () => {
  return (
    <Web3Provider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="browse" element={<BrowseProposalsPage />} />
            <Route path="create" element={<CreateProposalPage />} />
            <Route path="dao" element={<DAOPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Web3Provider>
  );
};

export default App;
