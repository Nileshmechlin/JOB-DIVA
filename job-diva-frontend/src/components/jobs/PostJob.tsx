import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  CircularProgress,
} from "@mui/material";
import { AppDispatch, RootState } from "../../store";
import { postJob, getLinkedInStatus, connectLinkedIn } from "../../features/jobs/jobSlice";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Work, LocationOn, Business, Link } from "@mui/icons-material";

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  companyName: Yup.string().required("Company name is required"),
  location: Yup.string().required("Location is required"),
  applyLink: Yup.string().url("Must be a valid URL").required("Apply link is required"),
});

export const PostJob = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, success, linkedInStatus } = useSelector((state: RootState) => state.jobs);

  useEffect(() => {
    dispatch(getLinkedInStatus());
  }, [dispatch]);

  useEffect(() => {
    if (success) {
      toast.success("🎉 Job posted successfully!");
    }
    if (error) {
      toast.error(`❌ ${error}`);
    }
  }, [success, error]);

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      companyName: "",
      location: "",
      applyLink: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      await dispatch(postJob(values));
      resetForm(); // Reset form fields after submission
    },
  });

  const handleLinkedInConnect = () => {
    dispatch(connectLinkedIn());
    toast.info("🔗 Connecting to LinkedIn...");
  };

  if (!linkedInStatus.isConnected) {
    return (
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: "center" }}>
          <Typography variant="h5" gutterBottom>Connect LinkedIn First</Typography>
          <Typography paragraph>You need to connect your LinkedIn account to post jobs.</Typography>
          <Button variant="contained" color="primary" onClick={handleLinkedInConnect}>
            Connect with LinkedIn
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Post a New Job
        </Typography>

        <Box component="form" onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="title"
            name="title"
            label="Job Title"
            margin="normal"
            value={formik.values.title}
            onChange={formik.handleChange}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
            InputProps={{
              startAdornment: <Work sx={{ color: "gray", mr: 1 }} />,
            }}
          />

          <TextField
            fullWidth
            id="description"
            name="description"
            label="Description"
            multiline
            rows={4}
            margin="normal"
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />

          <TextField
            fullWidth
            id="companyName"
            name="companyName"
            label="Company Name"
            margin="normal"
            value={formik.values.companyName}
            onChange={formik.handleChange}
            error={formik.touched.companyName && Boolean(formik.errors.companyName)}
            helperText={formik.touched.companyName && formik.errors.companyName}
            InputProps={{
              startAdornment: <Business sx={{ color: "gray", mr: 1 }} />,
            }}
          />

          <TextField
            fullWidth
            id="location"
            name="location"
            label="Location"
            margin="normal"
            value={formik.values.location}
            onChange={formik.handleChange}
            error={formik.touched.location && Boolean(formik.errors.location)}
            helperText={formik.touched.location && formik.errors.location}
            InputProps={{
              startAdornment: <LocationOn sx={{ color: "gray", mr: 1 }} />,
            }}
          />

          <TextField
            fullWidth
            id="applyLink"
            name="applyLink"
            label="Apply Link"
            margin="normal"
            value={formik.values.applyLink}
            onChange={formik.handleChange}
            error={formik.touched.applyLink && Boolean(formik.errors.applyLink)}
            helperText={formik.touched.applyLink && formik.errors.applyLink}
            InputProps={{
              startAdornment: <Link sx={{ color: "gray", mr: 1 }} />,
            }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Post Job to LinkedIn"}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
