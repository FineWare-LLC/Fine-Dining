import { gql, useMutation } from '@apollo/client';
import { Box, TextField, Button } from '@mui/material';
import React, { useState } from 'react';
import { useToastStore } from '../../store/toastStore';

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      avatarUrl
    }
  }
`;

export default function ProfileEditor({ user }) {
    const [name, setName] = useState(user.name);
    const [updateUser] = useMutation(UPDATE_USER);
    const addToast = useToastStore((s) => s.addToast);
    const removeToast = useToastStore((s) => s.removeToast);

    const handleSaveName = async () => {
        const tid = addToast({ message: 'Saving profile…', type: 'info' });
        try {
            await updateUser({ variables: { id: user.id, input: { name } } });
            removeToast(tid);
            addToast({ message: 'Profile updated', type: 'success' });
        } catch (err) {
            removeToast(tid);
            addToast({ message: 'Update failed', type: 'error' });
        }
    };

    const handleAvatar = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        const tid = addToast({ message: 'Uploading avatar…', type: 'info' });
        try {
            await updateUser({ variables: { id: user.id, input: { avatarUrl: url } } });
            removeToast(tid);
            addToast({ message: 'Avatar updated', type: 'success' });
        } catch (err) {
            removeToast(tid);
            addToast({ message: 'Avatar upload failed', type: 'error' });
        }
    };

    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField size="small" value={name} onChange={(e) => setName(e.target.value)} />
                <Button variant="contained" onClick={handleSaveName}>Save</Button>
            </Box>
            <Box sx={{ mt: 2 }}>
                <input type="file" accept="image/*" onChange={handleAvatar} />
            </Box>
        </Box>
    );
}
