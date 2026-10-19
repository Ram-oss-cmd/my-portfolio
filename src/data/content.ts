/**
 * All visitor-facing copy lives here.
 * Facts only — no invented metrics, clients, testimonials or certificates.
 */

export const site = {
  name: "Shreeram Chaudhary",
  nepaliName: "श्रीराम चौधरी",
  headline:
    "I build the software that runs hydropower plants, loan books and robot hoses.",
  description:
    "Shreeram Chaudhary builds software for hydropower plants, loan and audit systems, and IoT automation. Based in Nepal.",
  location: "Nepal",
  clockPlace: "Kathmandu, NP",
  coordinates: "27.7172° N, 85.3240° E",
  plantOutputMw: 0.99,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export type Stage = {
  id: string;
  index: string;
  label: string;
  note: string;
};

export const stages: Stage[] = [
  { id: "intake", index: "01", label: "Intake", note: "Water enters" },
  { id: "penstock", index: "02", label: "Penstock", note: "Pressure builds" },
  { id: "turbine", index: "03", label: "Turbine", note: "Work spins" },
  { id: "workbench", index: "04", label: "Workbench", note: "Next skills" },
  { id: "powerhouse", index: "05", label: "Powerhouse", note: "Equipment" },
  { id: "grid", index: "06", label: "Grid", note: "Power delivered" },
];

export const nav = [
  { href: "#penstock", label: "About" },
  { href: "#turbine", label: "Work" },
  { href: "#powerhouse", label: "Stack" },
  { href: "#grid", label: "Contact" },
];

export const about = {
  lead:
    "I'm Shreeram Chaudhary, from Nepal. I build software for hydropower plants, loan books and machines that have to behave in the real world.",
  paragraphs: [
    "At Selang SHP I built the hydropower management system for the plant. At Abhiyan Engineering Nepal I built the budget calculation system and the human resource management system. At Temke Investment I built the audit system and the entire loan-giving system, with interest calculation — when a customer comes to collect, the system works the numbers out.",
    "On the water cannon project I helped take a manual spray hose and make it automated: it copies a human operator's motion and replays it. That was team work, and I contributed.",
    "I work on Linux and write Windows software in VBA. Python, AI and robotics are what I'm learning now — no certificates, just the next stage.",
  ],
};

export type Skill = {
  code: string;
  name: string;
  status: "IN SERVICE";
  note: string;
};

export const skills: Skill[] = [
  {
    code: "SK-01",
    name: "Computer Programming",
    status: "IN SERVICE",
    note: "The common line through every system below.",
  },
  {
    code: "SK-02",
    name: "Web & Application Development",
    status: "IN SERVICE",
    note: "Plant, budget, HR, audit and loan systems.",
  },
  {
    code: "SK-03",
    name: "Internet of Things (IoT)",
    status: "IN SERVICE",
    note: "Record-and-replay automation for the water cannon.",
  },
  {
    code: "SK-04",
    name: "Automation & Deployment",
    status: "IN SERVICE",
    note: "Software that takes over repeated work.",
  },
  {
    code: "SK-05",
    name: "Windows software in VBA",
    status: "IN SERVICE",
    note: "Windows tooling where the job needs it.",
  },
  {
    code: "SK-06",
    name: "Linux",
    status: "IN SERVICE",
    note: "The environment I know well and use.",
  },
];

export type Station = {
  tag: string;
  title: string;
  subtitle?: string;
  capacity?: string;
  problem: string;
  built: string;
  skills: string[];
  team?: boolean;
  plate: "plant" | "systems" | "calculator" | "diagram";
};

export const stations: Station[] = [
  {
    tag: "SHP-01",
    title: "Selang Small Hydropower Project",
    subtitle: "Selang SHP",
    capacity: "0.990 MW",
    problem: "The plant needed software to manage its operation.",
    built: "I built the hydropower management system for the plant.",
    skills: ["Computer Programming", "Web & Application Development", "Automation & Deployment"],
    plate: "plant",
  },
  {
    tag: "ABH-02",
    title: "Abhiyan Engineering Nepal",
    problem: "Budget calculation and human resources needed dedicated systems.",
    built:
      "I built their budget calculation system and their human resource management system.",
    skills: ["Computer Programming", "Web & Application Development"],
    plate: "systems",
  },
  {
    tag: "TMK-03",
    title: "Temke Investment Pvt. Ltd.",
    subtitle: "Hong Kong",
    problem: "Loan collection needed the interest worked out at the counter.",
    built:
      "I built their audit system and their entire loan-giving system with interest calculation — when a customer comes to collect money, the system calculates everything.",
    skills: ["Computer Programming", "Web & Application Development"],
    plate: "calculator",
  },
  {
    tag: "IOT-04",
    title: "Hydropower automated water cannon",
    subtitle: "Team project",
    problem: "A manual water-spray hose had to be aimed by an operator.",
    built:
      "We turned a manual hose into an automated one that copies a human operator's motion and can replay it. I contributed; I did not build it alone.",
    skills: ["Internet of Things (IoT)", "Automation & Deployment", "Computer Programming"],
    team: true,
    plate: "diagram",
  },
];

export const smallerBuilds = [
  {
    code: "SB-01",
    title: "Windows software in VBA",
    status: "IN SERVICE",
    body: "Windows software built in VBA, where a spreadsheet and a desktop tool were the right shape for the job.",
    placeholder: false,
  },
  {
    code: "SB-02",
    title: "Open slot",
    status: "PLACEHOLDER",
    body: "Reserved for the next smaller build. Add it in src/data/content.ts.",
    placeholder: true,
  },
  {
    code: "SB-03",
    title: "Open slot",
    status: "PLACEHOLDER",
    body: "Reserved for the next smaller build. Add it in src/data/content.ts.",
    placeholder: true,
  },
];

export const learning = [
  {
    code: "LRN-01",
    name: "Python",
    status: "IN PROGRESS",
    note: "Learning — no shipped project claimed here.",
  },
  {
    code: "LRN-02",
    name: "AI",
    status: "IN PROGRESS",
    note: "Learning — no certificates claimed here.",
  },
  {
    code: "LRN-03",
    name: "Robotics",
    status: "IN PROGRESS",
    note: "Learning. The closest shipped idea so far is the IOT-04 record-and-replay water cannon.",
  },
];

export type StackItem = {
  code: string;
  name: string;
  usedFor: string;
};

export const stack: StackItem[] = [
  {
    code: "PWR-01",
    name: "Computer Programming",
    usedFor:
      "The common line through the plant management, budget, HR, audit, loan and water cannon builds.",
  },
  {
    code: "PWR-02",
    name: "Web & Application Development",
    usedFor:
      "The application logic and interfaces behind the hydropower, budget, HR, audit and loan systems.",
  },
  {
    code: "PWR-03",
    name: "Internet of Things (IoT)",
    usedFor:
      "The water cannon: motion captured from a human operator, stored, then replayed by the machine.",
  },
  {
    code: "PWR-04",
    name: "Automation & Deployment",
    usedFor:
      "Taking repeated plant and business work and putting it in software that runs it.",
  },
  {
    code: "PWR-05",
    name: "Windows software in VBA",
    usedFor: "Windows software built in VBA.",
  },
  {
    code: "PWR-06",
    name: "Linux",
    usedFor: "The environment I know well and use.",
  },
];

export const terminalIntro = "shreeram@selang:~$ session --start";

export const terminalCommands: Record<string, string[]> = {
  help: [
    "help      this list",
    "whoami    short version of me",
    "projects  the four stations",
    "learning  what is in progress",
    "vba       re-skin this terminal",
    "contact   route to the grid",
    "clear     clear the output",
    "",
    "keys      R / P anywhere for the nozzle, / for this prompt",
  ],
  whoami: [
    "Shreeram Chaudhary — Nepal",
    site.headline,
    "Linux: in service. Python / AI / robotics: in progress.",
  ],
  projects: [
    "SHP-01  Selang SHP ......... hydropower management system",
    "ABH-02  Abhiyan Engineering . budget + human resource systems",
    "TMK-03  Temke Investment ... audit + loan system with interest",
    "IOT-04  Water cannon ....... team project, record and replay",
  ],
  learning: [
    "Python    ....... IN PROGRESS",
    "AI        ....... IN PROGRESS",
    "Robotics  ....... IN PROGRESS — see IOT-04 record-and-replay",
  ],
  vba: [
    "Re-skinning to the VBA Immediate Window.",
    "Windows software in VBA is in service. Type vba again to return.",
  ],
  contact: ["Routing to the grid ..."],
  clear: [],
};

export const loanSample = {
  principal: 250000,
  annualRatePercent: 12.5,
  months: 24,
  method: "reducing" as const,
};

export const contact = {
  // Placeholder identity details. Replace these in one place before launch.
  email: "hello@example.com",
  emailIsPlaceholder: true,
  linkedinUrl: "",
  cvUrl: "",
  blurb:
    "Tell me what you're building, what has to be true when it ships, and when. Email works.",
};
