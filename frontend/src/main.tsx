import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
// import { RouterProvider } from "react-router-dom";
// import { router } from "./routes/router.tsx";
import { env } from "./utils/env.ts";
import App from "./App.tsx";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={env.VITE_GOOGLE_CLIENT_ID}>
      {/* <RouterProvider router={router} />
       */}
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);
