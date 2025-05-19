import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box
} from '@mui/material';
import Image from 'next/image';
import copy from '../../i18n/en.json';

export default function HelpModal({ open, onClose }) {
  const { title, description, image } = copy.help.desiredWeight;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="help-dialog-title"
    >
      <DialogTitle id="help-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Image src={image} alt={title} width={120} height={120} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

HelpModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};
