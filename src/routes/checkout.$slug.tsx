import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCourse } from "@/lib/api";
import { getCourseImage } from "@/lib/courseImages";
import { ShieldCheck, CreditCard, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout/$slug")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const navigate = useNavigate();
  const { slug } = Route.useParams();
  
  // Simulated payment processing steps
  const [paymentStep, setPaymentStep] = useState<number>(-1);
  const [paymentStepsTexts] = useState<string[]>([
    "Connecting to secure payment gateway...",
    "Sending transaction details...",
    "Authorizing payment with bank...",
    "Securing final transaction token...",
    "Payment approved! Finalizing purchase...",
  ]);

  // Fetch Student Profile (to verify authentication)
  const { data: student, isLoading: isProfileLoading, isError: isProfileError } = useQuery({
    queryKey: ["student-me"],
    queryFn: async () => {
      const res = await fetch("/api/student/me");
      if (!res.ok) {
        throw new Error("Unauthorized");
      }
      return res.json() as Promise<{ id: string; name: string; email: string; purchasedCourses: string[] }>;
    },
    retry: false,
  });

  // Fetch Course details
  const { data: course, isLoading: isCourseLoading, isError: isCourseError } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => fetchCourse(slug),
  });

  // If unauthorized, redirect to login
  useEffect(() => {
    if (isProfileError) {
      toast.error("Please log in to purchase the course");
      navigate({ to: "/login", search: { redirect: `/checkout/${slug}` } });
    }
  }, [isProfileError, navigate, slug]);

  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());

  function toggleAddon(addonSlug: string) {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(addonSlug)) next.delete(addonSlug);
      else next.add(addonSlug);
      return next;
    });
  }

  const selectedAddonCourses = (course?.recommendedCourseDetails ?? []).filter((rec) =>
    selectedAddons.has(rec.slug)
  );
  const addonsTotal = selectedAddonCourses.reduce((sum, rec) => sum + rec.price, 0);
  const totalAmount = (course?.price ?? 0) + addonsTotal;

  // Buy course mutation
  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug: slug, addonSlugs: Array.from(selectedAddons) }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Purchase failed");
      }
      return data;
    },
    onSuccess: () => {
      toast.success("Course purchased successfully! Happy learning!");
      navigate({ to: "/thank-you", search: { course: course?.title || slug } });
    },
    onError: (err) => {
      toast.error((err as Error).message || "Transaction failed");
      setPaymentStep(-1);
    },
  });

  // Start checkout simulation
  const handlePayment = () => {
    setPaymentStep(0);
  };

  // Run the checkout simulation steps
  useEffect(() => {
    if (paymentStep === -1) return;

    if (paymentStep < paymentStepsTexts.length) {
      const timer = setTimeout(() => {
        setPaymentStep((prev) => prev + 1);
      }, 1500); // 1.5 seconds per step
      return () => clearTimeout(timer);
    } else {
      // Completed simulation steps, now execute the actual purchase API call
      purchaseMutation.mutate();
    }
  }, [paymentStep, purchaseMutation]);

  const isLoading = isProfileLoading || isCourseLoading;
  const isProcessingPayment = paymentStep >= 0;

  if (isProfileError) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-grow px-4 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <Link
            to={`/courses/${slug}`}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" /> Back to course details
          </Link>

          {isLoading ? (
            <div className="space-y-6">
              <Skeleton className="h-10 w-1/3" />
              <div className="grid md:grid-cols-2 gap-8">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          ) : isCourseError || !course ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Course not found.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-[1.2fr_1fr] gap-8 items-start">
              {/* Left Side: Order Details */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-[var(--shadow-card)] space-y-6">
                <h1 className="font-serif text-2xl font-bold">Review Order</h1>

                {/* Course Details summary */}
                <div className="flex gap-4 items-start border-b border-border pb-6">
                  <div className="w-24 aspect-video rounded-lg overflow-hidden shrink-0">
                    <img
                      src={getCourseImage(course.category, course.imageUrl)}
                      alt={course.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                      {course.category}
                    </span>
                    <h3 className="font-serif text-base font-bold leading-tight">{course.title}</h3>
                    <p className="text-xs text-muted-foreground">{course.durationHours} hrs content</p>
                  </div>
                </div>

                {/* Recommended add-on courses the student can also buy */}
                {course.recommendedCourseDetails && course.recommendedCourseDetails.length > 0 && (
                  <div className="space-y-3 border-b border-border pb-6">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Frequently Bought Together
                    </h3>
                    <div className="space-y-2">
                      {course.recommendedCourseDetails.map((rec) => {
                        const checked = selectedAddons.has(rec.slug);
                        return (
                          <label
                            key={rec.slug}
                            className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-colors ${
                              checked ? "bg-primary/5 border-primary/20" : "bg-muted/20 border-border hover:bg-muted/30"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleAddon(rec.slug)}
                              className="h-4 w-4 shrink-0 accent-primary"
                            />
                            <div className="w-14 aspect-video rounded-md overflow-hidden shrink-0">
                              <img
                                src={getCourseImage(rec.category, rec.imageUrl)}
                                alt={rec.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold truncate">{rec.title}</p>
                              <p className="text-xs text-muted-foreground">{rec.durationHours} hrs content</p>
                            </div>
                            <span className="shrink-0 text-sm font-bold text-primary">
                              +₹{rec.price}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Account Details summary */}
                {student && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Billing Account
                    </h3>
                    <div className="text-sm p-4 bg-muted/30 rounded-2xl space-y-1 border border-border">
                      <p className="font-semibold">{student.name}</p>
                      <p className="text-muted-foreground text-xs">{student.email}</p>
                    </div>
                  </div>
                )}

                {/* Security Badge */}
                <div className="flex items-center gap-3 p-4 bg-emerald-500/5 text-emerald-600 rounded-2xl border border-emerald-500/10 text-xs">
                  <ShieldCheck className="h-5 w-5 shrink-0" />
                  <p>
                    Secure Checkout: Your transaction is fully encrypted and processed on a sandbox mock payment gateway.
                  </p>
                </div>
              </div>

              {/* Right Side: Payment summary */}
              <div className="bg-card border border-border rounded-3xl p-6 shadow-[var(--shadow-card)] space-y-6 sticky top-24">
                <h2 className="font-serif text-xl font-bold">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{course.title}</span>
                    <span>₹{course.price}</span>
                  </div>
                  {selectedAddonCourses.map((rec) => (
                    <div key={rec.slug} className="flex justify-between">
                      <span className="text-muted-foreground truncate pr-2">{rec.title}</span>
                      <span>₹{rec.price}</span>
                    </div>
                  ))}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span className="text-emerald-600 font-medium">Free</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-4 text-base font-bold">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{totalAmount}</span>
                  </div>
                </div>

                {isProcessingPayment ? (
                  /* Processing state visual loader overlay/block */
                  <div className="bg-muted/40 border border-border rounded-2xl p-6 text-center space-y-4">
                    <div className="relative h-12 w-12 mx-auto">
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                      <CreditCard className="h-5 w-5 text-primary absolute inset-0 m-auto" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Processing Secure Payment</p>
                      <p className="text-[11px] text-muted-foreground mt-1.5 animate-pulse min-h-[28px]">
                        {paymentStep < paymentStepsTexts.length
                          ? paymentStepsTexts[paymentStep]
                          : "Finalizing course enrollment..."}
                      </p>
                    </div>

                    {/* Progress dots indicating steps */}
                    <div className="flex justify-center gap-1.5 pt-1">
                      {paymentStepsTexts.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                            idx <= paymentStep ? "bg-primary scale-110" : "bg-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Pay now interactive block */
                  <Button
                    onClick={handlePayment}
                    className="w-full rounded-full py-6 text-base font-semibold shadow-[var(--shadow-elegant)] hover:-translate-y-0.5 transition-transform"
                  >
                    <CreditCard className="h-5 w-5 mr-2" /> Pay ₹{totalAmount} (Mock Payment)
                  </Button>
                )}

                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">
                    By checking out, you agree to our Terms of Service & Refund Policy.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
