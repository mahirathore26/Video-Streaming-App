import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { register as registerUser } from "../services/auth";

export default function Register() {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    if (!data.avatar || !data.avatar[0]) {
      toast.error("Avatar image is required");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("fullname", data.fullname);
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("avatar", data.avatar[0]);

      if (data.coverimage?.[0]) {
        formData.append("coverimage", data.coverimage[0]);
      }

      const response = await registerUser(formData);
      toast.success(response?.message || "Registration successful!");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-lg border border-[var(--odyssey-border)] bg-[var(--odyssey-surface)] p-8 sm:p-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-2 text-center border-b border-[var(--odyssey-border)] pb-8 mb-4">
            <p className="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-[var(--odyssey-text)] mb-3">Odyssey</p>
            <h1 className="font-serif text-3xl sm:text-4xl text-[var(--odyssey-text)] tracking-wider">Begin Your Odyssey</h1>
            <p className="font-serif text-[15px] italic text-[var(--odyssey-text-muted)] mt-2">Create your archive and begin your journey.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-widest text-[var(--odyssey-text-secondary)]">Full Name</label>
              <Input placeholder="John Doe" autoComplete="name" {...register("fullname")} />
            </div>
            <div>
              <label className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-widest text-[var(--odyssey-text-secondary)]">Username</label>
              <Input placeholder="johndoe" autoComplete="username" {...register("username")} />
            </div>
            <div>
              <label className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-widest text-[var(--odyssey-text-secondary)]">Email</label>
              <Input placeholder="you@example.com" type="email" autoComplete="email" {...register("email")} />
            </div>
            <div>
              <label className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-widest text-[var(--odyssey-text-secondary)]">Password</label>
              <Input type="password" placeholder="••••••••" autoComplete="new-password" {...register("password")} />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-widest text-[var(--odyssey-text-secondary)]">
                Avatar <span className="text-[var(--odyssey-danger)]">*</span>
              </label>
              <input type="file" accept="image/*" {...register("avatar")} className="odyssey-file-input" />
              <p className="mt-1 font-sans text-[10px] uppercase tracking-wider text-[var(--odyssey-text-muted)]">Required</p>
            </div>

            <div>
              <label className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-widest text-[var(--odyssey-text-secondary)]">Cover Image</label>
              <input type="file" accept="image/*" {...register("coverimage")} className="odyssey-file-input" />
              <p className="mt-1 font-sans text-[10px] uppercase tracking-wider text-[var(--odyssey-text-muted)]">Optional</p>
            </div>
          </div>

          <Button className="w-full" type="submit" isLoading={loading}>Create Account</Button>

          <p className="text-center text-sm text-[var(--odyssey-text-muted)]">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-[var(--odyssey-accent)] hover:text-[var(--odyssey-accent-hover)]">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
