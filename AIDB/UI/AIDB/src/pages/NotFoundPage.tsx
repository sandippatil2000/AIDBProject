import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        gap: 2,
      }}
    >
      <Typography
        variant="h1"
        fontWeight={800}
        sx={{ fontSize: { xs: '5rem', sm: '8rem' }, color: 'primary.main', lineHeight: 1 }}
      >
        404
      </Typography>
      <Typography variant="h5" fontWeight={600} color="text.primary">
        Page Not Found
      </Typography>
      <Typography variant="body2" color="text.secondary">
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button
        id="not-found-home"
        variant="contained"
        onClick={() => navigate('/dashboard')}
        sx={{ mt: 1 }}
      >
        Back to Dashboard
      </Button>
    </Box>
  );
};
