import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { completeProfile } from '../../redux/slices/authSlice';
import { RootState, AppDispatch } from '../../redux/store';
import {
  Container,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Stack,
  Avatar,
  IconButton,
  CircularProgress,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const steps = ['Role & Basic Info', 'Lifestyle Preferences', 'Work/Study'];

const Onboarding: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading } = useSelector((state: RootState) => state.auth);
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    phone: '',
    bio: '',
    preferences: {
      location: '',
      budget: '',
      moveInDate: '',
      duration: '',
      gender: (user as any)?.preferences?.gender || 'Any',
      lifestyle: [] as string[],
      occupation: '',
    }
  });

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      handleSubmit();
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleLifestyleToggle = (option: string) => {
    const current = formData.preferences.lifestyle;
    const updated = current.includes(option)
      ? current.filter(item => item !== option)
      : [...current, option];
    
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        lifestyle: updated
      }
    }));
  };

  const handleSubmit = async () => {
     // Format data for backend
     // Backend PUT /api/auth/complete-profile expects: { userType, phone, bio, preferences }
     try {
         await dispatch(completeProfile(formData as any)).unwrap();
         navigate('/dashboard');
     } catch (err) {
         console.error('Failed to complete profile:', err);
     }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              variant="outlined"
              sx={{ mb: 3 }}
            />
            
            <TextField
              fullWidth
              label="Short Bio"
              name="bio"
              multiline
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell others a bit about yourself..."
            />
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" gutterBottom>Lifestyle Preferences</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 4 }}>
              {['Vegetarian', 'Non-Vegetarian', 'Smoker', 'Non-Smoker', 'Early Bird', 'Night Owl', 'Pet Lover', 'Music Enthusiast'].map((option) => (
                <Chip
                  key={option}
                  label={option}
                  onClick={() => handleLifestyleToggle(option)}
                  color={formData.preferences.lifestyle.includes(option) ? 'primary' : 'default'}
                  variant={formData.preferences.lifestyle.includes(option) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
            
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend">Preferred Flatmate Gender</FormLabel>
              <RadioGroup
                name="preferences.gender"
                value={formData.preferences.gender}
                onChange={handleChange}
                row
              >
                <FormControlLabel value="Male" control={<Radio />} label="Male" />
                <FormControlLabel value="Female" control={<Radio />} label="Female" />
                <FormControlLabel value="Any" control={<Radio />} label="Any" />
              </RadioGroup>
            </FormControl>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Current Occupation"
              name="preferences.occupation"
              value={formData.preferences.occupation}
              onChange={handleChange}
              variant="outlined"
              sx={{ mb: 3 }}
              placeholder="e.g. Software Engineer, Student at DU..."
            />
            
             <TextField
              fullWidth
              label="Preferred Move-in Date"
              name="preferences.moveInDate"
              type="date"
              value={formData.preferences.moveInDate}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              sx={{ mb: 3 }}
            />

            <TextField
              fullWidth
              label="Preferred Monthly Budget (Max)"
              name="preferences.budget"
              type="number"
              value={formData.preferences.budget}
              onChange={handleChange}
              variant="outlined"
              InputProps={{ startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography> }}
            />
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom color="primary">
          Welcome to Flatmates!
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Let's complete your profile to find the perfect match.
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: '300px' }}>
          {renderStepContent(activeStep)}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 6 }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            variant="text"
          >
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={loading}
            sx={{ px: 4 }}
          >
            {loading ? <CircularProgress size={24} /> : (activeStep === steps.length - 1 ? 'Finish' : 'Next')}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Onboarding;
