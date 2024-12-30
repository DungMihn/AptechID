import React from "react";
import { Navigate } from "react-router-dom";

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  // Giả sử token được lưu trong localStorage
  const isAuthenticated = !!localStorage.getItem("token");

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/" replace /> // Chuyển hướng về trang Login nếu chưa đăng nhập
  );
};

export default PrivateRoute;
