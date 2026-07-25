import { createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Error404 from "../pages/Error";
import Home from "../pages/Home";
import { ProtectedRoute } from "./protectedroute";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Home />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Error404 />,
  },
]);
