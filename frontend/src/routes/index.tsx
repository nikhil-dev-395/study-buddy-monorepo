import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Error404 from "../pages/Error";
import Home from "../pages/Home";
import Layout from "../routes/Layout";
import { ProtectedRoute } from "./protectedroute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
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
      // Add more protected pages here
      // {
      //   path: "/profile",
      //   element: <Profile />,
      // },
    ],
  },
  {
    path: "*",
    element: <Error404 />,
  },
]);
