import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { trackMetaEvent } from "@/components/site/MetaPixel";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchCourse } from "@/lib/api";
import { getCourseImage } from "@/lib/courseImages";
import { getAttribution } from "@/lib/attribution";
import { getVisitorId } from "@/lib/visitor";
import { trackCartEvent } from "@/lib/cartTracking";
import { ShieldCheck, CreditCard, ArrowLeft, Loader2, CheckCircle2, Tag, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { getCoursePricing, applyGst, GST_PERCENT } from "@/lib/coursePricing";

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
  const { slug } = Route.useParams();

  // Billing details
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  // Guest checkout details — only used when no student session is found
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

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

  // Checkout no longer requires login, so this fires once we know the course
  // and have settled whether the visitor is logged in or checking out as a
  // guest — not gated on `student` alone, which would skip guest visitors.
  useEffect(() => {
    if (course && !isProfileLoading) {
      trackMetaEvent("InitiateCheckout", {
        content_name: course.title,
        content_category: course.category,
        content_ids: [course._id],
        content_type: "product",
        value: course.price,
        currency: "INR",
      });
      trackCartEvent("begin_checkout", {
        courseSlug: course.slug,
        courseTitle: course.title,
        amount: course.price,
        name: student?.name,
        email: student?.email,
        phone: student?.phone,
      });
    }
  }, [course, isProfileLoading]);

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
  const subtotal = (course?.price ?? 0) + addonsTotal;

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");

  // Any change to the cart (addons) invalidates a previously applied coupon — its discount was computed against the old subtotal
  useEffect(() => {
    setAppliedCoupon(null);
  }, [selectedAddons.size]);

  const applyCouponMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput.trim(),
          courseSlug: slug,
          addonSlugs: Array.from(selectedAddons),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid coupon");
      return data as { code: string; discountAmount: number; finalAmount: number };
    },
    onSuccess: (data) => {
      setAppliedCoupon({ code: data.code, discountAmount: data.discountAmount, finalAmount: data.finalAmount });
      setCouponError("");
      toast.success(`Coupon "${data.code}" applied!`);
    },
    onError: (err) => {
      setCouponError((err as Error).message);
      setAppliedCoupon(null);
    },
  });

  const taxableAmount = appliedCoupon ? appliedCoupon.finalAmount : subtotal;
  const { gstAmount, totalWithGst: totalAmount } = applyGst(taxableAmount);
  const formatInr = (value: number) => value.toLocaleString("en-IN", { maximumFractionDigits: 2 });

  // Cashfree checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseSlug: slug,
          addonSlugs: Array.from(selectedAddons),
          ...(isGuest ? { name: guestName.trim(), email: guestEmail.trim() } : {}),
          phone: phone.trim(),
          state: state.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
          couponCode: appliedCoupon?.code,
          attribution: getAttribution(),
          visitorId: getVisitorId(),
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
    if (isGuest) {
      if (!guestName.trim()) {
        toast.error("Please enter your full name");
        return;
      }
      if (!guestEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
        toast.error("Please enter a valid email address");
        return;
      }
    }
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
    if (!city.trim()) {
      toast.error("Please enter your city");
      return;
    }
    if (!pincode.trim()) {
      toast.error("Please enter your pincode");
      return;
    }
    if (course) {
      trackMetaEvent("AddPaymentInfo", {
        content_name: course.title,
        content_category: course.category,
        content_ids: [course._id],
        content_type: "product",
        value: course.price,
        currency: "INR",
      });
      trackCartEvent("customer_details_submitted", {
        courseSlug: course.slug,
        courseTitle: course.title,
        amount: totalAmount,
        name: isGuest ? guestName.trim() : student?.name,
        email: isGuest ? guestEmail.trim() : student?.email,
        phone: phone.trim(),
        state: state.trim(),
        city: city.trim(),
      });
    }
    setPaymentStep(0); // Connecting to gateway
    checkoutMutation.mutate();
  };

  const isLoading = isProfileLoading || isCourseLoading;
  const isProcessingPayment = paymentStep >= 0;
  // No session means this visitor is checking out as a guest — the billing
  // block below collects name/email for them instead of showing account info.
  const isGuest = isProfileError;

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
                      className="h-full w-full object-cover object-top"
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
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-bold">Frequently Bought Together</h3>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                      {course.recommendedCourseDetails.map((rec) => {
                        const checked = selectedAddons.has(rec.slug);
                        const pricing = getCoursePricing(rec.price, rec.originalPrice);
                        return (
                          <button
                            type="button"
                            key={rec.slug}
                            onClick={() => toggleAddon(rec.slug)}
                            className={`shrink-0 w-[200px] snap-start text-left rounded-2xl border p-3 transition-colors ${
                              checked ? "bg-primary/5 border-primary" : "bg-muted/20 border-border hover:bg-muted/30"
                            }`}
                          >
                            <div className="aspect-video rounded-lg overflow-hidden mb-2">
                              <img
                                src={getCourseImage(rec.category, rec.imageUrl)}
                                alt={rec.title}
                                className="h-full w-full object-cover object-top"
                              />
                            </div>
                            <p className="text-sm font-semibold leading-snug line-clamp-2 min-h-[2.5em]">{rec.title}</p>
                            {rec.shortDescription && (
                              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{rec.shortDescription}</p>
                            )}
                            <div className="flex items-baseline gap-1.5 mt-1.5 flex-wrap">
                              <span className="text-sm font-extrabold text-primary">₹{pricing.price.toLocaleString()}</span>
                              {pricing.hasDiscount && (
                                <>
                                  <span className="text-[10px] text-muted-foreground line-through">
                                    ₹{pricing.originalPrice.toLocaleString()}
                                  </span>
                                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1 py-0.5 rounded">
                                    {pricing.discountPercent}% OFF
                                  </span>
                                </>
                              )}
                            </div>
                            <div
                              className={`mt-2 flex items-center justify-center gap-1.5 rounded-full py-1.5 text-xs font-semibold ${
                                checked ? "bg-primary text-primary-foreground" : "bg-white border border-primary/40 text-primary"
                              }`}
                            >
                              {checked ? (
                                <>
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Added to Order
                                </>
                              ) : (
                                "+ Add to Order"
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Billing Details */}
                {!isProfileLoading && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Billing Details
                    </h3>
                    <div className="space-y-4 p-5 bg-muted/20 rounded-3xl border border-border">
                      {student ? (
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
                      ) : (
                        <>
                          <div className="flex items-center justify-between gap-2 pb-1">
                            <p className="text-xs text-muted-foreground">
                              Checking out as a guest — no account needed right now.
                            </p>
                            <Link
                              to="/login"
                              search={{ redirect: `/checkout/${slug}` }}
                              className="text-xs font-semibold text-primary hover:underline shrink-0"
                            >
                              Log in instead
                            </Link>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Full Name *</label>
                              <input
                                type="text"
                                value={guestName}
                                onChange={(e) => setGuestName(e.target.value)}
                                placeholder="Your full name"
                                className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                                required
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Email Address *</label>
                              <input
                                type="email"
                                value={guestEmail}
                                onChange={(e) => setGuestEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full bg-white border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                                required
                              />
                            </div>
                          </div>
                        </>
                      )}

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
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">State *</label>
                            <input
                              type="text"
                              value={state}
                              onChange={(e) => setState(e.target.value)}
                              placeholder="e.g. Delhi"
                              className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">City *</label>
                            <input
                              type="text"
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="e.g. New Delhi"
                              className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Pincode *</label>
                            <input
                              type="text"
                              value={pincode}
                              onChange={(e) => setPincode(e.target.value)}
                              placeholder="6-digit PIN"
                              className="w-full bg-white border border-border rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary font-medium"
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
                  {(() => {
                    const pricing = getCoursePricing(course.price, course.originalPrice);
                    return (
                      <div className="flex justify-between items-baseline">
                        <span className="text-muted-foreground">{course.title}</span>
                        <div className="text-right shrink-0">
                          <span className="font-semibold">₹{pricing.price}</span>
                          {pricing.hasDiscount && (
                            <span className="text-xs text-muted-foreground line-through ml-2 font-medium">
                              ₹{pricing.originalPrice}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
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
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Coupon ({appliedCoupon.code})</span>
                      <span>-₹{appliedCoupon.discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GST ({GST_PERCENT}%)</span>
                    <span>₹{formatInr(gstAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-4 text-base font-bold">
                    <span>Total Amount <span className="text-xs font-medium text-muted-foreground">(incl. GST)</span></span>
                    <span className="text-primary">₹{formatInr(totalAmount)}</span>
                  </div>
                </div>

                {/* Coupon code entry */}
                <div className="space-y-2">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between gap-2 p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                      <span className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                        <Tag className="h-4 w-4" /> {appliedCoupon.code} applied
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setAppliedCoupon(null);
                          setCouponInput("");
                          setCouponError("");
                        }}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                        aria-label="Remove coupon"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <Input
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value.toUpperCase());
                            setCouponError("");
                          }}
                          placeholder="Have a coupon code?"
                          className="rounded-xl uppercase"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          disabled={!couponInput.trim() || applyCouponMutation.isPending}
                          onClick={() => applyCouponMutation.mutate()}
                          className="rounded-xl shrink-0"
                        >
                          {applyCouponMutation.isPending ? "Checking..." : "Apply"}
                        </Button>
                      </div>
                      {couponError && <p className="text-xs text-destructive">{couponError}</p>}
                    </>
                  )}
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
                    <CreditCard className="h-5 w-5 mr-2" /> Pay ₹{formatInr(totalAmount)}
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
