import { Navigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { useEffect } from "react";
import { setAuthenticated, setLoading } from "../../features/auth/authSlice";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      dispatch(setAuthenticated(true));
    }
    dispatch(setLoading(false)); // ✅ Loading false karna zaroori hai
  }, [dispatch]);

  if (loading) {
    return <p>Loading...</p>; // ✅ Jab tak Redux state set ho raha hai, tab tak loading dikhao
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
