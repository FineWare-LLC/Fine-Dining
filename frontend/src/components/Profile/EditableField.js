import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography, TextField, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../../context/ToastContext';

const mutation = `
mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    weight
    height
  }
}`;

async function updateField({ userId, field, value }) {
  const res = await fetch('/api/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: mutation, variables: { id: userId, input: { [field]: value } } })
  });
  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors[0].message);
  }
  return json.data.updateUser;
}

export default function EditableField({ label, field, value: initialValue, unit, userId, measurementSystem }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialValue ?? '');
  const { showToast } = useToast();

  const isImperial = measurementSystem === 'IMPERIAL';
  const ranges = {
    height: isImperial ? [50, 96] : [127, 244],
    weight: isImperial ? [70, 600] : [32, 272]
  };
  const [min, max] = ranges[field] || [undefined, undefined];

  const mutationFn = useMutation({
    mutationFn: (newValue) => updateField({ userId, field, value: newValue }),
    onMutate: async (newValue) => {
      const previous = value;
      setValue(newValue);
      return { previous };
    },
    onError: (err, newValue, context) => {
      setValue(context.previous);
      showToast(`Failed to update ${label.toLowerCase()}`, 'error');
    }
  });

  const handleSave = () => {
    const num = Number(value);
    if (min !== undefined && (num < min || num > max)) {
      showToast(`${label} must be between ${min}-${max}${unit}`, 'error');
      return;
    }
    mutationFn.mutate(num);
    setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setValue(initialValue ?? '');
      setEditing(false);
    }
  };

  return (
    <div>
      <Typography variant="subtitle2">{label}</Typography>
      {editing ? (
        <TextField
          type="number"
          size="small"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          inputProps={{ min, max }}
        />
      ) : (
        <Typography variant="body2" onClick={() => setEditing(true)} sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
          {value ?? 'N/A'} {unit}
          <IconButton size="small" sx={{ ml: 0.5 }}>
            <EditIcon fontSize="inherit" />
          </IconButton>
        </Typography>
      )}
    </div>
  );
}

EditableField.propTypes = {
  label: PropTypes.string.isRequired,
  field: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  unit: PropTypes.string,
  userId: PropTypes.string.isRequired,
  measurementSystem: PropTypes.string.isRequired
};
