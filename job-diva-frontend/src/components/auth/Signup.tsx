import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  Link as MuiLink,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff, Person, Email, Lock } from '@mui/icons-material';
import { LoadingButton } from '../common/LoadingButton';
import { signupUser } from '../../features/auth/authSlice';
import { AppDispatch, RootState } from '../../store';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export const Signup = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      const result = await dispatch(signupUser(values));
      console.log("Signup Result:", result);
    
      if (signupUser.fulfilled.match(result)) {
        console.log("Navigation triggered");
        navigate('/dashboard');
      } else {
        console.log("Signup failed, staying on page.");
      }
    },
    
 
  });

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={6}
        sx={{
          p: 4,
          mt: 8,
          borderRadius: 3,
          boxShadow: '0px 5px 25px rgba(0, 0, 0, 0.15)',
          backgroundColor: '#ffffff',
        }}
      >
        <Typography variant="h4" align="center" fontWeight={700} gutterBottom>
          Create an Account
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary">
          Join us and explore amazing opportunities!
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            id="name"
            name="name"
            label="Full Name"
            margin="normal"
            InputProps={{
              sx: { borderRadius: 2 },
              startAdornment: (
                <InputAdornment position="start">
                  <Person color="action" />
                </InputAdornment>
              ),
            }}
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.name && Boolean(formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
          />

          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email Address"
            margin="normal"
            InputProps={{
              sx: { borderRadius: 2 },
              startAdornment: (
                <InputAdornment position="start">
                  <Email color="action" />
                </InputAdornment>
              ),
            }}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />

          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            margin="normal"
            InputProps={{
              sx: { borderRadius: 2 },
              startAdornment: (
                <InputAdornment position="start">
                  <Lock color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleTogglePassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />

          <LoadingButton
            fullWidth
            type="submit"
            variant="contained"
            loading={loading}
            sx={{
              mt: 3,
              py: 1.2,
              borderRadius: 2,
              fontWeight: 600,
              background: 'linear-gradient(to right, #0F4C75, #3282B8)',
              '&:hover': { background: '#0F4C75' },
            }}
          >
            Sign Up
          </LoadingButton>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <MuiLink component={Link} to="/login" sx={{ fontWeight: 600 }}>
                Login here
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};
