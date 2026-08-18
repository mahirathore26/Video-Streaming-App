import { Outlet } from "react-router-dom";
import Navbar from "../components/navigation/Navbar";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[var(--odyssey-bg)] text-[var(--odyssey-text)] font-sans">
      <Navbar />

      <main className="odyssey-container py-8">
        <Outlet />
      </main>
    </div>
  );
}
