import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Paper,
} from "@mui/material";
import { AccountCircle } from "@mui/icons-material";
import { useState } from "react";
import { logoutUser } from "../../features/auth/authSlice";
import { AppDispatch, RootState } from "../../store";

export const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
    handleClose();
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        background: "linear-gradient(90deg, #0F4C75, #3282B8)",
        boxShadow: "0px 3px 15px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          variant="h5"
          fontWeight={700}
          sx={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          JobDiva
        </Typography>

        <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
          <Button
            color="inherit"
            onClick={() => navigate("/dashboard")}
            sx={{ fontSize: 16, fontWeight: 500 }}
          >
            Dashboard
          </Button>
          <Button
            color="inherit"
            onClick={() => navigate("/post-job")}
            sx={{ fontSize: 16, fontWeight: 500 }}
          >
            Post Job
          </Button>

          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
            sx={{ p: 0 }}
          >
            {user?.name ? (
              <Avatar sx={{ bgcolor: "#F9A826", width: 36, height: 36 }}>
                {user.name[0].toUpperCase()}
              </Avatar>
            ) : (
              <AccountCircle sx={{ fontSize: 36 }} />
            )}
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            sx={{ mt: 1 }}
            PaperProps={{
              sx: {
                borderRadius: 2,
                mt: 1.5,
                boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            {isAuthenticated ? ( // Ensure it's checking authentication
              <Paper elevation={0} sx={{ p: 1 }}>
                <MenuItem onClick={handleClose}>Profile</MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: "red" }}>
                  Logout
                </MenuItem>
              </Paper>
            ) : (
              <Paper elevation={0} sx={{ p: 1 }}>
                <MenuItem
                  onClick={() => navigate("/login")}
                  sx={{ color: "blue" }}
                >
                  Register/Login
                </MenuItem>
              </Paper>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
