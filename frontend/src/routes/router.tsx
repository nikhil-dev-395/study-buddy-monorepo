import { createBrowserRouter, Outlet } from "react-router-dom";
import Login from "../pages/Login";
import Error404 from "../pages/Error";
import Home from "../pages/Home";
import Layout from "./Layout";
import { ProtectedRoute } from "./protectedroute";
import { AuthProvider } from "../context/AuthProvider";
import SearchPage from "../pages/Search";

export const router = createBrowserRouter([
  {
    // Root element wraps EVERYTHING in AuthProvider
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      // Public Route
      {
        path: "/login",
        element: <Login />,
      },
      // Protected Routes Layout
      {
        element: (
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: "/",
            element: <Home />,
          },
          // Add extra protected routes here:
          { path: "/search", element: <SearchPage /> },
        ],
      },
      // 404 Route
      {
        path: "*",
        element: <Error404 />,
      },
    ],
  },
]);
