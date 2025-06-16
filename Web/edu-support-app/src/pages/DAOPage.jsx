import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import useDAO from '../hooks/useDAO';

const DAOPage = () => {
  const [newMemberAddress, setNewMemberAddress] = useState('');
  const {
    proposals,
    isMember,
    isOwner,
    loading,
    handleVote,
    handleExecute,
    handleAddMember,
  } = useDAO();

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        DAO Governance
      </Typography>

      {isOwner && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6">Admin Controls</Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <TextField
              label="New Member Address"
              value={newMemberAddress}
              onChange={(e) => setNewMemberAddress(e.target.value)}
              fullWidth
              size="small"
            />
            <Button 
              variant="contained" 
              onClick={() => {
                handleAddMember(newMemberAddress);
                setNewMemberAddress('');
              }}
            >
              Add Member
            </Button>
          </Box>
        </Paper>
      )}

      <Typography variant="h5" gutterBottom>
        Proposals
      </Typography>
      
      {proposals.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {proposals.map((p) => (
            <Card key={p.id} elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {p.fundraiserName}
                </Typography>
                <Typography variant="body1" sx={{ my: 2 }}>{p.description}</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', my: 1 }}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="body2">For: {Number(p.forVotes)}</Typography>
                  <CancelIcon color="error" />
                  <Typography variant="body2">Against: {Number(p.againstVotes)}</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Status: {p.state}
                </Typography>
                 <Typography variant="caption" display="block" sx={{ mt: 1, wordBreak: 'break-all' }}>
                  Fundraiser Contract: {p.fundraiserContract}
                </Typography>
              </CardContent>
              <CardActions sx={{p: 2}}>
                {isMember && p.state === 'Open' && !p.hasVoted && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" variant="contained" color="success" onClick={() => handleVote(p.id, true)}>
                      Vote For
                    </Button>
                    <Button size="small" variant="contained" color="error" onClick={() => handleVote(p.id, false)}>
                      Vote Against
                    </Button>
                  </Box>
                )}
                 {isMember && p.state === 'Open' && p.hasVoted && (
                  <Typography variant="body2" color="text.secondary">You have already voted.</Typography>
                )}
                {isOwner && p.state === 'Open' && (
                  <Button size="small" variant="outlined" onClick={() => handleExecute(p.id)}>
                    Execute
                  </Button>
                )}
              </CardActions>
            </Card>
          ))}
        </Box>
      ) : (
        <Typography sx={{mt: 4}}>No proposals found.</Typography>
      )}
    </Container>
  );
};

export default DAOPage; 