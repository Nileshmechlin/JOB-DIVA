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
  Divider,
  IconButton,
  InputAdornment,
  Avatar,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  EmailOutlined,
  Lock,
} from '@mui/icons-material';
import { LoadingButton } from '../common/LoadingButton';
import { loginUser } from '../../features/auth/authSlice';
import { AppDispatch, RootState } from '../../store';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      const result = await dispatch(loginUser(values));
      if (loginUser.fulfilled.match(result)) {
        navigate('/dashboard');
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Paper
        elevation={8}
        sx={{
          p: 5,
          mt: 8,
          borderRadius: 4,
          boxShadow: '0px 5px 30px rgba(0, 0, 0, 0.2)',
          backgroundColor: '#ffffff',
        }}
      >
        {/* Login Header */}
        <Box display="flex" flexDirection="column" alignItems="center">
          <Avatar sx={{ bgcolor: '#0F4C75', mb: 1 }}>
            <LockOutlined />
          </Avatar>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            login 
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome back! Please enter your credentials.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
          {/* Email Field with Icon */}
          <TextField
            fullWidth
            id="email"
            name="email"
            label="Email Address"
            variant="outlined"
            margin="normal"
            InputProps={{
              sx: { borderRadius: 3 },
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined color="action" />
                </InputAdornment>
              ),
            }}
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
          />

          {/* Password Field with Toggle Visibility */}
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            variant="outlined"
            margin="normal"
            InputProps={{
              sx: { borderRadius: 3 },
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

          {/* Login Button */}
          <LoadingButton
            fullWidth
            type="submit"
            variant="contained"
            loading={loading}
            sx={{
              mt: 3,
              py: 1.5,
              borderRadius: 3,
              fontWeight: 600,
              fontSize: '1rem',
              textTransform: 'none',
              background: 'linear-gradient(to right, #0F4C75, #3282B8)',
              '&:hover': { background: '#0F4C75' },
            }}
          >
            Login
          </LoadingButton>

          {/* Divider & Signup Link */}
          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <MuiLink component={Link} to="/signup" sx={{ fontWeight: 600 }}>
                Register here
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};
