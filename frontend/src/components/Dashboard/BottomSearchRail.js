/**
 * @file BottomSearchRail.js
 * @description Hardened, bottom‑right, expandable search bar that plays well
 *              with both client and server renders.
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  memo,
} from 'react';

import PropTypes from 'prop-types';
import {
  Box,
  IconButton,
  InputBase,
  ClickAwayListener,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

/* ---- Zustand store (default) ------------------------------------------ */
import { useDashStore as defaultDashStore } from './store';

/* ----------------------------------------------------------------------- */
/* Utility: debounce ------------------------------------------------------ */
const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

/* Utility: minimal input sanitiser -------------------------------------- */
const sanitizeInput = (v) =>
    typeof v === 'string' ? v.replace(/[<>&"']/g, '') : '';

/* ----------------------------------------------------------------------- */
const BottomSearchRail = ({ storeHook = defaultDashStore }) => {
  /* ---------- store interaction (fallback‑safe) ------------------------ */
  if (typeof storeHook !== 'function') {
    // Graceful degradation if someone passes junk
    console.error(
        'BottomSearchRail: storeHook prop must be a function; falling back to internal store.'
    );
    storeHook = defaultDashStore;
  }

  const rawSearchTerm = storeHook((s) => s.searchTerm);
  const setSearchTerm = storeHook((s) => s.setSearchTerm);

  /* ---------- theme (SSR‑safe fallback) -------------------------------- */
  const theme =
      useTheme() ??
      ({
        spacing: (n) => n * 8,
        shape: { borderRadius: 8 },
        zIndex: { modal: 1400 },
        palette: {
          mode: 'light',
          primary: { main: '#1976d2' },
          background: { paper: '#fff' },
          text: { primary: '#000', secondary: '#666', disabled: '#999' },
        },
        transitions: {
          create: () => 'all 200ms cubic-bezier(0.4,0,0.2,1)',
          duration: { short: 200 },
          easing: { easeInOut: 'cubic-bezier(0.4,0,0.2,1)' },
        },
      });

  /* ---------- local state --------------------------------------------- */
  const [expanded, setExpanded] = useState(false);
  const [inputValue, setInputValue] = useState(rawSearchTerm || '');
  const debouncedValue = useDebounce(inputValue);

  /* ---------- sync debounced value to store --------------------------- */
  useEffect(() => {
    if (debouncedValue !== rawSearchTerm) setSearchTerm(debouncedValue);
  }, [debouncedValue, rawSearchTerm, setSearchTerm]);

  /* ---------- external store → input sync ----------------------------- */
  useEffect(() => {
    if (rawSearchTerm !== inputValue) setInputValue(rawSearchTerm || '');
  }, [rawSearchTerm, inputValue]);

  /* ---------- refs / ids ---------------------------------------------- */
  const inputRef = useRef(null);
  const inputId = useId();

  /* ---------- handlers ------------------------------------------------- */
  const collapse = useCallback(() => setExpanded(false), []);
  const expand = useCallback(() => setExpanded(true), []);

  const handleInputChange = useCallback((e) => {
    setInputValue(sanitizeInput(e.target.value));
  }, []);

  const handleKeyDown = useCallback(
      (e) => {
        if (e.key === 'Escape') collapse();
      },
      [collapse]
  );

  /* focus after expand */
  useEffect(() => {
    if (expanded) {
      const t = setTimeout(
          () => inputRef.current?.focus(),
          (theme.transitions?.duration?.short ?? 200) + 40
      );
      return () => clearTimeout(t);
    }
  }, [expanded, theme.transitions?.duration?.short]);

  /* ---------- dynamic styles ------------------------------------------ */
  const width = expanded ? 'min(90%, 600px)' : 56;
  const borderRadius = expanded
      ? `${theme.shape.borderRadius * 1.5}px`
      : '50%';
  const paddingX = expanded ? theme.spacing(2) : 0;

  return (
      <ClickAwayListener onClickAway={collapse}>
        <Box
            component="form"
            role="search"
            aria-label="Site search"
            onSubmit={(e) => e.preventDefault()}
            sx={{
              position: 'fixed',
              bottom: theme.spacing(3),
              right: theme.spacing(2),
              display: 'flex',
              alignItems: 'center',
              width,
              height: 56,
              px: paddingX,
              bgcolor:
                  theme.palette.mode === 'light'
                      ? 'surface.light' || theme.palette.background.paper
                      : theme.palette.background.paper,
              color: 'text.primary',
              borderRadius,
              boxShadow:
                  theme.palette.mode === 'light'
                      ? '0 2px 6px rgba(0,0,0,0.15)'
                      : '0 4px 8px rgba(0,0,0,0.4)',
              transition:
                  theme.transitions?.create?.(
                      ['width', 'border-radius', 'padding', 'background-color'],
                      {
                        duration: theme.transitions?.duration?.short ?? 200,
                        easing:
                            theme.transitions?.easing?.easeInOut ??
                            'cubic-bezier(0.4,0,0.2,1)',
                      }
                  ) ?? 'all 200ms cubic-bezier(0.4,0,0.2,1)',
              zIndex: theme.zIndex.modal,
            }}
        >
          {expanded ? (
              <>
                <InputBase
                    id={inputId}
                    inputRef={inputRef}
                    placeholder="Search restaurants…"
                    aria-label="Search input"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    fullWidth
                    sx={{
                      ml: 1,
                      color: 'text.primary',
                      '& .MuiInputBase-input::placeholder': {
                        color: 'text.disabled',
                        opacity: 1,
                      },
                    }}
                />
                <IconButton
                    aria-label="Clear search and collapse"
                    onClick={() => {
                      setInputValue('');
                      setSearchTerm('');
                      collapse();
                    }}
                    size="small"
                    sx={{ color: 'text.secondary', ml: 0.5 }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </>
          ) : (
              <IconButton
                  aria-label="Expand search"
                  onClick={expand}
                  color="primary"
                  sx={{ width: '100%', height: '100%' }}
              >
                <SearchIcon />
              </IconButton>
          )}
        </Box>
      </ClickAwayListener>
  );
};

/* ---------- prop‑types -------------------------------------------------- */
BottomSearchRail.propTypes = {
  /** Optional injection of a Zustand hook for testing; defaults to internal */
  storeHook: PropTypes.func,
};

/* ----------------------------------------------------------------------- */
export default memo(BottomSearchRail);
