import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../context/AuthProvider";
import  type { GoogleUser } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = (credentialResponse: any) => {
    if (credentialResponse.credential) {
      // Decode the secure JWT from Google
      const decodedUser = jwtDecode<GoogleUser>(credentialResponse.credential);

      // Save it globally into your context
      login(decodedUser);

      // Redirect the user to the dashboard or home page
      navigate("/");
    }
  };

  return (
    <div
      style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}
    >
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log("Login Failed")}
      />
    </div>
  );
}
