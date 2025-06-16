import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import FundraiserCard from '../components/FundraiserCard';
import {
  FUNDRAISER_FACTORY_ABI,
  FUNDRAISER_FACTORY_ADDRESS,
  FUNDRAISER_ABI,
} from '../contracts.js';
import { useWeb3 } from '../context/Web3Context';

const BrowseProposalsPage = () => {
  const { web3, account } = useWeb3();
  const [fundraisers, setFundraisers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFundraisers = async () => {
      if (!web3) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const factoryInstance = new web3.eth.Contract(
          FUNDRAISER_FACTORY_ABI,
          FUNDRAISER_FACTORY_ADDRESS
        );

        const fundraiserAddresses = await factoryInstance.methods
          .getAllFundraisers()
          .call();

        const fundraisersData = await Promise.all(
          fundraiserAddresses.map(async (address) => {
            try {
              const fundraiserContract = new web3.eth.Contract(
                FUNDRAISER_ABI,
                address
              );
              const [name, description, imageURL, url, beneficiary, isDAOApproved, totalDonations] = await Promise.all([
                fundraiserContract.methods.name().call(),
                fundraiserContract.methods.description().call(),
                fundraiserContract.methods.imageURL().call(),
                fundraiserContract.methods.url().call(),
                fundraiserContract.methods.beneficiary().call(),
                fundraiserContract.methods.isDAOApproved().call(),
                fundraiserContract.methods.totalDonations().call(),
              ]);

              return {
                address,
                name,
                description,
                imageURL,
                url,
                beneficiary,
                isDAOApproved,
                totalDonations: web3.utils.fromWei(totalDonations, 'ether'),
              };
            } catch (e) {
              console.error(`Failed to load fundraiser at address: ${address}`, e);
              return null;
            }
          })
        );
        
        setFundraisers(fundraisersData.filter(f => f !== null));

      } catch (error) {
        console.error('Error fetching fundraisers:', error);
        alert('Failed to load fundraisers. Check the console for details.');
      } finally {
        setLoading(false);
      }
    };
    fetchFundraisers();
  }, [web3]);

  return (
    <Container sx={{ py: 4 }} maxWidth="lg">
      <Typography variant="h4" align="center" gutterBottom>
        Browse Student Proposals
      </Typography>

      {loading ? (
        <Grid container justifyContent="center" sx={{ mt: 4 }}>
          <CircularProgress />
        </Grid>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          {fundraisers.length > 0 ? (
            fundraisers.map((fundraiser) => (
              <Grid item xs={12} sm={6} md={4} key={fundraiser.address}>
                <FundraiserCard
                  fundraiser={fundraiser}
                  connectedAccount={account}
                />
              </Grid>
            ))
          ) : (
            <Typography sx={{ mt: 4 }} align="center">
              No fundraiser proposals found.
            </Typography>
          )}
        </Grid>
      )}
    </Container>
  );
};

export default BrowseProposalsPage; 