/**
 * Enhanced brand header with modern design and animations
 */
import MenuRoundedIconModule from '@mui/icons-material/MenuRounded';
import NotificationsIconModule from '@mui/icons-material/Notifications';
import RestaurantIconModule from '@mui/icons-material/Restaurant';
import {
    AppBar,
    Avatar,
    IconButton,
    Toolbar,
    Typography,
    Box,
    Badge,
    useTheme,
} from '@mui/material';
import {useRouter} from 'next/router.js';
import React, {useEffect, useState} from 'react';
import {useDashStore} from './store';
import {useAuth} from '@/context/AuthContext.js';
import {generateInitialsAvatar} from '@/utils/avatar';
import { resolveMuiIcon } from '@/utils/muiIcon';
import { useQuery } from '@apollo/client/react';
import { gql } from '@apollo/client';

// GraphQL query to get unread notification count
const GET_UNREAD_NOTIFICATION_COUNT = gql`
    query GetUnreadNotificationCount($recipientId: ID!) {
        getUnreadNotificationCount(recipientId: $recipientId)
    }
`;

const MenuRoundedIcon = resolveMuiIcon(MenuRoundedIconModule);
const NotificationsIcon = resolveMuiIcon(NotificationsIconModule);
const RestaurantIcon = resolveMuiIcon(RestaurantIconModule);

const isMongoId = (value) => typeof value === 'string' && /^[a-f\\d]{24}$/i.test(value);

export default function NewHeader({ user, appearance = 'gradient' }) {
    const { user: contextUser } = useAuth();
    const toggleDrawer = useDashStore(s => s.toggleDrawer);
    const [authUser, setAuthUser] = useState(null);
    const [isClient, setIsClient] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        setIsClient(true);
        setAuthUser(contextUser);
    }, [contextUser]);

    const currentUser = user || (isClient ? authUser : null);
    const router = useRouter();

    const canQueryNotifications = Boolean(currentUser?.id && isMongoId(currentUser.id));

    // Fetch unread notification count
    const { data: notificationData } = useQuery(
        GET_UNREAD_NOTIFICATION_COUNT,
        {
            variables: { recipientId: currentUser?.id },
            skip: !canQueryNotifications, // Skip query if no valid user ID
            pollInterval: canQueryNotifications ? 30000 : 0, // Poll every 30 seconds for real-time updates
            errorPolicy: 'ignore' // Don't show errors in UI for notifications
        }
    );

    const unreadCount = notificationData?.getUnreadNotificationCount || 0;

    const appBarSx = appearance === 'glass'
        ? {
            background: 'rgba(255, 255, 255, 0.2)',
            color: '#1C1C1F',
            backdropFilter: 'blur(22px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 12px 30px rgba(16, 18, 30, 0.12)',
        }
        : {
            background: theme.palette.gradient?.primary || 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        };

    return (
        <AppBar
            elevation={0}
            sx={appBarSx}
        >
            <Toolbar
                disableGutters
                sx={{
                    justifyContent: 'space-between',
                    px: 2,
                    minHeight: '72px !important',
                }}
            >
                {/* Left Section - Menu Button */}
                <IconButton
                    color="inherit"
                    onClick={toggleDrawer}
                    sx={{
                        borderRadius: 2,
                        p: 1.5,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            transform: 'scale(1.05)',
                        },
                    }}
                >
                    <MenuRoundedIcon sx={{ fontSize: 28 }} />
                </IconButton>

                {/* Center Section - Brand */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            transform: 'scale(1.02)',
                        },
                    }}
                    onClick={() => router.push('/dashboard')}
                >
                    <RestaurantIcon
                        sx={{
                            fontSize: 32,
                            color: 'white',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                        }}
                    />
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            background: 'linear-gradient(45deg, #FFFFFF 30%, #FFE0B2 90%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            letterSpacing: '-0.5px',
                        }}
                    >
                        Fine Dining
                    </Typography>
                </Box>

                {/* Right Section - Notifications & Profile */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Notifications */}
                    <IconButton
                        color="inherit"
                        onClick={() => {
                            // TODO: Open notification panel/dropdown
                            console.log('Notifications clicked - unread count:', unreadCount);
                        }}
                        sx={{
                            borderRadius: 2,
                            p: 1.5,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                transform: 'scale(1.05)',
                            },
                        }}
                    >
                        <Badge
                            badgeContent={unreadCount > 0 ? unreadCount : null}
                            color="secondary"
                            sx={{
                                '& .MuiBadge-badge': {
                                    backgroundColor: '#4CAF50',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                },
                            }}
                        >
                            <NotificationsIcon sx={{ fontSize: 24 }} />
                        </Badge>
                    </IconButton>

                    {/* Profile Avatar */}
                    <IconButton
                        color="inherit"
                        onClick={() => router.push('/profile')}
                        title="Profile"
                        sx={{
                            p: 0.5,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                transform: 'scale(1.05)',
                            },
                        }}
                    >
                        <Avatar
                            alt={currentUser?.name || 'User'}
                            src={currentUser?.avatarUrl || generateInitialsAvatar(currentUser?.name)}
                            sx={{
                                width: 44,
                                height: 44,
                                border: '3px solid rgba(255, 255, 255, 0.3)',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                transition: 'all 0.3s ease',
                                '&:hover': {
                                    border: '3px solid rgba(255, 255, 255, 0.5)',
                                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
                                },
                            }}
                        />
                    </IconButton>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
