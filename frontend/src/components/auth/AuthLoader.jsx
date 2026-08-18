import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/authSlice";
import { getCurrentUser } from "../../services/auth";

export default function AuthLoader({ children }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await getCurrentUser();

        const userData = response.data?.user || response.data;
        if (userData) {
          dispatch(loginSuccess(userData));
        }
      } catch (error) {
        console.log("No active session");
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, [dispatch]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ background: "var(--odyssey-bg)", color: "var(--odyssey-text-muted)" }}
        role="status"
        aria-live="polite"
      >
        <div
          className="h-10 w-10 rounded-full border-2 border-[var(--odyssey-border)] border-t-[var(--odyssey-accent)] animate-spin"
          aria-hidden="true"
        />
        <p className="text-sm font-medium">Restoring your journey...</p>
      </div>
    );
  }

  return children;
}