import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4"
      style={{ background: "var(--odyssey-bg)" }}
    >
      <p className="text-7xl font-bold" style={{ color: "var(--odyssey-accent)" }}>
        404
      </p>
      <h1 className="text-3xl font-bold" style={{ color: "var(--odyssey-text)" }}>
        Page Not Found
      </h1>
      <p className="text-sm max-w-sm" style={{ color: "var(--odyssey-text-muted)" }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/">
        <Button>Back to Explore</Button>
      </Link>
    </div>
  );
}