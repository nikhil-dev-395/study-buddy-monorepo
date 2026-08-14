import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      try {
        await loginWithGoogle(credentialResponse.credential);
        navigate("/"); // Redirect to home/dashboard on success
      } catch (err) {
        console.log("Login failed:", err);
        alert("Authentication failed. Check backend connection.");
      }
    }
  };

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}
    >
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.error("Google Login Failed")}
      />
    </div>
  );
}
