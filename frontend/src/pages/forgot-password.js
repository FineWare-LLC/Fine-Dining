/**
 * Forgot Password page with modern design
 */
import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  useTheme,
  IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ForgotPassword() {
  const theme = useTheme();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/signin');
  };

  return (
    <>
      <Head>
        <title>Forgot Password - Fine Dining</title>
        <meta name="description" content="Reset your Fine Dining account password" />
      </Head>

      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            py: 4,
          }}
        >
          <Card
            sx={{
              width: '100%',
              maxWidth: 400,
              borderRadius: 4,
              boxShadow: theme.shadows[8],
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <Box
              sx={{
                background: theme.palette.gradient?.primary || 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
                p: 3,
                position: 'relative',
              }}
            >
              <IconButton
                onClick={handleBackToLogin}
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                <ArrowBackIcon />
              </IconButton>

              <Box sx={{ textAlign: 'center', pt: 2 }}>
                <EmailIcon sx={{ fontSize: 48, color: 'white', mb: 1 }} />
                <Typography
                  variant="h5"
                  sx={{
                    color: 'white',
                    fontWeight: 700,
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  Forgot Password?
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    mt: 1,
                  }}
                >
                  No worries, we&apos;ll send you reset instructions
                </Typography>
              </Box>
            </Box>

            <CardContent sx={{ p: 4 }}>
              {success ? (
                <Box sx={{ textAlign: 'center' }}>
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Reset instructions sent to your email!
                  </Alert>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Check your email for a link to reset your password. If it doesn&apos;t appear within a few minutes, check your spam folder.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleBackToLogin}
                    sx={{
                      background: theme.palette.gradient?.primary,
                      '&:hover': {
                        background: theme.palette.gradient?.primary,
                        opacity: 0.9,
                      },
                    }}
                  >
                    Back to Login
                  </Button>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleSubmit}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      {error}
                    </Alert>
                  )}

                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    sx={{
                      mb: 3,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading || !email}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      background: theme.palette.gradient?.primary,
                      '&:hover': {
                        background: theme.palette.gradient?.primary,
                        opacity: 0.9,
                      },
                      '&:disabled': {
                        background: theme.palette.action.disabledBackground,
                      },
                    }}
                  >
                    {loading ? (
                      <LoadingSpinner size="small" variant="dots" />
                    ) : (
                      'Send Reset Instructions'
                    )}
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Button
                      variant="text"
                      onClick={handleBackToLogin}
                      sx={{
                        color: theme.palette.text.secondary,
                        '&:hover': {
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      ← Back to Login
                    </Button>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Container>
    </>
  );
}
