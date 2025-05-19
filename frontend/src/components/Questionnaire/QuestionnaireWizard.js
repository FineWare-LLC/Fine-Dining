/**
 * @fileoverview QuestionnaireWizard component
 */
import React, {
  useState,
  useEffect,
  createContext,
  useContext,
  useRef
} from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Stepper,
  Step,
  StepLabel,
  StepButton,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Typography
} from '@mui/material';

// Measurement system context -------------------------------------------------
const MeasurementContext = createContext();
export const MeasurementProvider = ({ children }) => {
  const defaultSystem =
    typeof navigator !== 'undefined' && navigator.language === 'en-US'
      ? 'imperial'
      : 'metric';
  const [system, setSystem] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('measureSys') || defaultSystem;
    }
    return defaultSystem;
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('measureSys', system);
    }
  }, [system]);
  return (
    <MeasurementContext.Provider value={{ system, setSystem }}>
      {children}
    </MeasurementContext.Provider>
  );
};
MeasurementProvider.propTypes = { children: PropTypes.node.isRequired };
export const useMeasurement = () => useContext(MeasurementContext);

// Helper --------------------------------------------------------------------
const useSessionState = (key, initial) => {
  const [state, setState] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initial;
    }
    return initial;
  });
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(key, JSON.stringify(state));
    }
  }, [key, state]);
  return [state, setState];
};

// Step components -----------------------------------------------------------
const BasicInfoStep = ({ data, onChange }) => {
  const { system, setSystem } = useMeasurement();
  const [gender, setGender] = useState(data.gender || '');
  const [otherGender, setOtherGender] = useState(data.otherGender || '');
  const [height, setHeight] = useState(data.height || '');
  const [weight, setWeight] = useState(data.weight || '');

  const minHeight = system === 'imperial' ? 50 : 127;
  const maxHeight = system === 'imperial' ? 96 : 244;
  const minWeight = system === 'imperial' ? 70 : 32;
  const maxWeight = system === 'imperial' ? 600 : 272;

  useEffect(() => {
    onChange({ gender, otherGender, height, weight, system });
  }, [gender, otherGender, height, weight, system, onChange]);

  const valid =
    gender &&
    height >= minHeight &&
    height <= maxHeight &&
    weight >= minWeight &&
    weight <= maxWeight;

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Tell us about you</Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Measurement System</Typography>
        <RadioGroup
          row
          value={system}
          onChange={(e) => setSystem(e.target.value)}
          aria-label="measurement system"
        >
          <FormControlLabel value="metric" control={<Radio />} label="Metric" />
          <FormControlLabel value="imperial" control={<Radio />} label="Imperial" />
        </RadioGroup>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2">Gender</Typography>
        <RadioGroup
          row
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          aria-label="gender"
        >
          <FormControlLabel value="male" control={<Radio />} label="Male" />
          <FormControlLabel value="female" control={<Radio />} label="Female" />
          <FormControlLabel value="other" control={<Radio />} label="Other" />
        </RadioGroup>
        {gender === 'other' && (
          <TextField
            label="Please specify"
            value={otherGender}
            onChange={(e) => setOtherGender(e.target.value)}
            size="small"
            sx={{ mt: 1 }}
          />
        )}
      </Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          label={`Height (${system === 'imperial' ? 'in' : 'cm'})`}
          type="number"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
          inputProps={{ min: minHeight, max: maxHeight }}
          fullWidth
          size="small"
        />
      </Box>
      <Box sx={{ mb: 2 }}>
        <TextField
          label={`Current Weight (${system === 'imperial' ? 'lbs' : 'kg'})`}
          type="number"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          inputProps={{ min: minWeight, max: maxWeight }}
          fullWidth
          size="small"
        />
      </Box>
      <Button
        variant="contained"
        onClick={() => onChange({ gender, otherGender, height, weight, system, valid })}
        aria-disabled={!valid}
        disabled={!valid}
      >
        Next
      </Button>
    </Box>
  );
};
BasicInfoStep.propTypes = { data: PropTypes.object.isRequired, onChange: PropTypes.func.isRequired };

const WeightGoalStep = ({ data, onChange, onBack }) => {
  const [goal, setGoal] = useState(data.goal || 'maintain');
  const [desired, setDesired] = useState(data.desired || '');
  const { system } = useMeasurement();

  useEffect(() => {
    onChange({ goal, desired });
  }, [goal, desired, onChange]);

  const disabledDesired = goal === 'maintain';
  return (
    <Box>
      <Typography variant="h6" gutterBottom>Weight Goals</Typography>
      <RadioGroup value={goal} onChange={(e) => setGoal(e.target.value)} aria-label="goal">
        <FormControlLabel value="lose" control={<Radio />} label="Lose" />
        <FormControlLabel value="maintain" control={<Radio />} label="Maintain" />
        <FormControlLabel value="gain" control={<Radio />} label="Gain" />
      </RadioGroup>
      <TextField
        label={`Desired Weight (${system === 'imperial' ? 'lbs' : 'kg'})`}
        type="number"
        value={desired}
        onChange={(e) => setDesired(Number(e.target.value))}
        disabled={disabledDesired}
        aria-disabled={disabledDesired}
        fullWidth
        size="small"
        sx={{ mt: 2 }}
      />
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button variant="outlined" onClick={onBack}>Back</Button>
        <Button variant="contained" onClick={() => onChange({ goal, desired, complete: true })}>Next</Button>
      </Box>
    </Box>
  );
};
WeightGoalStep.propTypes = { data: PropTypes.object.isRequired, onChange: PropTypes.func.isRequired, onBack: PropTypes.func.isRequired };

const SummaryStep = ({ data, onBack }) => {
  const items = [
    { term: 'Measurement System', value: data.system },
    {
      term: 'Gender',
      value: data.gender === 'other' ? data.otherGender : data.gender,
    },
    {
      term: 'Height',
      value: `${data.height} ${data.system === 'imperial' ? 'in' : 'cm'}`,
    },
    {
      term: 'Weight',
      value: `${data.weight} ${data.system === 'imperial' ? 'lbs' : 'kg'}`,
    },
    { term: 'Goal', value: data.goal },
  ];
  if (data.desired) {
    items.push({
      term: 'Desired Weight',
      value: `${data.desired} ${data.system === 'imperial' ? 'lbs' : 'kg'}`,
    });
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Summary</Typography>
      <Box component="dl" sx={{ mt: 1 }}>
        {items.map((item) => (
          <Box key={item.term} sx={{ display: 'flex', gap: 1 }}>
            <Typography component="dt" variant="subtitle2" sx={{ minWidth: 160 }}>
              {item.term}
            </Typography>
            <Typography component="dd" variant="body2" sx={{ m: 0 }}>
              {item.value}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={onBack} sx={{ mr: 1 }}>Back</Button>
        <Button variant="contained" onClick={() => console.log('submit', data)}>Submit</Button>
      </Box>
    </Box>
  );
};
SummaryStep.propTypes = { data: PropTypes.object.isRequired, onBack: PropTypes.func.isRequired };

// Wizard container ----------------------------------------------------------
/**
 * QuestionnaireWizard component
 * @param {object} props
 * @returns {JSX.Element}
 */
export default function QuestionnaireWizard() {
  const [activeStep, setActiveStep] = useSessionState('wizardStep', 0);
  const [formData, setFormData] = useSessionState('wizardData', {});

  const [focusIdx, setFocusIdx] = useState(activeStep);
  const stepRefs = useRef([]);
  const [liveMsg, setLiveMsg] = useState('');

  const steps = ['Basic Info', 'Weight Goal', 'Summary'];

  const handleBasicNext = (data) => {
    if (data.valid) {
      setFormData((f) => ({ ...f, ...data }));
      setActiveStep(1);
    }
  };
  const handleGoalNext = (data) => {
    setFormData((f) => ({ ...f, ...data }));
    setActiveStep(2);
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <BasicInfoStep data={formData} onChange={handleBasicNext} />;
      case 1:
        return <WeightGoalStep data={formData} onChange={handleGoalNext} onBack={() => setActiveStep(0)} />;
      default:
        return <SummaryStep data={formData} onBack={() => setActiveStep(1)} />;
    }
  };

  useEffect(() => {
    setFocusIdx(activeStep);
  }, [activeStep]);

  useEffect(() => {
    const label = steps[focusIdx];
    const completed = focusIdx < activeStep ? ' — completed' : '';
    setLiveMsg(`Step ${focusIdx + 1} of ${steps.length}: ${label}${completed}`);
  }, [focusIdx, activeStep, steps]);

  const handleKeyDown = (e) => {
    const max = steps.length - 1;
    if (['ArrowRight', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      const next = focusIdx === max ? 0 : focusIdx + 1;
      setFocusIdx(next);
      stepRefs.current[next]?.focus();
    } else if (['ArrowLeft', 'ArrowUp'].includes(e.key)) {
      e.preventDefault();
      const prev = focusIdx === 0 ? max : focusIdx - 1;
      setFocusIdx(prev);
      stepRefs.current[prev]?.focus();
    } else if (e.key === 'Home') {
      e.preventDefault();
      setFocusIdx(0);
      stepRefs.current[0]?.focus();
    } else if (e.key === 'End') {
      e.preventDefault();
      setFocusIdx(max);
      stepRefs.current[max]?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveStep(focusIdx);
    }
  };

  return (
    <MeasurementProvider>
      <Box>
        <Stepper role="list" nonLinear activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label, i) => (
            <Step
              key={label}
              completed={i < activeStep}
              role="listitem"
              aria-current={activeStep === i ? 'step' : undefined}
            >
              <StepButton
                onClick={() => setActiveStep(i)}
                ref={(el) => (stepRefs.current[i] = el)}
                tabIndex={focusIdx === i ? 0 : -1}
                onFocus={() => setFocusIdx(i)}
                onKeyDown={handleKeyDown}
              >
                <StepLabel>{label}</StepLabel>
              </StepButton>
            </Step>
          ))}
        </Stepper>
        <Box
          role="status"
          aria-live="polite"
          sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0 0 0 0)' }}
        >
          {liveMsg}
        </Box>
        {renderStep()}
      </Box>
    </MeasurementProvider>
  );
}

export { SummaryStep };
