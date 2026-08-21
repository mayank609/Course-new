import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Headset, Linkedin } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { submitLead } from "@/lib/api";

const INTEREST_OPTIONS = [
  "Agile Management",
  "Project Management",
  "DevOps",
  "Software Testing",
  "Service Management",
  "BootCamps",
  "Enterprise Training",
  "Others",
];

const schema = z.object({
  interest: z.string().min(1, "Please select an option"),
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  message: z.string().optional(),
});

type Values = z.infer<typeof schema>;

type AdviserModalContextValue = {
  open: (courseTitle?: string) => void;
};

const AdviserModalContext = createContext<AdviserModalContextValue | null>(null);

export function useAdviserModal() {
  const ctx = useContext(AdviserModalContext);
  if (!ctx) throw new Error("useAdviserModal must be used within AdviserModalProvider");
  return ctx;
}

const WELCOME_POPUP_KEY = "sarvpratham_adviser_welcome_shown";

export function AdviserModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [courseTitle, setCourseTitle] = useState<string | undefined>();

  const value = useMemo<AdviserModalContextValue>(
    () => ({
      open: (title) => {
        setCourseTitle(title);
        setIsOpen(true);
      },
    }),
    [],
  );

  useEffect(() => {
    if (sessionStorage.getItem(WELCOME_POPUP_KEY)) return;
    const timer = setTimeout(() => {
      sessionStorage.setItem(WELCOME_POPUP_KEY, "1");
      setCourseTitle(undefined);
      setIsOpen(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AdviserModalContext.Provider value={value}>
      {children}
      <AdviserModalDialog open={isOpen} onOpenChange={setIsOpen} courseTitle={courseTitle} />
    </AdviserModalContext.Provider>
  );
}

function AdviserModalDialog({
  open,
  onOpenChange,
  courseTitle,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseTitle?: string;
}) {
  const defaultInterest = courseTitle ?? "Others";
  const interestOptions = INTEREST_OPTIONS.includes(defaultInterest)
    ? INTEREST_OPTIONS
    : [defaultInterest, ...INTEREST_OPTIONS];

  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { interest: defaultInterest, name: "", email: "", phone: "", message: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ interest: defaultInterest, name: "", email: "", phone: "", message: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultInterest]);

  async function onSubmit(values: Values) {
    try {
      await submitLead({
        name: values.name,
        email: values.email,
        phone: values.phone,
        message: values.message,
        source: "course-enquiry",
        courseTitle: values.interest,
      });
      toast.success("Thanks! A course adviser will reach out shortly.");
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] gap-0 overflow-hidden rounded-3xl border-none p-0">
        <DialogDescription className="sr-only">
          Fill this form and a Sarvpratham Analytics course adviser will get in touch with you shortly.
        </DialogDescription>
        <div className="grid md:grid-cols-[1fr_1.3fr]">
          <div className="relative hidden flex-col justify-between overflow-hidden bg-[image:var(--gradient-primary)] p-8 text-white md:flex">
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-[color:var(--brand-gold)]/20 blur-3xl" />
            <div className="flex items-center gap-2">
              <div className="bg-white p-2 rounded-xl inline-block">
                <img
                  src="/sarvpratham-logo.png"
                  alt="Sarvpratham Analytics"
                  className="h-10 w-auto object-contain"
                />
              </div>
            </div>
            <div className="relative">
              <div className="h-14 w-14 rounded-2xl bg-white/15 grid place-items-center ring-1 ring-white/20">
                <Headset className="h-7 w-7" />
              </div>
              <p className="mt-5 font-serif text-xl font-semibold leading-snug">
                Our advisers are online and ready to help you pick the right certification.
              </p>
            </div>
            <div className="relative flex gap-3">
              <a
                href="#"
                className="h-9 w-9 grid place-items-center rounded-full bg-white/15 transition-colors hover:bg-white/25"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <DialogTitle className="text-center font-serif text-2xl font-bold sm:text-left">
              Connect with a course adviser
            </DialogTitle>
            <div className="mt-4 rounded-full bg-[image:var(--gradient-primary)] px-4 py-2.5 text-center text-sm font-semibold text-white">
              Ready When You Are — But Not for Long!
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="interest"
                  render={({ field }) => (
                    <FormItem>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-11 rounded-xl">
                            <SelectValue placeholder="What are you interested in?" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {interestOptions.map((opt) => (
                            <SelectItem key={opt} value={opt}>
                              {opt}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input className="h-11 rounded-xl" placeholder="Full Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="h-11 rounded-xl"
                          type="email"
                          placeholder="Email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex gap-2">
                        <div className="flex h-11 shrink-0 items-center gap-1.5 rounded-xl border border-input px-3 text-sm text-muted-foreground">
                          <span aria-hidden>🇮🇳</span> +91
                        </div>
                        <FormControl>
                          <Input
                            className="h-11 flex-1 rounded-xl"
                            placeholder="Enter phone number"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          className="rounded-xl"
                          placeholder="Message (optional)"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="shine w-full rounded-full bg-[image:var(--gradient-primary)] text-white h-12 text-base hover:opacity-95 hover:-translate-y-0.5 transition-all"
                >
                  {form.formState.isSubmitting ? "Submitting..." : "Submit"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
