import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import { useAuth } from "../context/AuthProvider";
import { googleLogout } from "@react-oauth/google";

export default function Layout() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    googleLogout();
    logout();
  };

  return (
    <>
      {/* Pass the user object or a simple boolean check (!!user) to your navbar */}
      <Navbar isLoggedIn={!!user} userDetails={user} onLogout={handleLogout} />
      <main>
        <Outlet />
      </main>
    </>
  );
}
