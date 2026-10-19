/**
 * All visitor-facing copy lives here.
 * Facts only — no invented metrics, clients, testimonials or certificates.
 */

export const site = {
  name: "Shreeram Chaudhary",
  nepaliName: "श्रीराम चौधरी",
  headline: {
    lead: "Software for systems that ",
    emphasis: "can't afford",
    tail: " to be sloppy.",
  },
  intro:
    "I'm Shreeram Chaudhary, a software developer from Nepal. I build hydropower plant management, loan and audit systems, web applications and IoT automation.",
  description:
    "Shreeram Chaudhary builds software for hydropower plants, loan and audit systems, web applications and IoT automation. Based in Nepal.",
  location: "Nepal",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const nav = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#stack", label: "Stack" },
  { href: "#contact", label: "Contact" },
];

export const about = {
  lead:
    "I build software for systems that have to hold up in daily use — plants, loan books, audits, budgets and people records.",
  paragraphs: [
    "At Selang Small Hydropower Project I built the hydropower management system for the plant. At Abhiyan Engineering Nepal I built the budget calculation system and the human resource management system. At Temke Investment Pvt. Ltd. in Hong Kong I built the audit system and the entire loan-giving system, with interest calculation.",
    "On the water cannon project, our team turned a manual spray hose into an automated one that copies a human operator's motion and replays it. I contributed on the software side; I did not build it alone.",
    "I use Linux daily and write Windows software in VBA. Python, AI and robotics are what I'm learning next — no certificates, just the work ahead.",
  ],
  quote:
    "The software should make the plant, the ledger or the machine easier to run than the paper it replaced.",
};

export type StackGroup = {
  title: string;
  items: string[];
};

export const stackGroups: StackGroup[] = [
  {
    title: "Building software",
    items: [
      "Computer programming",
      "Web & application development",
      "Automation & deployment",
    ],
  },
  {
    title: "Industrial & business systems",
    items: [
      "Hydropower plant management",
      "Loan & interest systems",
      "Audit systems",
      "Budget & HR systems",
    ],
  },
  {
    title: "Automation & IoT",
    items: [
      "Internet of Things (IoT)",
      "Record-and-replay automation",
      "Water cannon — team project",
    ],
  },
  {
    title: "Platforms",
    items: ["Linux — daily use", "Windows software — VBA"],
  },
];

export const learning = ["Python", "AI", "Robotics"];

export const loanSample = {
  principal: 250000,
  annualRatePercent: 12.5,
  months: 24,
  method: "reducing" as const,
};

export const contact = {
  email: "rc.cloop@gmail.com",
  blurb:
    "If you are building something in hydropower, finance or automation, send me a note. I read everything.",
};
