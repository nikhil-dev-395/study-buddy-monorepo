import { Link } from "react-router-dom";
import { CiHome, CiLogin, CiSearch, CiLogout } from "react-icons/ci";
import { FaSearchMinus } from "react-icons/fa";
import { useState } from "react";
import { SearchBox } from "./search/SearchBox";
import type { GoogleUser } from "../../context/AuthProvider";

type NavbarProps = {
  isLoggedIn: boolean;
  userDetails: GoogleUser | null;
  onLogout: () => void;
};

export default function Navbar({
  isLoggedIn,
  userDetails,
  onLogout,
}: NavbarProps) {
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <nav className="mx-auto flex w-[52%] max-w-6xl items-center justify-between rounded-2xl border border-slate-700 bg-black/80 px-6 py-3 backdrop-blur-md">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-white"
        >
          <span className="hidden sm:block text-[#fb8989]">study buddy</span>
        </Link>

        {/* Navigation */}
        {/* <div className="flex items-center gap-6">
          {showSearchOverlay ? (
            <SearchBox text="Search..." />
          ) : (
            <>
              <Link
                to="/"
                className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
              >
                <CiHome size={20} />
              </Link>
            </>
          )}

          <button
            onClick={() => setShowSearchOverlay(!showSearchOverlay)}
            className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            {showSearchOverlay ? (
              <FaSearchMinus size={20} />
            ) : (
              <CiSearch size={20} />
            )}
          </button>
        </div> */}

        <>
          <Link
            to="/"
            className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            <CiHome size={20} />
          </Link>
        </>
        <Link
          to="/search"
          className="rounded-lg p-2 text-slate-300 transition hover:bg-slate-700 hover:text-white"
        >
          <CiSearch size={20} />
        </Link>

        {/* Auth Button/Profile Section */}
        {isLoggedIn ? (
          <div className="flex items-center gap-4">
            {userDetails?.picture && (
              <img
                src={userDetails.picture}
                alt={userDetails.name}
                className="w-8 h-8 rounded-full border border-slate-600"
              />
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 rounded-xl bg-red-600/20 border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-600 hover:text-white"
            >
              <CiLogout size={18} />
              <span className="hidden md:block">Logout</span>
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <CiLogin size={18} />
            <span className="hidden md:block">Login</span>
          </Link>
        )}
      </nav>
    </header>
  );
}
