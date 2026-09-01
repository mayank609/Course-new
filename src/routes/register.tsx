import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trackMetaEvent } from "@/components/site/MetaPixel";

const registerSchema = zod.object({
  name: zod.string().min(2, "Name must be at least 2 characters"),
  email: zod.string().email("Please enter a valid email address"),
  phone: zod.string().min(10, "Phone number must be at least 10 digits"),
  password: zod.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = zod.infer<typeof registerSchema>;

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  validateSearch: (search) => ({
    redirect: (search.redirect as string) || "/",
  }),
});

function RegisterPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/register" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otpToken, setOtpToken] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [pendingData, setPendingData] = useState<RegisterFormValues | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const startRegistration = async (data: RegisterFormValues) => {
    const res = await fetch("/api/student/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) {
      throw new Error(body.error || "Registration failed");
    }
    return body.token as string;
  };

  const onSubmit = async (data: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      const token = await startRegistration(data);
      setPendingData(data);
      setOtpToken(token);
      setOtpValue("");
      setOtpError("");
      setStep("otp");
      toast.success("We've sent a verification code to " + data.email);
    } catch (err) {
      toast.error((err as Error).message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onVerify = async () => {
    if (!pendingData) return;
    setOtpError("");
    setIsVerifying(true);
    try {
      const res = await fetch("/api/student/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: otpToken, otp: otpValue, password: pendingData.password }),
      });
      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error || "Verification failed");
      }

      toast.success("Account created successfully! Welcome, " + body.name + "!");
      trackMetaEvent("CompleteRegistration", {
        content_name: "Student Signup",
      });
      navigate({ to: search.redirect });
    } catch (err) {
      setOtpError((err as Error).message || "Verification failed");
    } finally {
      setIsVerifying(false);
    }
  };

  const onResendOtp = async () => {
    if (!pendingData) return;
    setIsResending(true);
    setOtpError("");
    try {
      const token = await startRegistration(pendingData);
      setOtpToken(token);
      setOtpValue("");
      toast.success("A new verification code has been sent to " + pendingData.email);
    } catch (err) {
      setOtpError((err as Error).message || "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-[var(--shadow-card)]">
          {step === "form" ? (
            <>
              <div className="text-center mb-8">
                <h1 className="font-serif text-3xl font-bold tracking-tight">Create Account</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Join Sarvpratham Analytics to master MS Office + AI skills
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="name">
                    Full Name
                  </label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    {...register("name")}
                    className="rounded-xl"
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

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
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="phone">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    placeholder="9876543210"
                    {...register("phone")}
                    className="rounded-xl"
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground" htmlFor="password">
                    Password
                  </label>
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
                  {isSubmitting ? "Sending code..." : "Sign Up"}
                </Button>
              </form>

              <div className="text-center mt-6 text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  search={{ redirect: search.redirect }}
                  className="text-primary font-semibold hover:underline"
                >
                  Log in here
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="font-serif text-3xl font-bold tracking-tight">Verify your email</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter the 6-digit code we sent to <span className="font-semibold text-foreground">{pendingData?.email}</span>
                </p>
              </div>

              <div className="space-y-4">
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
                  {otpError && <p className="text-xs text-destructive">{otpError}</p>}
                </div>

                <Button
                  type="button"
                  onClick={onVerify}
                  disabled={isVerifying || otpValue.length !== 6}
                  className="w-full rounded-full mt-4 font-semibold"
                >
                  {isVerifying ? "Verifying..." : "Verify & Create Account"}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Didn't get the code?{" "}
                  <button
                    type="button"
                    onClick={onResendOtp}
                    disabled={isResending}
                    className="text-primary font-semibold hover:underline disabled:opacity-50"
                  >
                    {isResending ? "Resending..." : "Resend code"}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="w-full text-center text-xs text-muted-foreground hover:underline mt-2"
                >
                  ← Back to edit details
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
