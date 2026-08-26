import { useEffect, useState } from "react";
import { GraduationCap, X } from "lucide-react";

const SAMPLE_PURCHASES = [
  { name: "Rahul", location: "Delhi", course: "Advanced Excel Mastery", minutesAgo: 3 },
  { name: "Priya", location: "Mumbai", course: "Word & PPT Essentials", minutesAgo: 7 },
  { name: "Aman", location: "Bengaluru", course: "MS Excel Essentials", minutesAgo: 12 },
  { name: "Sneha", location: "Pune", course: "Advanced Word & PPT Mastery", minutesAgo: 5 },
  { name: "Vikram", location: "Hyderabad", course: "Advanced Excel Mastery", minutesAgo: 9 },
  { name: "Ananya", location: "Chennai", course: "MS Excel Essentials", minutesAgo: 2 },
];

const SHOW_DURATION_MS = 5500;
const GAP_DURATION_MS = 7000;

export function PurchasePopup() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;

    function cycle() {
      setVisible(true);
      hideTimer = setTimeout(() => {
        setVisible(false);
        showTimer = setTimeout(() => {
          setIndex((i) => (i + 1) % SAMPLE_PURCHASES.length);
          cycle();
        }, GAP_DURATION_MS);
      }, SHOW_DURATION_MS);
    }

    const initialDelay = setTimeout(cycle, 4000);

    return () => {
      clearTimeout(initialDelay);
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (dismissed) return null;

  const purchase = SAMPLE_PURCHASES[index];

  return (
    <div
      className={`fixed bottom-6 left-6 z-40 max-w-xs transition-all duration-500 ${
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 rounded-2xl bg-white border border-border shadow-2xl p-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-foreground leading-snug">
            <b>{purchase.name}</b> from {purchase.location} just enrolled in{" "}
            <b>{purchase.course}</b>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{purchase.minutesAgo} minutes ago</p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
