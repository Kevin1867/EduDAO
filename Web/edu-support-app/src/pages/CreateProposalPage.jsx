import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { FUNDRAISER_FACTORY_ABI, FUNDRAISER_FACTORY_ADDRESS } from '../contracts.js';
import { useWeb3 } from '../context/Web3Context';


const CreateProposalPage = () => {
  const { web3, account } = useWeb3();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [beneficiary, setBeneficiary] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!web3 || !account) {
      alert("Please connect your wallet first.");
      return;
    }
    setLoading(true);

    try {
      const factoryContract = new web3.eth.Contract(
        FUNDRAISER_FACTORY_ABI,
        FUNDRAISER_FACTORY_ADDRESS
      );

      await factoryContract.methods
        .createFundraiser(name, url, imageURL, description, beneficiary)
        .send({ from: account });

      alert('Fundraiser created successfully!');
      navigate('/browse');
    } catch (error) {
      console.error(error);
      alert(`Error creating fundraiser: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Create a New Proposal
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Proposal Title"
            name="name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="description"
            label="Description"
            id="description"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="beneficiary"
            label="Beneficiary Address"
            id="beneficiary"
            value={beneficiary}
            onChange={(e) => setBeneficiary(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            name="imageURL"
            label="Image URL"
            id="imageURL"
            value={imageURL}
            onChange={(e) => setImageURL(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            name="url"
            label="Website/URL"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Box sx={{ position: 'relative', mt: 3 }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              Create Proposal
            </Button>
            {loading && (
              <CircularProgress
                size={24}
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: '-12px',
                  marginLeft: '-12px',
                }}
              />
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateProposalPage; 