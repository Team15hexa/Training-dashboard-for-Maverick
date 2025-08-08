import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: "admin" | "fresher";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const userRole = localStorage.getItem("userRole");
    
    console.log('🔒 ProtectedRoute check:', { isAuthenticated, userRole, requiredRole });

    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login');
      navigate("/login");
      return;
    }

    if (requiredRole && userRole !== requiredRole) {
      console.log('❌ Wrong role, redirecting');
      // Redirect to appropriate dashboard based on role
      if (userRole === "admin") {
        navigate("/admin/dashboard");
      } else if (userRole === "fresher") {
        navigate("/fresher-dashboard");
      } else {
        navigate("/login");
      }
    } else {
      console.log('✅ Authentication and role check passed');
    }
  }, [navigate, requiredRole]);

  const isAuthenticated = localStorage.getItem("isAuthenticated");
  const userRole = localStorage.getItem("userRole");

  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && userRole !== requiredRole) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;