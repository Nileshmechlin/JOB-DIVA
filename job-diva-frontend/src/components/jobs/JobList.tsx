import { Box, Typography, Container } from '@mui/material';

export const JobList = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Job Listings
        </Typography>
        <Typography variant="body1">
          Job listings will be displayed here.
        </Typography>
      </Box>
    </Container>
  );
};
