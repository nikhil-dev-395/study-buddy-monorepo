import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import { useAuth } from "../context/AuthProvider";

export default function Layout() {
  const { isLoggedIn, setIsLoggedIn } = useAuth();

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} onLogout={() => setIsLoggedIn(false)} />
      <main>
        <Outlet />
      </main>
    </>
  );
}
