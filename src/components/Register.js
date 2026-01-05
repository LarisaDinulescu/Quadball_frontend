import React, { useState } from 'react';
import { TextField, Button, Box, Typography, Paper, Container, MenuItem } from '@mui/material';

const Register = ({ onRegisterSuccess, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    age: '',
    email: '',
    password: '',
    role: 'Spectator' // Ruolo di default
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Qui simuli il salvataggio dei dati anagrafici
    localStorage.setItem('user', JSON.stringify(formData));
    onRegisterSuccess(formData);
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
        <Typography variant="h5" align="center" gutterBottom color="primary" sx={{ fontWeight: 'bold' }}>
          REGISTER
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField label="Name" name="name" fullWidth margin="dense" onChange={handleChange} required />
          <TextField label="Surname" name="surname" fullWidth margin="dense" onChange={handleChange} required />
          <TextField label="Age" name="age" type="number" fullWidth margin="dense" onChange={handleChange} required />
          <TextField label="Email" name="email" type="email" fullWidth margin="dense" onChange={handleChange} required />
          <TextField label="Password" name="password" type="password" fullWidth margin="dense" onChange={handleChange} required />
          
          <TextField
            select
            label="Role"
            name="role"
            fullWidth
            margin="dense"
            value={formData.role}
            onChange={handleChange}
          >
            <MenuItem value="Organizer">Organizer (O)</MenuItem>
            <MenuItem value="Team Manager">Team Manager (TM)</MenuItem>
            <MenuItem value="Spectator">Spectator (S)</MenuItem>
          </TextField>

          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ mt: 3, mb: 1 }}>
            Done
          </Button>
          <Button fullWidth variant="text" onClick={onSwitchToLogin}>
            Do you already have an account? Log In
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
