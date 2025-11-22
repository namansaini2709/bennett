import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  IconButton,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import logo from '../assets/logo.png';

const MotionPaper = motion(Paper);
const MotionButton = motion(Button);

const Login = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showMobileWarning, setShowMobileWarning] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Check if user is on mobile and hasn't seen warning
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const hasSeenWarning = localStorage.getItem('hasSeenMobileWarning');

    if (isMobile && !hasSeenWarning) {
      setShowMobileWarning(true);
    }
  }, []);

  const handleCloseWarning = () => {
    localStorage.setItem('hasSeenMobileWarning', 'true');
    setShowMobileWarning(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(emailOrPhone, password);
      
      if (result.success) {
        // Small delay to ensure state is set before navigation
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      } else {
        setError(result.message);
        setLoading(false);
      }
    } catch (error) {
      console.error('Login submit error:', error);
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '200%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px',
          animation: 'drift 20s infinite linear',
        },
      }}
    >
      <style>
        {`
          @keyframes drift {
            from { transform: translate(0, 0); }
            to { transform: translate(-50px, -50px); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
        `}
      </style>
      <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <MotionPaper
            elevation={24}
            sx={{
              padding: 4,
              width: '100%',
              background: 'rgba(255, 255, 255, 0.98)',
              backdropFilter: 'blur(10px)',
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              '& .MuiInputBase-root': {
                color: '#1e293b',
              },
              '& .MuiInputLabel-root': {
                color: '#64748b',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#e2e8f0',
              },
              '& .MuiIconButton-root': {
                color: '#64748b',
              },
            }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <motion.img
                src={logo}
                alt="Civic Setu"
                style={{ height: 80, width: 'auto' }}
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'easeInOut'
                }}
              />
            </Box>
            <Typography
              component="h1"
              variant="h4"
              align="center"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Civic Setu Admin
            </Typography>
            <Typography component="h2" variant="h6" align="center" color="text.secondary" gutterBottom>
              Sign in to continue
            </Typography>
          </motion.div>
          
          {error && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            </motion.div>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <TextField
              margin="normal"
              required
              fullWidth
              id="emailOrPhone"
              label="Email or Phone"
              name="emailOrPhone"
              autoComplete="username"
              autoFocus
              value={emailOrPhone}
              onChange={(e) => setEmailOrPhone(e.target.value)}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <MotionButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              sx={{
                mt: 3,
                mb: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                },
              }}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </MotionButton>
            </motion.div>
          </Box>
          </MotionPaper>
        </motion.div>
      </Container>

      <Dialog
        open={showMobileWarning}
        onClose={handleCloseWarning}
        PaperProps={{
          sx: {
            borderRadius: 3,
            padding: 2
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#764ba2' }}>
          Desktop Mode Recommended
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            This dashboard is optimized for desktop. For mobile access, please use desktop mode.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWarning} variant="contained" sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
            }
          }}>
            Got it
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;