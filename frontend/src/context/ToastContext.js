import { Snackbar, Alert } from '@mui/material';
import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext({ showToast: () => {} });

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({ open: false, message: '', severity: 'info' });

    const showToast = useCallback((message, severity = 'info') => {
        setToast({ open: true, message, severity });
    }, []);

    const handleClose = () => {
        setToast(t => ({ ...t, open: false }));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleClose}>
                <Alert onClose={handleClose} severity={toast.severity} sx={{ width: '100%' }}>
                    {toast.message}
                </Alert>
            </Snackbar>
        </ToastContext.Provider>
    );
};

export const useToast = () => useContext(ToastContext);
