import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { submitLead, type LeadSource } from "@/lib/api";

const schema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function LeadForm({
  source,
  courseTitle,
  showCompany = false,
  showMessage = true,
  submitLabel = "Submit",
  className,
}: {
  source: LeadSource;
  courseTitle?: string;
  showCompany?: boolean;
  showMessage?: boolean;
  submitLabel?: string;
  className?: string;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", company: "", message: "" },
  });

  async function onSubmit(values: Values) {
    try {
      await submitLead({ ...values, source, courseTitle });
      toast.success("Thanks! Our team will reach out shortly.");
      form.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className ?? "space-y-4"}>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
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
                  <Input type="email" placeholder="Email address" {...field} />
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
                <FormControl>
                  <Input placeholder="Phone (optional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {showCompany && (
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input placeholder="Company" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>
        {showMessage && (
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea placeholder="How can we help?" rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button
          type="submit"
          disabled={form.formState.isSubmitting}
          className="shine w-full sm:w-auto rounded-full bg-[image:var(--gradient-primary)] text-white hover:-translate-y-0.5 transition-transform"
        >
          {form.formState.isSubmitting ? "Submitting..." : submitLabel}
        </Button>
      </form>
    </Form>
  );
}
