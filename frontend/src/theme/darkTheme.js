// Enhanced dark theme with food-inspired colors and modern design
import { createTheme } from '@mui/material/styles';

export default createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#F08E5D',
            light: '#F6B184',
            dark: '#D86E3D',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#7FAF7C',
            light: '#9BC397',
            dark: '#5E7A5A',
            contrastText: '#FFFFFF',
        },
        accent: {
            main: '#F3C767',
            light: '#F7D896',
            dark: '#DDA63F',
            contrastText: '#000000',
        },
        background: {
            default: '#14110F',
            paper: '#1C1815',
        },
        surface: {
            light: '#241F1B',
            medium: '#2B2622',
            dark: '#322C27',
        },
        role: {
            admin: '#EF9A9A',
            user: '#90CAF9',
            premium: '#CE93D8',
            super_admin: '#FFCC80',
        },
        state: {
            active: '#A5D6A7',
            pending: '#FFCC80',
            suspended: '#B39DDB',
            deleted: '#EEEEEE',
            archived: '#BDBDBD',
        },
        gradient: {
            primary: 'linear-gradient(135deg, #F08E5D 0%, #F3C767 100%)',
            secondary: 'linear-gradient(135deg, #7FAF7C 0%, #5E7A5A 100%)',
            accent: 'linear-gradient(135deg, #F3C767 0%, #DDA63F 100%)',
            hero: 'linear-gradient(120deg, #F08E5D 0%, #F3C767 50%, #7FAF7C 100%)',
        },
    },
    shape: {
        borderRadius: 18,
    },
    typography: {
        fontFamily: '"Manrope", "Helvetica Neue", "Arial", sans-serif',
        h1: {
            fontFamily: '"Fraunces", "Times New Roman", serif',
            fontWeight: 700,
            fontSize: '2.5rem',
            lineHeight: 1.2,
            color: '#FFFFFF',
        },
        h2: {
            fontFamily: '"Fraunces", "Times New Roman", serif',
            fontWeight: 600,
            fontSize: '2rem',
            lineHeight: 1.3,
            color: '#FFFFFF',
        },
        h3: {
            fontFamily: '"Fraunces", "Times New Roman", serif',
            fontWeight: 600,
            fontSize: '1.75rem',
            lineHeight: 1.3,
            color: '#FFFFFF',
        },
        h4: {
            fontFamily: '"Fraunces", "Times New Roman", serif',
            fontWeight: 600,
            fontSize: '1.5rem',
            lineHeight: 1.4,
            color: '#FFFFFF',
        },
        h5: {
            fontFamily: '"Fraunces", "Times New Roman", serif',
            fontWeight: 600,
            fontSize: '1.25rem',
            lineHeight: 1.4,
            color: '#FFFFFF',
        },
        h6: {
            fontFamily: '"Fraunces", "Times New Roman", serif',
            fontWeight: 600,
            fontSize: '1.125rem',
            lineHeight: 1.4,
            color: '#FFFFFF',
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
            color: '#E0E0E0',
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.6,
            color: '#BDBDBD',
        },
        button: {
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '0.875rem',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: '10px 24px',
                    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.45)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 14px 32px rgba(0, 0, 0, 0.55)',
                    },
                },
                contained: {
                    background: 'linear-gradient(135deg, #F08E5D 0%, #F3C767 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #D86E3D 0%, #F08E5D 70%, #F3C767 100%)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 22,
                    backgroundColor: '#1C1815',
                    boxShadow: '0 10px 32px rgba(0, 0, 0, 0.55)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 18px 52px rgba(0, 0, 0, 0.65)',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(135deg, #F08E5D 0%, #F3C767 100%)',
                    boxShadow: '0 8px 24px rgba(240, 142, 93, 0.35)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    fontWeight: 500,
                    backgroundColor: '#2A2A2A',
                    color: '#FFFFFF',
                },
            },
        },
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
        '0 92px 192px rgba(0, 0, 0, 1)',
    ],
});
