import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";

const passwordSchema = zod
  .object({
    password: zod.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: zod.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type PasswordValues = zod.infer<typeof passwordSchema>;

export const Route = createFileRoute("/activate")({
  component: ActivatePage,
  validateSearch: (search) => ({
    token: (search.token as string) || "",
  }),
});

type TokenState =
  | { status: "checking" }
  | { status: "invalid" }
  | { status: "already-activated" }
  | { status: "ready"; name: string; email: string };

function ActivatePage() {
  const navigate = useNavigate();
  const { token } = useSearch({ from: "/activate" });
  const [tokenState, setTokenState] = useState<TokenState>({ status: "checking" });
  const [step, setStep] = useState<"confirm" | "otp">("confirm");
  const [otpToken, setOtpToken] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    if (!token) {
      setTokenState({ status: "invalid" });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/student/activate/verify-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setTokenState({ status: "invalid" });
          return;
        }
        if (body.alreadyActivated) {
          setTokenState({ status: "already-activated" });
          return;
        }
        setTokenState({ status: "ready", name: body.name, email: body.email });
      } catch {
        if (!cancelled) setTokenState({ status: "invalid" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const sendOtp = async () => {
    setIsSendingOtp(true);
    try {
      const res = await fetch("/api/student/activate/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Failed to send verification code");
      setOtpToken(body.otpToken);
      setOtpValue("");
      setOtpError("");
      setStep("otp");
      toast.success("Verification code sent!");
    } catch (err) {
      toast.error((err as Error).message || "Failed to send verification code");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const onSubmit = async (data: PasswordValues) => {
    if (otpValue.length !== 6) {
      setOtpError("Please enter the 6-digit code");
      return;
    }
    setOtpError("");
    setIsVerifying(true);
    try {
      const res = await fetch("/api/student/activate/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpToken, otp: otpValue, password: data.password }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Activation failed");
      toast.success("Account activated! Welcome, " + body.name + ".");
      navigate({ to: "/dashboard" });
    } catch (err) {
      setOtpError((err as Error).message || "Activation failed");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-[var(--shadow-card)]">
          {tokenState.status === "checking" && (
            <div className="flex flex-col items-center gap-3 py-10">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Checking your activation link...</p>
            </div>
          )}

          {tokenState.status === "invalid" && (
            <div className="text-center space-y-3">
              <h1 className="font-serif text-2xl font-bold">Link expired or invalid</h1>
              <p className="text-sm text-muted-foreground">
                This activation link is no longer valid. You can request a fresh one, or set a password via password
                reset if you know your account email.
              </p>
              <Link to="/forgot-password" className="text-primary font-semibold hover:underline text-sm inline-block mt-2">
                Go to Forgot Password
              </Link>
            </div>
          )}

          {tokenState.status === "already-activated" && (
            <div className="text-center space-y-3">
              <h1 className="font-serif text-2xl font-bold">Already activated</h1>
              <p className="text-sm text-muted-foreground">
                This account already has a password set. Please log in instead.
              </p>
              <Link to="/login" search={{ redirect: "/dashboard" }} className="text-primary font-semibold hover:underline text-sm inline-block mt-2">
                Go to Login
              </Link>
            </div>
          )}

          {tokenState.status === "ready" && step === "confirm" && (
            <div className="text-center space-y-5">
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 grid place-items-center">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="font-serif text-2xl font-bold tracking-tight">Activate your account</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Hi {tokenState.name}, let's set a password for <span className="font-semibold text-foreground">{tokenState.email}</span> so you can log in anytime.
                </p>
              </div>
              <Button onClick={sendOtp} disabled={isSendingOtp} className="w-full rounded-full font-semibold">
                {isSendingOtp ? "Sending code..." : "Send Verification Code"}
              </Button>
            </div>
          )}

          {tokenState.status === "ready" && step === "otp" && (
            <>
              <div className="text-center mb-8">
                <h1 className="font-serif text-2xl font-bold tracking-tight">Set your password</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter the 6-digit code sent to <span className="font-semibold text-foreground">{tokenState.email}</span>
                </p>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="otp">
                    Verification Code
                  </label>
                  <Input
                    id="otp"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="rounded-xl text-center text-lg tracking-[0.5em] font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="password">
                    New Password
                  </label>
                  <PasswordInput id="password" placeholder="••••••••" {...register("password")} className="rounded-xl" />
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="confirmPassword">
                    Confirm Password
                  </label>
                  <PasswordInput id="confirmPassword" placeholder="••••••••" {...register("confirmPassword")} className="rounded-xl" />
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                </div>

                {otpError && <p className="text-xs text-destructive">{otpError}</p>}

                <Button type="submit" disabled={isVerifying} className="w-full rounded-full mt-4 font-semibold">
                  {isVerifying ? "Activating..." : "Activate Account"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Didn't get the code?{" "}
                  <button
                    type="button"
                    onClick={sendOtp}
                    disabled={isSendingOtp}
                    className="text-primary font-semibold hover:underline disabled:opacity-50"
                  >
                    {isSendingOtp ? "Resending..." : "Resend code"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
