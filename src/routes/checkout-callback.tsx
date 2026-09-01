import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { z } from "zod";

const searchSchema = z.object({
  order_id: z.string().catch(""),
});

export const Route = createFileRoute("/checkout-callback")({
  validateSearch: searchSchema,
  component: CheckoutCallbackPage,
});

function CheckoutCallbackPage() {
  const { order_id } = Route.useSearch();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [courseTitle, setCourseTitle] = useState("");

  useEffect(() => {
    if (!order_id) {
      setStatus("error");
      setErrorMessage("Missing order identifier.");
      return;
    }

    let isMounted = true;
    let attempts = 0;
    const maxAttempts = 3;

    const verifyPayment = async () => {
      try {
        const response = await fetch(`/api/payment/verify?order_id=${encodeURIComponent(order_id)}`);
        const data = await response.json();

        if (!isMounted) return;

        if (response.ok && data.ok) {
          setStatus("success");
          setCourseTitle(data.courseTitle || "Course");
          toast.success("Payment verified successfully!");

          setTimeout(() => {
            if (isMounted) {
              navigate({
                to: "/thank-you",
                search: {
                  course: data.courseTitle || "Course",
                  amount: typeof data.amount === "number" ? data.amount : undefined,
                  currency: data.currency || "INR",
                  orderId: data.orderId || order_id,
                },
              });
            }
          }, 2000);
        } else {
          if (attempts < maxAttempts && (data.status === "ACTIVE" || response.status >= 500)) {
            attempts++;
            setTimeout(verifyPayment, 2000);
          } else {
            setStatus("error");
            setErrorMessage(data.error || "Payment verification failed. Please contact support.");
          }
        }
      } catch (err) {
        if (!isMounted) return;
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(verifyPayment, 2000);
        } else {
          setStatus("error");
          setErrorMessage("An unexpected error occurred while verifying your payment.");
        }
      }
    };

    verifyPayment();

    return () => {
      isMounted = false;
    };
  }, [order_id, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow flex items-center justify-center px-4 py-16 sm:py-24 relative overflow-hidden">
        {/* Background design elements */}
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-primary/5 blur-3xl -z-10" />
        <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-[color:var(--brand-gold)]/10 blur-3xl -z-10" />

        <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          {status === "loading" && (
            <>
              <div className="relative h-16 w-16 mx-auto flex items-center justify-center">
                <Loader2 className="h-16 w-16 text-primary animate-spin" />
              </div>
              <div className="space-y-2">
                <h1 className="font-serif text-2xl font-bold text-foreground">Verifying Payment</h1>
                <p className="text-muted-foreground text-sm">
                  We are securely confirming your transaction status with Cashfree. Please do not refresh this page or close the window.
                </p>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                <CheckCircle className="h-10 w-10 text-emerald-600 animate-bounce" />
              </div>
              <div className="space-y-2">
                <h1 className="font-serif text-2xl font-bold text-foreground">Payment Confirmed!</h1>
                <p className="text-muted-foreground text-sm">
                  Your purchase of <strong className="text-foreground font-semibold">{courseTitle}</strong> is verified. Redirecting you to your dashboard...
                </p>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <div className="space-y-2">
                <h1 className="font-serif text-2xl font-bold text-foreground">Verification Failed</h1>
                <p className="text-sm text-muted-foreground">
                  {errorMessage || "We could not verify your payment. If money was deducted, it will be refunded or updated shortly."}
                </p>
              </div>
              <div className="space-y-3 pt-2">
                <Button onClick={() => window.location.reload()} className="w-full rounded-full py-6 text-base font-semibold shadow-md">
                  Retry Verification
                </Button>
                <Button asChild variant="outline" className="w-full rounded-full py-6 text-base font-semibold">
                  <Link to="/courses">Return to Courses</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
