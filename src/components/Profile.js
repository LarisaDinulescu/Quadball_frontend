import React from 'react';
import { Container, Paper, Typography, Box, Grid, Avatar, Divider } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Profile = ({ user }) => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ bgcolor: 'secondary.main', width: 56, height: 56, mr: 2 }}>
            <AccountCircleIcon fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
              Profile
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Role: {user.role || 'Not specified'} {/* Organizer, Spectator or TM */}
            </Typography>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="overline" color="text.secondary">Nome</Typography>
            <Typography variant="h6">{user.name || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="overline" color="text.secondary">Cognome</Typography>
            <Typography variant="h6">{user.surname || 'N/A'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="overline" color="text.secondary">Età</Typography>
            <Typography variant="h6">{user.age || 'N/A'} anni</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="overline" color="text.secondary">Email di sistema</Typography>
            <Typography variant="h6">{user.email}</Typography>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile;
