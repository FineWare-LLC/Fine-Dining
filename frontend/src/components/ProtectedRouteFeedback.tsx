// @ts-nocheck
import { Box, CircularProgress, Paper, Typography } from '@mui/material';
import { buildAuthFeedbackContainerStyles } from '@/context/authUtils';

export default function ProtectedRouteFeedback({ feedback }) {
    const feedbackSurfaceStyles = buildAuthFeedbackContainerStyles(feedback.state);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#14110F',
                px: 2,
            }}
        >
            <Paper
                component="section"
                elevation={0}
                sx={{
                    width: '100%',
                    maxWidth: 560,
                    p: { xs: 3, md: 4 },
                    bgcolor: '#1C1815',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 3,
                }}
            >
                <Box
                    id="protected-route-feedback"
                    role={feedback.role}
                    aria-live={feedback.ariaLive}
                    aria-atomic="true"
                    aria-busy={feedback.state === 'loading' ? 'true' : 'false'}
                    sx={{
                        minHeight: feedback.minHeight,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        px: 1.5,
                        py: 1,
                        borderRadius: 1.5,
                        ...feedbackSurfaceStyles,
                    }}
                >
                    {feedback.showSpinner && <CircularProgress size={18} />}
                    <Typography
                        variant="body2"
                        sx={{
                            color: feedback.state === 'error'
                                ? 'error.main'
                                : feedback.state === 'success'
                                    ? 'success.main'
                                    : 'text.secondary',
                            fontWeight: feedback.state === 'success' ? 700 : 400,
                        }}
                    >
                        {feedback.message}
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}
