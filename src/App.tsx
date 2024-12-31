import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./page/Dashboard";
import Products from "./component/Products";
import Orders from "./component/Orders";
import Login from "./page/Login";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PrivateRoute from "./component/PrivateRoute";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/dashboard/*"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          >
            {/* Route con mặc định em để */}
            <Route index element={<div>Welcome to the Dashboard!</div>} />
            {/* Route con cho Products */}
            <Route path="products" element={<Products />} />
            {/* Route con cho Orders */}
            <Route path="orders" element={<Orders />} />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
