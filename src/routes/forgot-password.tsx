import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as zod from "zod";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { MailCheck } from "lucide-react";

const forgotPasswordSchema = zod.object({
  email: zod.string().email("Please enter a valid email address"),
});

type ForgotPasswordValues = zod.infer<typeof forgotPasswordSchema>;

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/student/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || "Something went wrong");
      setSent(true);
    } catch (err) {
      toast.error((err as Error).message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 shadow-[var(--shadow-card)]">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
                <MailCheck className="h-7 w-7" />
              </div>
              <h1 className="font-serif text-2xl font-bold tracking-tight">Check your inbox</h1>
              <p className="text-sm text-muted-foreground">
                If an account exists for that email, we've sent a link to reset your password. It expires in 30 minutes.
              </p>
              <Link
                to="/login"
                search={{ redirect: "/" }}
                className="inline-block text-sm text-primary font-semibold hover:underline mt-2"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="font-serif text-3xl font-bold tracking-tight">Forgot Password</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  Enter your email and we'll send you a link to reset your password
                </p>
              </div>

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

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full mt-4 font-semibold"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>

              <div className="text-center mt-6 text-sm text-muted-foreground">
                Remembered your password?{" "}
                <Link to="/login" search={{ redirect: "/" }} className="text-primary font-semibold hover:underline">
                  Log in here
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
