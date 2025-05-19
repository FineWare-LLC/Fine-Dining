/**
 * Persistent bottom search bar; expands to pill‑input when focused.
 */
import React, { useRef } from 'react';
import { Box, IconButton, InputBase, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useDashStore } from './store';

export default function BottomSearchRail() {
  const searchTerm = useDashStore(s => s.searchTerm);
  const setSearchTerm = useDashStore(s => s.setSearchTerm);
  const inputRef = useRef(null);

  return (
    <Paper
      square
      sx={{
        position:'fixed', bottom:0, left:0, right:0, py:1, px:2,
        bgcolor:'surface.light', borderTop:1, borderColor:'brand.surface',
      }}
    >
      <Box display="flex" alignItems="center" gap={1}>
        <IconButton onClick={() => inputRef.current?.focus()} size="large">
          <SearchIcon />
        </IconButton>
        <InputBase
          inputRef={inputRef}
          value={searchTerm}
          onChange={(e)=>setSearchTerm(e.target.value)}
          placeholder="Search restaurants…"
          fullWidth
          sx={{ bgcolor:'#fff', px:2, py:1, borderRadius:'pill', border:1, borderColor:'brand.surface' }}
        />
      </Box>
    </Paper>
  );
}
