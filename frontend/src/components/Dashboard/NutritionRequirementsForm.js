/**
 * NutritionRequirementsForm.js
 * 
 * Component for inputting custom nutritional requirements.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Slider,
  Grid,
  InputAdornment,
  Button,
  Divider
} from '@mui/material';

/**
 * Form for inputting custom nutritional requirements.
 * 
 * @param {Object} props - Component props
 * @param {Object} props.defaultValues - Default nutrition values
 * @param {Function} props.onChange - Callback function when values change
 * @returns {JSX.Element} The rendered component
 */
const NutritionRequirementsForm = ({ defaultValues = {}, onChange }) => {
  const [values, setValues] = useState({
    proteinMin: defaultValues.proteinMin || 50,
    proteinMax: defaultValues.proteinMax || 150,
    carbohydratesMin: defaultValues.carbohydratesMin || 100,
    carbohydratesMax: defaultValues.carbohydratesMax || 300,
    fatMin: defaultValues.fatMin || 30,
    fatMax: defaultValues.fatMax || 100,
    sodiumMin: defaultValues.sodiumMin || 500,
    sodiumMax: defaultValues.sodiumMax || 2300
  });

  // Update parent component when values change
  useEffect(() => {
    if (onChange) {
      onChange(values);
    }
  }, [values, onChange]);

  // Handle input change
  const handleInputChange = (name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle slider change
  const handleSliderChange = (name, newValue) => {
    setValues(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  // Reset to default values
  const handleReset = () => {
    setValues({
      proteinMin: defaultValues.proteinMin || 50,
      proteinMax: defaultValues.proteinMax || 150,
      carbohydratesMin: defaultValues.carbohydratesMin || 100,
      carbohydratesMax: defaultValues.carbohydratesMax || 300,
      fatMin: defaultValues.fatMin || 30,
      fatMax: defaultValues.fatMax || 100,
      sodiumMin: defaultValues.sodiumMin || 500,
      sodiumMax: defaultValues.sodiumMax || 2300
    });
  };

  return (
    <Card sx={{ mb: 3, mt: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          Nutritional Requirements
        </Typography>
        
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Customize your nutritional targets for the optimized meal plan.
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          {/* Protein */}
          <Typography id="protein-slider" gutterBottom>
            Protein (g)
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={2}>
              <TextField
                value={values.proteinMin}
                onChange={(e) => handleInputChange('proteinMin', Number(e.target.value))}
                inputProps={{
                  step: 5,
                  min: 0,
                  max: values.proteinMax,
                  type: 'number',
                  'aria-labelledby': 'protein-slider',
                }}
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">g</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={8}>
              <Slider
                value={[values.proteinMin, values.proteinMax]}
                onChange={(e, newValue) => {
                  handleSliderChange('proteinMin', newValue[0]);
                  handleSliderChange('proteinMax', newValue[1]);
                }}
                valueLabelDisplay="auto"
                min={0}
                max={200}
                aria-labelledby="protein-slider"
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                value={values.proteinMax}
                onChange={(e) => handleInputChange('proteinMax', Number(e.target.value))}
                inputProps={{
                  step: 5,
                  min: values.proteinMin,
                  max: 200,
                  type: 'number',
                  'aria-labelledby': 'protein-slider',
                }}
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">g</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
          
          {/* Carbohydrates */}
          <Typography id="carbs-slider" gutterBottom sx={{ mt: 2 }}>
            Carbohydrates (g)
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={2}>
              <TextField
                value={values.carbohydratesMin}
                onChange={(e) => handleInputChange('carbohydratesMin', Number(e.target.value))}
                inputProps={{
                  step: 10,
                  min: 0,
                  max: values.carbohydratesMax,
                  type: 'number',
                  'aria-labelledby': 'carbs-slider',
                }}
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">g</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={8}>
              <Slider
                value={[values.carbohydratesMin, values.carbohydratesMax]}
                onChange={(e, newValue) => {
                  handleSliderChange('carbohydratesMin', newValue[0]);
                  handleSliderChange('carbohydratesMax', newValue[1]);
                }}
                valueLabelDisplay="auto"
                min={0}
                max={400}
                aria-labelledby="carbs-slider"
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                value={values.carbohydratesMax}
                onChange={(e) => handleInputChange('carbohydratesMax', Number(e.target.value))}
                inputProps={{
                  step: 10,
                  min: values.carbohydratesMin,
                  max: 400,
                  type: 'number',
                  'aria-labelledby': 'carbs-slider',
                }}
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">g</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
          
          {/* Fat */}
          <Typography id="fat-slider" gutterBottom sx={{ mt: 2 }}>
            Fat (g)
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={2}>
              <TextField
                value={values.fatMin}
                onChange={(e) => handleInputChange('fatMin', Number(e.target.value))}
                inputProps={{
                  step: 5,
                  min: 0,
                  max: values.fatMax,
                  type: 'number',
                  'aria-labelledby': 'fat-slider',
                }}
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">g</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={8}>
              <Slider
                value={[values.fatMin, values.fatMax]}
                onChange={(e, newValue) => {
                  handleSliderChange('fatMin', newValue[0]);
                  handleSliderChange('fatMax', newValue[1]);
                }}
                valueLabelDisplay="auto"
                min={0}
                max={150}
                aria-labelledby="fat-slider"
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                value={values.fatMax}
                onChange={(e) => handleInputChange('fatMax', Number(e.target.value))}
                inputProps={{
                  step: 5,
                  min: values.fatMin,
                  max: 150,
                  type: 'number',
                  'aria-labelledby': 'fat-slider',
                }}
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">g</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
          
          {/* Sodium */}
          <Typography id="sodium-slider" gutterBottom sx={{ mt: 2 }}>
            Sodium (mg)
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={2}>
              <TextField
                value={values.sodiumMin}
                onChange={(e) => handleInputChange('sodiumMin', Number(e.target.value))}
                inputProps={{
                  step: 100,
                  min: 0,
                  max: values.sodiumMax,
                  type: 'number',
                  'aria-labelledby': 'sodium-slider',
                }}
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">mg</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={8}>
              <Slider
                value={[values.sodiumMin, values.sodiumMax]}
                onChange={(e, newValue) => {
                  handleSliderChange('sodiumMin', newValue[0]);
                  handleSliderChange('sodiumMax', newValue[1]);
                }}
                valueLabelDisplay="auto"
                min={0}
                max={3000}
                aria-labelledby="sodium-slider"
              />
            </Grid>
            <Grid item xs={2}>
              <TextField
                value={values.sodiumMax}
                onChange={(e) => handleInputChange('sodiumMax', Number(e.target.value))}
                inputProps={{
                  step: 100,
                  min: values.sodiumMin,
                  max: 3000,
                  type: 'number',
                  'aria-labelledby': 'sodium-slider',
                }}
                size="small"
                InputProps={{
                  endAdornment: <InputAdornment position="end">mg</InputAdornment>,
                }}
              />
            </Grid>
          </Grid>
        </Box>
        
        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            color="secondary" 
            onClick={handleReset}
            sx={{ mr: 1 }}
          >
            Reset to Defaults
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default NutritionRequirementsForm;