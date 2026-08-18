import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { login } from "../services/auth.js";
import { loginSuccess } from "../store/authSlice";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await login(data);
      dispatch(loginSuccess(response.data.user));
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-lg border border-[var(--odyssey-border)] bg-[var(--odyssey-surface)] md:grid-cols-[1.1fr_0.9fr]">
        {/* Left — branding */}
        <div className="hidden flex-col justify-between bg-[var(--odyssey-bg)] p-12 md:flex border-r border-[var(--odyssey-border)]">
          <div>
            <p className="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--odyssey-text)]">Odyssey</p>
            <h1 className="mt-8 max-w-xs font-serif text-4xl sm:text-5xl tracking-wide leading-tight text-[var(--odyssey-text)]">
              Welcome back.
            </h1>
          </div>
          <p className="max-w-xs font-serif italic text-lg leading-7 text-[var(--odyssey-text-secondary)]">
            Your stories, archives, and literary tools await.
          </p>
        </div>

        {/* Right — form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-8 sm:p-12 flex flex-col justify-center">
          <div className="space-y-2 mb-4">
            <h2 className="font-serif text-3xl text-[var(--odyssey-text)]">Sign In</h2>
            <p className="font-serif text-[15px] italic text-[var(--odyssey-text-muted)]">Enter your credentials to continue.</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-widest text-[var(--odyssey-text-secondary)]">Email or Username</label>
              <Input placeholder="you@example.com" {...register("email", { required: true })} />
            </div>
            <div>
              <label className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-widest text-[var(--odyssey-text-secondary)]">Password</label>
              <Input type="password" placeholder="••••••••" {...register("password", { required: true })} />
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={loading}>Login</Button>

          <p className="text-center text-sm text-[var(--odyssey-text-muted)] md:text-left">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="font-medium text-[var(--odyssey-accent)] hover:text-[var(--odyssey-accent-hover)]">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
