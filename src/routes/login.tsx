import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const loginSchema = zod.object({
  email: zod.string().email("Please enter a valid email address"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

export const Route = createFileRoute("/login")({
  component: LoginPage,
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || "/",
  }),
});

function LoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/login" });
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<"password" | "otp">("password");

  // Drop any cached "logged out" profile so the page we land on sees the new session.
  const onLoggedIn = (name: string) => {
    queryClient.resetQueries({ queryKey: ["student-me"] });
    queryClient.resetQueries({ queryKey: ["student-courses"] });
    toast.success("Welcome back, " + name + "!");
    navigate({ to: search.redirect });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/student/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || "Login failed");
      }

      onLoggedIn(body.name);
    } catch (err) {
      toast.error((err as Error).message || "Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-[var(--shadow-card)]">
          <div className="text-center mb-8">
            <h1 className="font-serif text-3xl font-bold tracking-tight">Welcome Back</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Log into your Sarvpratham Analytics account to start learning
            </p>
          </div>

          <div className="grid grid-cols-2 gap-1 p-1 mb-6 rounded-full bg-muted/40 border border-border text-sm font-semibold">
            <button
              type="button"
              onClick={() => setMode("password")}
              className={`rounded-full py-2 transition-colors ${mode === "password" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setMode("otp")}
              className={`rounded-full py-2 transition-colors ${mode === "otp" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground"}`}
            >
              Email OTP
            </button>
          </div>

          {mode === "otp" ? (
            <OtpLogin onLoggedIn={onLoggedIn} />
          ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground" htmlFor="email">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                className="rounded-xl"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground" htmlFor="password">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                {...register("password")}
                className="rounded-xl"
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full mt-4 font-semibold"
            >
              {isSubmitting ? "Logging in..." : "Log In"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Bought a course without an account?{" "}
              <button type="button" onClick={() => setMode("otp")} className="text-primary font-semibold hover:underline">
                Log in with an email code
              </button>
            </p>
          </form>
          )}

          <div className="text-center mt-6 text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              to="/register"
              search={{ redirect: search.redirect }}
              className="text-primary font-semibold hover:underline"
            >
              Register here
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function OtpLogin({ onLoggedIn }: { onLoggedIn: (name: string) => void }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const sendCode = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }
    setIsBusy(true);
    try {
      const res = await fetch("/api/student/login/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Could not send the code");
      setCodeSent(true);
      toast.success("If an account exists for this email, a login code is on its way.");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsBusy(false);
    }
  };

  const verifyCode = async (e: FormEvent) => {
    e.preventDefault();
    if (!codeSent) return sendCode();
    if (!/^\d{6}$/.test(otp.trim())) {
      toast.error("Enter the 6-digit code from your email");
      return;
    }
    setIsBusy(true);
    try {
      const res = await fetch("/api/student/login/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Login failed");
      onLoggedIn(body.name);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <form onSubmit={verifyCode} className="space-y-4">
      <p className="text-xs text-muted-foreground">
        No password needed — we'll email you a one-time code. Use the email you entered at checkout.
      </p>
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground" htmlFor="otp-email">
          Email Address
        </label>
        <Input
          id="otp-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setCodeSent(false);
            setOtp("");
          }}
          className="rounded-xl"
        />
      </div>

      {codeSent && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-muted-foreground" htmlFor="otp-code">
              6-digit code
            </label>
            <button
              type="button"
              onClick={sendCode}
              disabled={isBusy}
              className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
            >
              Resend code
            </button>
          </div>
          <Input
            id="otp-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            className="rounded-xl tracking-[0.4em] text-center font-semibold"
          />
        </div>
      )}

      <Button type="submit" disabled={isBusy} className="w-full rounded-full mt-4 font-semibold">
        {isBusy ? "Please wait..." : codeSent ? "Verify & Log In" : "Send Login Code"}
      </Button>
    </form>
  );
}
