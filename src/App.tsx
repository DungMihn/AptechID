import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./page/Dashboard";
import Products from "./component/Products";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./page/Login";

// Tạo một instance của QueryClient
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    // Bọc toàn bộ ứng dụng trong QueryClientProvider để sử dụng React Query
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} /> {/* Trang đăng nhập */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<Products />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
