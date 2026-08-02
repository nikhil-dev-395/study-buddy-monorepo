import { Link } from "react-router-dom";
import { CiHome, CiLogin, CiSearch, CiLogout } from "react-icons/ci";
import type { GoogleUser } from "../../context/AuthProvider";
import { MdOutlineEmojiPeople } from "react-icons/md";
import { CgProfile } from "react-icons/cg";

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
  return (
    <header className="sticky top-4 z-50 px-4">
      <nav className="mx-auto flex w-full max-w-2xl items-center justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/70 px-5 py-2.5 backdrop-blur-md shadow-lg shadow-zinc-950/40 transition-all">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-semibold text-zinc-100 tracking-tight transition-opacity hover:opacity-90"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="font-semibold text-zinc-100">
            study<span className="text-emerald-400">buddy</span>
          </span>
        </Link>

        {/* Center Navigation Actions */}
        <div className="flex items-center gap-1.5 rounded-xl bg-zinc-950/40 p-1 border border-zinc-800/50">
          <Link
            to="/"
            title="Home"
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 active:scale-95"
          >
            <CiHome size={20} />
          </Link>

          <Link
            to="/search"
            title="Search Buddies"
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-emerald-400 active:scale-95"
          >
            <CiSearch size={20} />
          </Link>

          <Link
            to="/my-buddies"
            title="My Buddies"
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-emerald-400 active:scale-95"
          >
            <MdOutlineEmojiPeople size={20} />
          </Link>

          <Link
            to="/profile"
            title="Profile"
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-emerald-400 active:scale-95"
          >
            <CgProfile size={20} />
          </Link>
        </div>

        {/* Auth Button/Profile Section */}
        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            {userDetails?.picture && (
              <img
                src={userDetails.picture}
                alt={userDetails.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/20 shadow-sm"
              />
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 px-3.5 py-1.5 text-xs font-medium text-rose-400 transition-all hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300 active:scale-95"
            >
              <CiLogout size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-1.5 text-xs font-semibold text-zinc-950 transition-all hover:bg-emerald-400 shadow-sm active:scale-95"
          >
            <CiLogin size={16} />
            <span className="hidden sm:inline">Login</span>
          </Link>
        )}
      </nav>
    </header>
  );
}
