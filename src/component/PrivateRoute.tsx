import React from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // Lưu tạm: token được lưu trong localStorage 
  const isAuthenticated = !!localStorage.getItem("token");

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/" replace /> 
  );
};

export default PrivateRoute;
