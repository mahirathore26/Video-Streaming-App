import { Bell } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { NavLink, useNavigate, Link, useLocation } from "react-router-dom";
import Avatar from "../ui/Avatar";
import Logo from "../ui/Logo";
import SearchBar from "../ui/SearchBar";
import { logout } from "../../services/logout";
import { logoutSuccess } from "../../store/authSlice";

const NAV_LINKS = [
  { to: "/", label: "Explore" },
  { to: "/articles", label: "Articles" },
  { to: "/collections", label: "Collections" },
  { to: "/subscriptions", label: "Subscriptions" },
];

export default function Navbar() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutSuccess());
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const location = useLocation();

  return (
    <header className="bg-[var(--odyssey-bg)] pt-8 pb-4">
      <div className="odyssey-container">
        
        {/* Top Header: Search // Logo // Actions */}
        <div className="flex items-center justify-between mb-8">
          <div className="w-1/3">
            <div className="hidden md:block w-full max-w-sm">
              <SearchBar />
            </div>
          </div>
          
          <div className="w-1/3 flex justify-center">
            <Link to="/">
              <Logo />
            </Link>
          </div>
          
          <div className="w-1/3 flex justify-end items-center gap-5">
            <button
              className="text-[var(--odyssey-text-muted)] hover:text-[var(--odyssey-accent)] transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} strokeWidth={1.5} />
            </button>

            {user ? (
              <div className="group relative z-50">
                <button className="flex items-center gap-2 focus:outline-none">
                  <Avatar
                    src={user?.avatar}
                    alt={user?.username || "User"}
                    name={user?.fullname || user?.username}
                    size="sm"
                  />
                </button>

                <div className="absolute right-0 top-full mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-[var(--odyssey-border)] bg-[var(--odyssey-surface)] shadow-sm">
                  <div className="py-2">
                    <Link to={`/profile/${user.username}`} className="block px-4 py-2 text-sm text-[var(--odyssey-text)] hover:bg-[var(--odyssey-surface-hover)]">
                      Archive (Profile)
                    </Link>
                    <Link to={`/profile/${user.username}?edit=true`} className="block px-4 py-2 text-sm text-[var(--odyssey-text)] hover:bg-[var(--odyssey-surface-hover)]">
                      Edit Profile
                    </Link>
                    <Link to="/studio" className="block px-4 py-2 text-sm text-[var(--odyssey-text)] hover:bg-[var(--odyssey-surface-hover)]">
                      Creator Studio
                    </Link>
                    <div className="h-px bg-[var(--odyssey-border)] my-2" />
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-[var(--odyssey-danger)] hover:bg-[var(--odyssey-surface-hover)]"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-[13px] font-medium tracking-wide uppercase text-[var(--odyssey-accent)] hover:text-[var(--odyssey-accent-hover)] transition-colors">
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Navigation Rules */}
        <div className="border-t border-b border-[var(--odyssey-border)] py-2.5">
          <nav className="flex items-center justify-center gap-8 sm:gap-14" aria-label="Main Navigation">
            {NAV_LINKS.map(({ to, label }) => {
              const isCurrentActive =
                to === "/"
                  ? location.pathname === "/" || location.pathname === "/explore"
                  : location.pathname === to;

              return (
                <Link
                  key={label}
                  to={to}
                  className={`relative py-1 text-[11px] font-semibold tracking-[0.2em] uppercase transition-colors duration-200 ${
                    isCurrentActive
                      ? "text-[#7A2635]"
                      : "text-[var(--odyssey-text-secondary)] hover:text-[var(--odyssey-text)]"
                  }`}
                >
                  {label}
                  {isCurrentActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#7A2635] rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
