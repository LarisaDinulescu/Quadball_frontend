import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper, Container } from '@mui/material';

const Login = ({ onLoginSuccess, onSwitchToRegister }) => { // Aggiunta onSwitchToRegister
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simuliamo il login recuperando i dati dal localStorage per il test
    const savedUser = JSON.parse(localStorage.getItem('user'));
    
    if (savedUser && savedUser.email === email) {
      onLoginSuccess(savedUser);
    } else {
      // Se non trova l'utente registrato, creiamo un utente di test
      const mockUser = { 
          email: email, 
          name: 'Utente', 
          surname: 'Test', 
          role: 'Organizer' 
      };
      onLoginSuccess(mockUser);
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
          QUADBALLHOLIC LOGIN
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 1, py: 1.5 }}>
            Log In
          </Button>
          
          {/* QUESTO È IL TASTO CHE MANCAVA */}
          <Button 
            fullWidth 
            variant="text" 
            color="secondary" 
            onClick={onSwitchToRegister} // Attiva il passaggio alla registrazione
            sx={{ fontWeight: 'bold' }}
          >
            Are you here for the first time? Sign up
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;