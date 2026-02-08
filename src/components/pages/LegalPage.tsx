import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Paper,
    IconButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

/**
 * LegalPage Component
 * 
 * Displays Privacy Policy, Terms of Use, and Refund & Cancellation Policy
 */
const LegalPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(180deg, #F4F4F5 0%, #FAFAFA 100%)',
                pb: 8,
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
                    py: 4,
                    px: 2,
                }}
            >
                <Container maxWidth="md">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <IconButton
                            onClick={() => navigate('/')}
                            sx={{ color: 'white' }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography
                            variant="h4"
                            sx={{
                                fontFamily: 'Pacifico, cursive',
                                color: 'white',
                            }}
                        >
                            floc
                        </Typography>
                    </Box>
                    <Typography
                        variant="h5"
                        sx={{
                            color: 'white',
                            fontWeight: 600,
                            mt: 3,
                        }}
                    >
                        Legal & Policies
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="md" sx={{ mt: 4 }}>
                {/* Privacy Policy Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        mb: 3,
                        border: '1px solid #E4E4E7',
                    }}
                    id="privacy-policy"
                >
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: '#0D9488', mb: 3 }}
                    >
                        Privacy Policy
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#18181B', mb: 0.5 }}>
                                1. Data Collection
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#52525B', lineHeight: 1.7 }}>
                                We collect information you provide during registration, including your name, email, mobile number, and age.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#18181B', mb: 0.5 }}>
                                2. Purpose of Use
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#52525B', lineHeight: 1.7 }}>
                                Your data is used to facilitate game bookings, process payments via third-party gateways (Razorpay), and send transaction-related alerts.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#18181B', mb: 0.5 }}>
                                3. Third-Party Sharing
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#52525B', lineHeight: 1.7 }}>
                                We share necessary transaction data with Razorpay to process payments. We do not sell your personal information to third parties.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#18181B', mb: 0.5 }}>
                                4. Children's Privacy
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#52525B', lineHeight: 1.7 }}>
                                We do not knowingly collect data from children under 18 without verifiable parental consent.
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Terms of Use Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        mb: 3,
                        border: '1px solid #E4E4E7',
                    }}
                    id="terms-of-use"
                >
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: '#0D9488', mb: 3 }}
                    >
                        Terms of Use
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#18181B', mb: 0.5 }}>
                                1. Account Responsibility
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#52525B', lineHeight: 1.7 }}>
                                You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#18181B', mb: 0.5 }}>
                                2. Transaction Terms
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#52525B', lineHeight: 1.7 }}>
                                A "Transaction" occurs when a player pays to join an event. This results in a debit to the player's payment instrument.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#18181B', mb: 0.5 }}>
                                3. Limitation of Liability
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#52525B', lineHeight: 1.7 }}>
                                Floc is an intermediary platform. We are not liable for any injuries, losses, or conduct occurring during physical sports events organized through the app.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#18181B', mb: 0.5 }}>
                                4. Prohibited Uses
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#52525B', lineHeight: 1.7 }}>
                                Users must not use the platform for illegal activities, fraud, or to bypass payment systems.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#18181B', mb: 0.5 }}>
                                5. Indemnity
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#52525B', lineHeight: 1.7 }}>
                                You agree to indemnify Floc against any claims or losses arising from your breach of these terms.
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Refund & Cancellation Policy Section */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        borderRadius: 3,
                        mb: 3,
                        border: '1px solid #E4E4E7',
                    }}
                    id="refund-policy"
                >
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, color: '#0D9488', mb: 3 }}
                    >
                        Refund & Cancellation Policy
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#18181B', mb: 0.5 }}>
                                1. Organizer Cancellations
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#52525B', lineHeight: 1.7 }}>
                                If an organizer cancels an event (e.g., due to weather or lack of players), participants will receive a 100% refund.
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#18181B', mb: 0.5 }}>
                                2. Player Cancellations
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#52525B', lineHeight: 1.7 }}>
                                • Cancellations made 48 hours or more before the event: Full Refund.
                                <br />
                                • Cancellations made within 24 hours of the event: No Refund (unless the slot is filled by another player).
                            </Typography>
                        </Box>

                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#18181B', mb: 0.5 }}>
                                3. Processing Timelines
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#52525B', lineHeight: 1.7 }}>
                                Approved refunds will be credited back to the original payment method within 5–7 business days.
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default LegalPage;
