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
    "I've built the records, schedules and controls that keep a plant, an office or a machine running.",
  description:
    "Shreeram Chaudhary has built software for hydropower plants, loan and audit systems, web applications and IoT automation. Based in Nepal.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
};

export const nav = [
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
];

export const about = {
  lead:
    "I've built software for systems that have to hold up in daily use — plants, loan books, audits, budgets and people records.",
  paragraphs: [
    "At Selang Small Hydropower Project I've built the hydropower management system and the plant's entire inventory management system. It runs on real plant data and is in use at the hydropower today. At Abhiyan Engineering Nepal I've built the budget logging and management system and the human resource management system.",
    "At Temke Investment Pvt. Ltd. in Hong Kong I've built the audit system and the entire loan-giving system, with interest calculation.",
    "On the water cannon project, our team turned a manually operated water cannon into an automated water cannon that copies a human operator's motion and replays it. I contributed to both the hardware and the software, mainly the hardware.",
  ],
  quote:
    "The software should make the plant, the ledger or the machine easier to run than the paper process it replaced.",
};

export const learning = ["Python", "AI", "Robotics"];

export const contact = {
  email: "rc.cloop@gmail.com",
  blurb:
    "If you are building something in hydropower, finance or automation, send me a note. I read everything.",
};
