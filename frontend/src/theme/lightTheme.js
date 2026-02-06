// Enhanced light theme with food-inspired colors and modern design
import { createTheme } from '@mui/material/styles';

export default createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#C65D2B',
            light: '#E07A44',
            dark: '#9F4A21',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#5E7A5A',
            light: '#7F9C7A',
            dark: '#456044',
            contrastText: '#FFFFFF',
        },
        accent: {
            main: '#E7B14B',
            light: '#F2C974',
            dark: '#C8922E',
            contrastText: '#000000',
        },
        background: {
            default: '#FBF5EE',
            paper: '#FFFFFF',
        },
        surface: {
            light: '#F7F1E9',
            medium: '#EFE7DE',
            dark: '#E6DDD3',
        },
        role: {
            admin: '#E57373',
            user: '#64B5F6',
            premium: '#BA68C8',
            super_admin: '#FFB74D',
        },
        state: {
            active: '#81C784',
            pending: '#FFB74D',
            suspended: '#9575CD',
            deleted: '#E0E0E0',
            archived: '#BDBDBD',
        },
        gradient: {
            primary: 'linear-gradient(135deg, #C65D2B 0%, #E07A44 45%, #E7B14B 100%)',
            secondary: 'linear-gradient(135deg, #5E7A5A 0%, #7F9C7A 100%)',
            accent: 'linear-gradient(135deg, #E7B14B 0%, #F2C974 100%)',
            hero: 'linear-gradient(120deg, #C65D2B 0%, #E7B14B 50%, #5E7A5A 100%)',
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
        },
        h2: {
            fontFamily: '"Fraunces", "Times New Roman", serif',
            fontWeight: 600,
            fontSize: '2rem',
            lineHeight: 1.3,
        },
        h3: {
            fontFamily: '"Fraunces", "Times New Roman", serif',
            fontWeight: 600,
            fontSize: '1.75rem',
            lineHeight: 1.3,
        },
        h4: {
            fontFamily: '"Fraunces", "Times New Roman", serif',
            fontWeight: 600,
            fontSize: '1.5rem',
            lineHeight: 1.4,
        },
        h5: {
            fontFamily: '"Fraunces", "Times New Roman", serif',
            fontWeight: 600,
            fontSize: '1.25rem',
            lineHeight: 1.4,
        },
        h6: {
            fontFamily: '"Fraunces", "Times New Roman", serif',
            fontWeight: 600,
            fontSize: '1.125rem',
            lineHeight: 1.4,
        },
        body1: {
            fontSize: '1rem',
            lineHeight: 1.6,
        },
        body2: {
            fontSize: '0.875rem',
            lineHeight: 1.6,
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
                    boxShadow: '0 6px 18px rgba(47, 42, 38, 0.12)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 14px 32px rgba(47, 42, 38, 0.18)',
                    },
                },
                contained: {
                    background: 'linear-gradient(135deg, #C65D2B 0%, #E07A44 45%, #E7B14B 100%)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #9F4A21 0%, #C65D2B 60%, #E7B14B 100%)',
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 22,
                    boxShadow: '0 10px 30px rgba(47, 42, 38, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 18px 48px rgba(47, 42, 38, 0.16)',
                    },
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    background: 'linear-gradient(135deg, #C65D2B 0%, #E07A44 45%, #E7B14B 100%)',
                    boxShadow: '0 8px 24px rgba(198, 93, 43, 0.3)',
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    fontWeight: 500,
                },
            },
        },
    },
    shadows: [
        'none',
        '0 2px 8px rgba(0, 0, 0, 0.05)',
        '0 4px 12px rgba(0, 0, 0, 0.08)',
        '0 8px 24px rgba(0, 0, 0, 0.1)',
        '0 12px 32px rgba(0, 0, 0, 0.12)',
        '0 16px 40px rgba(0, 0, 0, 0.14)',
        '0 20px 48px rgba(0, 0, 0, 0.16)',
        '0 24px 56px rgba(0, 0, 0, 0.18)',
        '0 28px 64px rgba(0, 0, 0, 0.2)',
        '0 32px 72px rgba(0, 0, 0, 0.22)',
        '0 36px 80px rgba(0, 0, 0, 0.24)',
        '0 40px 88px rgba(0, 0, 0, 0.26)',
        '0 44px 96px rgba(0, 0, 0, 0.28)',
        '0 48px 104px rgba(0, 0, 0, 0.3)',
        '0 52px 112px rgba(0, 0, 0, 0.32)',
        '0 56px 120px rgba(0, 0, 0, 0.34)',
        '0 60px 128px rgba(0, 0, 0, 0.36)',
        '0 64px 136px rgba(0, 0, 0, 0.38)',
        '0 68px 144px rgba(0, 0, 0, 0.4)',
        '0 72px 152px rgba(0, 0, 0, 0.42)',
        '0 76px 160px rgba(0, 0, 0, 0.44)',
        '0 80px 168px rgba(0, 0, 0, 0.46)',
        '0 84px 176px rgba(0, 0, 0, 0.48)',
        '0 88px 184px rgba(0, 0, 0, 0.5)',
        '0 92px 192px rgba(0, 0, 0, 0.52)',
    ],
});
