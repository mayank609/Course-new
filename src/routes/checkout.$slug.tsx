import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { trackMetaEvent } from "@/components/site/MetaPixel";
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

const loadCashfreeScript = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if ((window as any).Cashfree) {
      resolve((window as any).Cashfree);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => {
      resolve((window as any).Cashfree);
    };
    script.onerror = () => {
      reject(new Error("Failed to load Cashfree SDK"));
    };
    document.body.appendChild(script);
  });
};

function CheckoutPage() {
  const navigate = useNavigate();
  const { slug } = Route.useParams();
  
  // Billing details
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // Cashfree payment processing steps
  const [paymentStep, setPaymentStep] = useState<number>(-1);
  const [paymentStepsTexts] = useState<string[]>([
    "Connecting to secure payment gateway...",
    "Loading payment gateway SDK...",
    "Redirecting to Cashfree secure checkout...",
  ]);

  // Fetch Student Profile (to verify authentication)
  const { data: student, isLoading: isProfileLoading, isError: isProfileError } = useQuery({
    queryKey: ["student-me"],
    queryFn: async () => {
      const res = await fetch("/api/student/me");
      if (!res.ok) {
        throw new Error("Unauthorized");
      }
      return res.json() as Promise<{ id: string; name: string; email: string; phone?: string; purchasedCourses: string[] }>;
    },
    retry: false,
  });

  useEffect(() => {
    if (student?.phone) {
      setPhone(student.phone);
    }
  }, [student]);

  // Fetch Course details
  const { data: course, isLoading: isCourseLoading, isError: isCourseError } = useQuery({
    queryKey: ["course", slug],
    queryFn: () => fetchCourse(slug),
  });

  useEffect(() => {
    if (course) {
      trackMetaEvent("InitiateCheckout", {
        content_name: course.title,
        content_category: course.category,
        content_ids: [course._id],
        content_type: "product",
        value: course.price,
        currency: "INR",
      });
    }
  }, [course]);

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

  // Cashfree checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: slug,
          addonSlugs: Array.from(selectedAddons),
          phone: phone.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order creation failed");
      }
      return data as { paymentSessionId: string; orderId: string };
    },
    onSuccess: async (data) => {
      try {
        setPaymentStep(1); // Loading SDK
        const CashfreeSDK = await loadCashfreeScript();
        
        setPaymentStep(2); // Redirecting
        const cashfree = CashfreeSDK({ mode: "production" });
        
        cashfree.checkout({
          paymentSessionId: data.paymentSessionId,
          redirectTarget: "_self",
        });
      } catch (err) {
        toast.error((err as Error).message || "Failed to initialize payment gateway");
        setPaymentStep(-1);
      }
    },
    onError: (err) => {
      toast.error((err as Error).message || "Failed to initiate checkout");
      setPaymentStep(-1);
    },
  });

  const handlePayment = () => {
    if (!phone.trim()) {
      toast.error("Please enter a valid phone number");
      return;
    }
    if (phone.trim().length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    if (!state.trim()) {
      toast.error("Please enter your state");
      return;
    }
    if (!pincode.trim()) {
      toast.error("Please enter your pincode");
      return;
    }
    setPaymentStep(0); // Connecting to gateway
    checkoutMutation.mutate();
  };

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

                {/* Billing Details */}
                {student && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Billing Details
                    </h3>
                    <div className="space-y-4 p-5 bg-muted/20 rounded-3xl border border-border">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Student Name</label>
                          <p className="text-sm font-semibold text-foreground">{student.name}</p>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Student Email</label>
                          <p className="text-sm font-semibold text-foreground truncate">{student.email}</p>
                        </div>
                      </div>

                      <div className="border-t border-border/60 my-2" />

                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Phone Number *</label>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="10-digit mobile number"
                            className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">State *</label>
                            <input
                              type="text"
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              placeholder="e.g. Delhi"
                              className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Pincode *</label>
                            <input
                              type="text"
                              value={pincode}
                              onChange={(e) => setPincode(e.target.value)}
                              placeholder="6-digit PIN code"
                              className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                              required
                            />
                          </div>
                        </div>
                      </div>
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
                    disabled={checkoutMutation.isPending}
                    className="w-full rounded-full py-6 text-base font-semibold shadow-[var(--shadow-elegant)] hover:-translate-y-0.5 transition-transform"
                  >
                    <CreditCard className="h-5 w-5 mr-2" /> Pay ₹{totalAmount}
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
