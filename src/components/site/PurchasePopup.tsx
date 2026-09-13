import { useEffect, useState } from "react";
import { GraduationCap, X } from "lucide-react";

const COURSES = [
  "Advanced Excel Mastery",
  "MS Excel Essentials",
  "Word & PPT Essentials",
  "Advanced Word & PPT Mastery",
];

const RAW_PURCHASES = [
  { name: "Aarav Srivastava", location: "Uttar Pradesh" },
  { name: "Nidhi Tripathi", location: "Uttar Pradesh" },
  { name: "Vikas Yadav", location: "Uttar Pradesh" },
  { name: "Shalini Dubey", location: "Uttar Pradesh" },
  { name: "Manoj Pandey", location: "Uttar Pradesh" },
  { name: "Preeti Chaurasia", location: "Uttar Pradesh" },
  { name: "Ashutosh Mishra", location: "Uttar Pradesh" },
  { name: "Sanket Deshmukh", location: "Maharashtra" },
  { name: "Mrunal Kulkarni", location: "Maharashtra" },
  { name: "Omkar Jadhav", location: "Maharashtra" },
  { name: "Snehal Bhosale", location: "Maharashtra" },
  { name: "Pranav Gaikwad", location: "Maharashtra" },
  { name: "Rutuja Pawar", location: "Maharashtra" },
  { name: "Nikhil Sawant", location: "Maharashtra" },
  { name: "Karthik Subramanian", location: "Tamil Nadu" },
  { name: "Divya Ramanathan", location: "Tamil Nadu" },
  { name: "Sathish Kumar", location: "Tamil Nadu" },
  { name: "Meenakshi Iyer", location: "Tamil Nadu" },
  { name: "Prakash Nadar", location: "Tamil Nadu" },
  { name: "Lakshmi Venkatesan", location: "Tamil Nadu" },
  { name: "Suhas Gowda", location: "Karnataka" },
  { name: "Bhavana Shetty", location: "Karnataka" },
  { name: "Manjunath Hegde", location: "Karnataka" },
  { name: "Chaitra Rao", location: "Karnataka" },
  { name: "Girish Kamath", location: "Karnataka" },
  { name: "Sushma Bhat", location: "Karnataka" },
  { name: "Naveen Reddy", location: "Karnataka" },
  { name: "Sourav Chatterjee", location: "West Bengal" },
  { name: "Ananya Banerjee", location: "West Bengal" },
  { name: "Debashish Ghosh", location: "West Bengal" },
  { name: "Rituparna Das", location: "West Bengal" },
  { name: "Subhajit Mukherjee", location: "West Bengal" },
  { name: "Moumita Sen", location: "West Bengal" },
  { name: "Arindam Roy", location: "West Bengal" },
  { name: "Jignesh Patel", location: "Gujarat" },
  { name: "Hetal Shah", location: "Gujarat" },
  { name: "Bhavesh Desai", location: "Gujarat" },
  { name: "Krupa Mehta", location: "Gujarat" },
  { name: "Chirag Trivedi", location: "Gujarat" },
  { name: "Falguni Joshi", location: "Gujarat" },
  { name: "Nirav Parikh", location: "Gujarat" },
  { name: "Bhupendra Rathore", location: "Rajasthan" },
  { name: "Sunita Choudhary", location: "Rajasthan" },
  { name: "Mahendra Shekhawat", location: "Rajasthan" },
  { name: "Poonam Jangid", location: "Rajasthan" },
  { name: "Devendra Bhati", location: "Rajasthan" },
  { name: "Anjali Purohit", location: "Rajasthan" },
  { name: "Harpreet Singh", location: "Punjab" },
  { name: "Simran Kaur", location: "Punjab" },
  { name: "Jaspreet Gill", location: "Punjab" },
  { name: "Navjot Dhillon", location: "Punjab" },
  { name: "Gurmeet Sandhu", location: "Punjab" },
  { name: "Manpreet Bajwa", location: "Punjab" },
  { name: "Anoop Menon", location: "Kerala" },
  { name: "Reshma Nair", location: "Kerala" },
  { name: "Vinod Pillai", location: "Kerala" },
  { name: "Aiswarya Varma", location: "Kerala" },
  { name: "Jithin Thomas", location: "Kerala" },
  { name: "Sneha Kurian", location: "Kerala" },
  { name: "Srikanth Rao", location: "Telangana" },
  { name: "Swathi Goud", location: "Telangana" },
  { name: "Ravi Teja Reddy", location: "Telangana" },
  { name: "Deepika Yadav", location: "Telangana" },
  { name: "Kiran Kumar Vemula", location: "Telangana" },
  { name: "Venkatesh Naidu", location: "Andhra Pradesh" },
  { name: "Padmavathi Chowdary", location: "Andhra Pradesh" },
  { name: "Sai Krishna Varma", location: "Andhra Pradesh" },
  { name: "Anusha Prasad", location: "Andhra Pradesh" },
  { name: "Bhaskar Rao", location: "Andhra Pradesh" },
  { name: "Amit Ranjan", location: "Bihar" },
  { name: "Sushmita Kumari", location: "Bihar" },
  { name: "Ranjeet Jha", location: "Bihar" },
  { name: "Neha Sinha", location: "Bihar" },
  { name: "Chandan Prasad", location: "Bihar" },
  { name: "Yogesh Chouhan", location: "Madhya Pradesh" },
  { name: "Ritu Malviya", location: "Madhya Pradesh" },
  { name: "Sandeep Rajput", location: "Madhya Pradesh" },
  { name: "Shweta Namdeo", location: "Madhya Pradesh" },
  { name: "Bibhu Prasad Sahu", location: "Odisha" },
  { name: "Sasmita Mohanty", location: "Odisha" },
  { name: "Alok Behera", location: "Odisha" },
  { name: "Priyadarshini Nayak", location: "Odisha" },
  { name: "Sumit Dahiya", location: "Haryana" },
  { name: "Pooja Malik", location: "Haryana" },
  { name: "Vikrant Hooda", location: "Haryana" },
  { name: "Ritika Ahlawat", location: "Haryana" },
  { name: "Pranjal Bora", location: "Assam" },
  { name: "Rimpi Saikia", location: "Assam" },
  { name: "Dhrubajyoti Das", location: "Assam" },
  { name: "Tarun Khurana", location: "Delhi" },
  { name: "Ishita Bhardwaj", location: "Delhi" },
  { name: "Mohit Chadha", location: "Delhi" },
  { name: "Sanjay Oraon", location: "Jharkhand" },
  { name: "Kumari Rashmi", location: "Jharkhand" },
  { name: "Dinesh Sahu", location: "Chhattisgarh" },
  { name: "Bhumika Verma", location: "Chhattisgarh" },
  { name: "Mahesh Negi", location: "Uttarakhand" },
  { name: "Deepa Rawat", location: "Uttarakhand" },
  { name: "Ankush Thakur", location: "Himachal Pradesh" },
  { name: "Rohan Fernandes", location: "Goa" },
];

const SAMPLE_PURCHASES = RAW_PURCHASES.map((p, i) => ({
  name: p.name,
  location: p.location,
  course: COURSES[i % COURSES.length],
  minutesAgo: (i % 12) + 2,
}));

const SHOW_DURATION_MS = 5500;
const GAP_DURATION_MS = 7000;

export function PurchasePopup() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * SAMPLE_PURCHASES.length));
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
