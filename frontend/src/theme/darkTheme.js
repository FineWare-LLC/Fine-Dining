// Enhanced dark theme with food-inspired colors and modern design
import { createTheme } from '@mui/material/styles';

export default createTheme({
  palette: {
    mode: 'dark',
    primary: { 
      main: '#FF8A65',
      light: '#FFAB91',
      dark: '#FF5722',
      contrastText: '#FFFFFF'
    },
    secondary: { 
      main: '#66BB6A',
      light: '#81C784',
      dark: '#4CAF50',
      contrastText: '#FFFFFF'
    },
    accent: { 
      main: '#FFD54F',
      light: '#FFECB3',
      dark: '#FFC107',
      contrastText: '#000000'
    },
    background: { 
      default: '#0A0A0A',
      paper: '#1A1A1A'
    },
    surface: { 
      light: '#2A2A2A',
      medium: '#333333',
      dark: '#404040'
    },
    role: {
      admin: '#EF9A9A',
      user: '#90CAF9',
      premium: '#CE93D8',
      super_admin: '#FFCC80'
    },
    state: {
      active: '#A5D6A7',
      pending: '#FFCC80',
      suspended: '#B39DDB',
      deleted: '#EEEEEE',
      archived: '#BDBDBD'
    },
    gradient: {
      primary: 'linear-gradient(135deg, #FF8A65 0%, #FF7043 100%)',
      secondary: 'linear-gradient(135deg, #66BB6A 0%, #4CAF50 100%)',
      accent: 'linear-gradient(135deg, #FFD54F 0%, #FFC107 100%)',
      hero: 'linear-gradient(135deg, #FF8A65 0%, #FFD54F 50%, #66BB6A 100%)'
    }
  },
  shape: { 
    borderRadius: 16 
  },
  typography: { 
    fontFamily: '"Inter", "Poppins", "Roboto", "Helvetica Neue", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      color: '#FFFFFF'
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
      color: '#FFFFFF'
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      color: '#FFFFFF'
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      color: '#FFFFFF'
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      color: '#FFFFFF'
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
      color: '#FFFFFF'
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      color: '#E0E0E0'
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      color: '#BDBDBD'
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '0.875rem',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
          }
        },
        contained: {
          background: 'linear-gradient(135deg, #FF8A65 0%, #FF7043 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #FF7043 0%, #FF5722 100%)',
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          backgroundColor: '#1A1A1A',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
          }
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #FF8A65 0%, #FF7043 100%)',
          boxShadow: '0 4px 20px rgba(255, 138, 101, 0.4)',
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          fontWeight: 500,
          backgroundColor: '#2A2A2A',
          color: '#FFFFFF'
        }
      }
    }
  },
  shadows: [
    'none',
    '0 2px 8px rgba(0, 0, 0, 0.2)',
    '0 4px 12px rgba(0, 0, 0, 0.25)',
    '0 8px 24px rgba(0, 0, 0, 0.3)',
    '0 12px 32px rgba(0, 0, 0, 0.35)',
    '0 16px 40px rgba(0, 0, 0, 0.4)',
    '0 20px 48px rgba(0, 0, 0, 0.45)',
    '0 24px 56px rgba(0, 0, 0, 0.5)',
    '0 28px 64px rgba(0, 0, 0, 0.55)',
    '0 32px 72px rgba(0, 0, 0, 0.6)',
    '0 36px 80px rgba(0, 0, 0, 0.65)',
    '0 40px 88px rgba(0, 0, 0, 0.7)',
    '0 44px 96px rgba(0, 0, 0, 0.75)',
    '0 48px 104px rgba(0, 0, 0, 0.8)',
    '0 52px 112px rgba(0, 0, 0, 0.85)',
    '0 56px 120px rgba(0, 0, 0, 0.9)',
    '0 60px 128px rgba(0, 0, 0, 0.95)',
    '0 64px 136px rgba(0, 0, 0, 1)',
    '0 68px 144px rgba(0, 0, 0, 1)',
    '0 72px 152px rgba(0, 0, 0, 1)',
    '0 76px 160px rgba(0, 0, 0, 1)',
    '0 80px 168px rgba(0, 0, 0, 1)',
    '0 84px 176px rgba(0, 0, 0, 1)',
    '0 88px 184px rgba(0, 0, 0, 1)',
    '0 92px 192px rgba(0, 0, 0, 1)'
  ]
});
