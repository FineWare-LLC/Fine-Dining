/**
 * Brand header — fixed top bar with avatar + burger.
 */
import React, {useEffect, useState} from 'react';
import {AppBar, Avatar, IconButton, Toolbar, Typography} from '@mui/material';
import {generateInitialsAvatar} from '@/utils/avatar';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import {useDashStore} from './store';
import {useRouter} from 'next/router';
import {useAuth} from '@/context/AuthContext.js';

export default function NewHeader({user}) {
    const toggleDrawer = useDashStore(s => s.toggleDrawer);
    const [authUser, setAuthUser] = useState(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        try {
            const {user: contextUser} = useAuth();
            setAuthUser(contextUser);
        } catch (e) {
            // Auth context not available
        }
    }, []);

    const currentUser = user || (isClient ? authUser : null);
    const router = useRouter();
    const auth = useAuth();
    return (<AppBar elevation={0} sx={{bgcolor: 'primary.main', px: 2}}>
            <Toolbar disableGutters sx={{justifyContent: 'space-between'}}>
                <IconButton color="inherit" onClick={toggleDrawer}>
                    <MenuRoundedIcon/>
                </IconButton>
                <Typography variant="h6" fontWeight={600}>Fine Dining</Typography>
                <IconButton
                    color="inherit"
                    onClick={() => router.push('/profile')}
                    title="Profile"
                >
                    <Avatar
                        alt={currentUser?.name}
                        src={currentUser?.avatarUrl || generateInitialsAvatar(user?.name)}
                        sx={{width: 36, height: 36}}
                    />
                </IconButton>
            </Toolbar>
        </AppBar>);
}
