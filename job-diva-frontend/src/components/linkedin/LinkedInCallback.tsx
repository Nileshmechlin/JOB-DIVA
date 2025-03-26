import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { CircularProgress, Container, Typography } from "@mui/material";
import { linkedInAPI } from "../../services/api";
import { getLinkedInStatus } from "../../features/jobs/jobSlice";
import { AppDispatch } from "../../store";

export const LinkedInCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");

        if (!code) {
          throw new Error("No authorization code received");
        }

        const response = await linkedInAPI.handleCallback(code);
        console.log("LinkedIn Response:", response); // 👈 Debugging ke liye

        const userData = response.data?.user;

        if (userData?.linkedInAccessToken) {
          localStorage.setItem("authToken", userData.linkedInAccessToken);
          localStorage.setItem("user", JSON.stringify(userData));

          dispatch({ type: "auth/setAuthenticated", payload: true });
        } else {
          console.error("Token missing in response!");
        }

        await dispatch(getLinkedInStatus());
        navigate("/post-job");
      } catch (error) {
        console.error("LinkedIn callback error:", error);
        navigate("/dashboard", {
          state: { error: "Failed to connect LinkedIn account" },
        });
      }
    };

    handleCallback();
  }, [navigate, dispatch]); // 👈 Dependencies pass kiye useEffect me

  return (
    <Container sx={{ mt: 4, textAlign: "center" }}>
      <CircularProgress />
      <Typography sx={{ mt: 2 }}>
        Connecting your LinkedIn account...
      </Typography>
    </Container>
  );
};
