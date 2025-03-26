import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { CssBaseline } from "@mui/material";
import { store } from "./store";
import { Navbar } from "./components/layout/Navbar";
import { PrivateRoute } from "./components/layout/PrivateRoute";
import { Login } from "./components/auth/Login";
import { PostJob } from "./components/jobs/PostJob";
import { JobList } from "./components/jobs/JobList";
import { Signup } from "./components/auth/Signup";
import { LinkedInCallback } from "./components/linkedin/LinkedInCallback";

function App() {
  return (
    <Provider store={store}>
      <CssBaseline />
      <Router>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
          }}
        >
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/linkedin/callback" element={<LinkedInCallback />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <JobList />
                </PrivateRoute>
              }
            />
            <Route
              path="/post-job"
              element={
                <PrivateRoute>
                  <PostJob />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
