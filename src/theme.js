import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e', 
    },
    secondary: {
      main: '#ffab00', 
    },
    background: {
      default: '#f4f4f4', 
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
  },
});

export default theme;