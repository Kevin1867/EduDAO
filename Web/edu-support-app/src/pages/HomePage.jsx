import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';

const HomePage = () => {
  return (
    <Container maxWidth="lg" sx={{ textAlign: 'center', py: 8 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Welcome to EduDAO
      </Typography>
      <Typography variant="h5" color="text.secondary" paragraph>
        A decentralized platform for funding education. Empowering students, transparently.
      </Typography>
      <Box sx={{ mt: 4 }}>
        <Button variant="contained" color="primary" href="/browse" sx={{ mx: 1 }}>
          Browse Proposals
        </Button>
        <Button variant="outlined" color="primary" href="/create" sx={{ mx: 1 }}>
          Create a Proposal
        </Button>
      </Box>
    </Container>
  );
};

export default HomePage; 