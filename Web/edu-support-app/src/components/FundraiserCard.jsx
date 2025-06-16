// FundraiserCard.jsx - Displays a fundraising campaign card with donation, withdrawal, and beneficiary features

import { useState, useEffect } from 'react';
import Web3 from 'web3';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import Chip from '@mui/material/Chip';
import VerifiedIcon from '@mui/icons-material/Verified';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

import { FUNDRAISER_ABI } from '../contracts.js';

const FundraiserCard = ({ fundraiser, connectedAccount }) => {
  const [donationAmount, setDonationAmount] = useState('');
  const [isBeneficiary, setIsBeneficiary] = useState(false);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const web3 = new Web3(window.ethereum);

  useEffect(() => {
    if (connectedAccount && fundraiser) {
      setIsBeneficiary(
        fundraiser.beneficiary.toLowerCase() === connectedAccount.toLowerCase()
      );
    } else {
      setIsBeneficiary(false);
    }
  }, [connectedAccount, fundraiser]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleDonate = async () => {
    if (!connectedAccount) {
      alert('Please connect your wallet to donate.');
      return;
    }
    if (!donationAmount || parseFloat(donationAmount) <= 0) {
      alert('Please enter a valid donation amount.');
      return;
    }
    setIsLoading(true);
    try {
      const donationWei = web3.utils.toWei(donationAmount, 'ether');
      const fundraiserContract = new web3.eth.Contract(
        FUNDRAISER_ABI,
        fundraiser.address
      );
      await fundraiserContract.methods
        .donate()
        .send({ from: connectedAccount, value: donationWei });

      alert('Donation successful! The page will now refresh to show the updated balance.');
      handleClose();
      window.location.reload(); 
    } catch (error) {
      console.error('Donation failed:', error);
      alert(`Donation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    setIsLoading(true);
    try {
      const fundraiserContract = new web3.eth.Contract(
        FUNDRAISER_ABI,
        fundraiser.address
      );
      await fundraiserContract.methods.withdraw().send({ from: connectedAccount });
      alert('Withdrawal successful! The page will now refresh.');
      handleClose();
      window.location.reload();
    } catch (error) {
      console.error('Withdrawal failed:', error);
      alert(`Withdrawal failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Contribute to: {fundraiser.name}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} sx={{pt: 1}}>
            <Typography>
              Total Raised: {fundraiser.totalDonations} ETH
            </Typography>
            <TextField
              label="Amount in ETH to Donate"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              type="number"
              placeholder="0.1"
              fullWidth
            />
            {isBeneficiary && (
              <Box mt={2} sx={{border: '1px dashed grey', p: 2, borderRadius: 1}}>
                <Typography variant="h6" gutterBottom>Beneficiary Controls</Typography>
                <Button
                  onClick={handleWithdraw}
                  variant="contained"
                  color="secondary"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Withdraw All Funds'}
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{p: 3}}>
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button onClick={handleDonate} variant="contained" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : 'Donate'}
          </Button>
        </DialogActions>
      </Dialog>

      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: fundraiser.isDAOApproved ? '2px solid' : '1px solid',
          borderColor: fundraiser.isDAOApproved ? 'primary.main' : 'grey.300',
        }}
      >
        <CardMedia
          component="img"
          height="200"
          image={fundraiser.imageURL || 'https://via.placeholder.com/400x200?text=No+Image'}
          alt={`Visual for ${fundraiser.name}`}
        />
        <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
                 <Typography gutterBottom variant="h5" component="div">
                    {fundraiser.name}
                </Typography>
                {fundraiser.isDAOApproved && (
                <Chip
                    icon={<VerifiedIcon fontSize='small' />}
                    label="DAO Certified"
                    color="primary"
                    size="small"
                />
                )}
            </Box>
          <Typography variant="body2" color="text.secondary">
            {fundraiser.description}
          </Typography>
        </CardContent>
        <CardActions sx={{p: 2, borderTop: '1px solid', borderColor: 'grey.200' }}>
           <Button 
            component="a" // Use anchor tag for external link
            href={fundraiser.url}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
          >
            Learn More
          </Button>
          <Button onClick={handleOpen} variant="outlined" sx={{ml: 'auto'}}>
            Contribute
          </Button>
        </CardActions>
      </Card>
    </>
  );
};

export default FundraiserCard; 