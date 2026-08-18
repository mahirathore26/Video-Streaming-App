import {
  Clapperboard,
  Compass,
  History,
  Library,
  LogOut,
  Sparkles,
  Upload,
  User,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../services/logout";
import { logoutSuccess } from "../../store/authSlice";

const NAV_ITEMS = [
  { to: "/", icon: Compass, label: "Explore" },
  { to: "/", icon: Sparkles, label: "Discover" },
  { to: "/collections", icon: Library, label: "Collections" },
  { to: "/history", icon: History, label: "History" },
  { to: "/journey", icon: Compass, label: "Journey" },
  { to: "/studio", icon: Clapperboard, label: "Studio" },
  { to: "/upload", icon: Upload, label: "Upload" },
];

export default function Sidebar() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(logoutSuccess());
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navClassName = ({ isActive }) => [
    "group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors duration-150",
    isActive
      ? "text-[var(--odyssey-text)] bg-[var(--odyssey-surface-soft)]"
      : "text-[var(--odyssey-text-muted)] hover:text-[var(--odyssey-text-secondary)] hover:bg-[var(--odyssey-surface-soft)]",
  ].join(" ");

  return (
    <aside className="hidden min-h-[calc(100vh-48px)] w-[13.5rem] shrink-0 border-r border-[var(--odyssey-border)] lg:block">
      <nav className="flex h-full flex-col gap-0.5 px-3 py-3" aria-label="Main navigation">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={label} to={to} end={to === "/"} className={navClassName}>
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-[var(--odyssey-accent)]" />
                )}
                <Icon size={16} strokeWidth={1.75} aria-hidden="true" />
                {label}
              </>
            )}
          </NavLink>
        ))}

        <NavLink to={`/profile/${user?.username}`} className={navClassName}>
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-[2px] rounded-full bg-[var(--odyssey-accent)]" />
              )}
              <User size={16} strokeWidth={1.75} aria-hidden="true" />
              Profile
            </>
          )}
        </NavLink>

        <div className="flex-1" />

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-[13px] font-medium text-[var(--odyssey-text-muted)] transition-colors duration-150 hover:text-[var(--odyssey-danger)] hover:bg-[var(--odyssey-danger-bg)]"
        >
          <LogOut size={16} strokeWidth={1.75} aria-hidden="true" />
          Logout
        </button>
      </nav>
    </aside>
  );
}
