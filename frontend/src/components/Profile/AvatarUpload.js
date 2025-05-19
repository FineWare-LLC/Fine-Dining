import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { Avatar, Box } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { generateInitialsAvatar } from '@/utils/avatar';

export default function AvatarUpload({ user, onUpload }) {
  const onDrop = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;
    const compressed = await imageCompression(file, { maxWidthOrHeight: 256 });
    onUpload(compressed);
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: 'image/*' });

  return (
    <Box
      {...getRootProps()}
      sx={{ width: 64, height: 64, border: '1px dashed', borderColor: isDragActive ? 'primary.main' : 'divider', borderRadius: '50%', p: 0.5, cursor: 'pointer' }}
    >
      <input {...getInputProps()} />
      <Avatar src={user.avatarUrl || generateInitialsAvatar(user.name)} alt={user.name} sx={{ width: '100%', height: '100%' }} />
    </Box>
  );
}

AvatarUpload.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    avatarUrl: PropTypes.string,
  }),
  onUpload: PropTypes.func.isRequired,
};
