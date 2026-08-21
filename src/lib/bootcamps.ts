import {
  Users2,
  Target,
  Briefcase,
  ShieldCheck,
  FileCheck,
  MessageSquare,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import type { BootcampRoadmapStep } from "@/components/site/BootcampLandingPage";

export type Bootcamp = {
  slug: string;
  title: string;
  tagline: string;
  icon: LucideIcon;
  eyebrow: string;
  description: string;
  highlights: string[];
  roadmap: BootcampRoadmapStep[];
  formHeading: string;
  formSubheading: string;
};

export const bootcamps: Bootcamp[] = [
  {
    slug: "scrum-master",
    title: "Scrum Master BootCamp",
    tagline: "Master facilitation, servant-leadership, and Scrum theory through hands-on training.",
    icon: Users2,
    eyebrow: "BootCamps · Agile",
    description:
      "A hands-on training and interview-prep track for Scrum Masters — covering facilitation scenarios, conflict resolution, servant-leadership questions, and how to talk through real sprint incidents with confidence.",
    highlights: [
      "50+ real Scrum Master interview questions with model answers",
      "Mock interviews with feedback on tone, structure, and STAR framing",
      "Scenario drills: blocked sprints, stakeholder conflict, underperforming teams",
      "Resume review tailored to Agile/Scrum roles",
    ],
    roadmap: [
      {
        icon: FileCheck,
        title: "Resume & profile review",
        desc: "Position your Agile experience the way hiring panels look for it.",
      },
      {
        icon: Target,
        title: "Scrum theory deep-dive",
        desc: "Nail the theory questions on events, artifacts, and the Scrum Guide.",
      },
      {
        icon: MessageSquare,
        title: "Scenario-based mock practice",
        desc: "Practice facilitation and conflict scenarios with expert feedback.",
      },
      {
        icon: Users2,
        title: "1:1 mentorship",
        desc: "Ongoing guidance from practicing Scrum Masters and coaches.",
      },
    ],
    formHeading: "Get a free Scrum Master BootCamp session",
    formSubheading: "Tell us your target companies and we'll tailor your prep plan.",
  },
  {
    slug: "product-owner",
    title: "Product Owner BootCamp",
    tagline: "Practice backlog prioritization, stakeholder, and product-sense questions.",
    icon: ClipboardList,
    eyebrow: "BootCamps · Product",
    description:
      "Hands-on training and interview prep for Product Owners — covering backlog prioritization frameworks, stakeholder management scenarios, and the product-sense questions interviewers use to test judgment.",
    highlights: [
      "Backlog prioritization and roadmap case studies",
      "Stakeholder-conflict and trade-off scenario practice",
      "Mock interviews covering product-sense and metrics questions",
      "Portfolio and resume review for Product Owner roles",
    ],
    roadmap: [
      {
        icon: FileCheck,
        title: "Resume & portfolio review",
        desc: "Frame your product decisions in outcome-driven language.",
      },
      {
        icon: Target,
        title: "Prioritization frameworks",
        desc: "Practice RICE, MoSCoW, and trade-off reasoning out loud.",
      },
      {
        icon: MessageSquare,
        title: "Stakeholder scenario drills",
        desc: "Handle conflicting priorities and difficult conversations.",
      },
      {
        icon: Users2,
        title: "1:1 mentorship",
        desc: "Feedback from practicing Product Owners and coaches.",
      },
    ],
    formHeading: "Get a free Product Owner BootCamp session",
    formSubheading: "Tell us your target companies and we'll tailor your prep plan.",
  },
  {
    slug: "project-manager",
    title: "Project Manager BootCamp",
    tagline: "Sharpen risk, scheduling, and cross-team leadership through hands-on training.",
    icon: Briefcase,
    eyebrow: "BootCamps · Project Management",
    description:
      "Hands-on training and interview prep for Project Manager roles — covering risk management, scheduling trade-offs, budget conversations, and leading cross-functional teams under pressure.",
    highlights: [
      "Risk, budget, and scheduling scenario walkthroughs",
      "Cross-team leadership and escalation-handling practice",
      "Mock interviews mapped to PMP/PRINCE2-style competencies",
      "Resume review tailored to Project Management roles",
    ],
    roadmap: [
      {
        icon: FileCheck,
        title: "Resume & profile review",
        desc: "Highlight delivery outcomes recruiters screen for first.",
      },
      {
        icon: Target,
        title: "Risk & scheduling practice",
        desc: "Talk through trade-offs, dependencies, and slipping timelines.",
      },
      {
        icon: MessageSquare,
        title: "Leadership scenario drills",
        desc: "Practice escalation, delegation, and stakeholder updates.",
      },
      {
        icon: Users2,
        title: "1:1 mentorship",
        desc: "Guidance from practicing Project Managers who've hired before.",
      },
    ],
    formHeading: "Get a free Project Manager BootCamp session",
    formSubheading: "Tell us your target companies and we'll tailor your prep plan.",
  },
  {
    slug: "cybersecurity",
    title: "Cybersecurity BootCamp",
    tagline: "Crack technical, scenario, and compliance rounds with confidence.",
    icon: ShieldCheck,
    eyebrow: "BootCamps · Cybersecurity",
    description:
      "Hands-on training and interview prep for cybersecurity roles — covering technical screens, incident-response scenarios, and compliance/governance questions, built around what hiring panels actually ask.",
    highlights: [
      "Technical drills: networking, threat modeling, and common CVE scenarios",
      "Incident-response tabletop practice with expert feedback",
      "Compliance and governance question walkthroughs",
      "Resume review tailored to security roles and certifications",
    ],
    roadmap: [
      {
        icon: FileCheck,
        title: "Resume & certification review",
        desc: "Position your certifications and hands-on projects clearly.",
      },
      {
        icon: Target,
        title: "Technical screen practice",
        desc: "Networking, threat modeling, and vulnerability scenarios.",
      },
      {
        icon: MessageSquare,
        title: "Incident-response drills",
        desc: "Walk through breach scenarios the way panels expect.",
      },
      {
        icon: Users2,
        title: "1:1 mentorship",
        desc: "Guidance from practicing security professionals.",
      },
    ],
    formHeading: "Get a free Cybersecurity BootCamp session",
    formSubheading: "Tell us your target companies and we'll tailor your prep plan.",
  },
];

export function getBootcamp(slug: string): Bootcamp | undefined {
  return bootcamps.find((b) => b.slug === slug);
}
