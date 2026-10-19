import { GridContact } from "@/components/GridContact";
import { IntakeHero } from "@/components/IntakeHero";
import { Nozzle } from "@/components/Nozzle";
import { Penstock } from "@/components/Penstock";
import { Powerhouse } from "@/components/Powerhouse";
import { Preloader } from "@/components/Preloader";
import { RiverRail } from "@/components/RiverRail";
import { Turbine } from "@/components/Turbine";
import { Workbench } from "@/components/Workbench";
import { site, skills } from "@/data/content";

const person = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  alternateName: site.nepaliName,
  url: site.url,
  description: site.description,
  jobTitle: "Software developer",
  address: {
    "@type": "PostalAddress",
    addressCountry: "NP",
  },
  knowsAbout: skills.map((skill) => skill.name),
};

const jsonLd = JSON.stringify(person).replace(/</g, "\\u003c");

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <Preloader />
      <Nozzle />
      <RiverRail />
      <main id="main">
        <IntakeHero />
        <Penstock />
        <Turbine />
        <Workbench />
        <Powerhouse />
        <GridContact />
      </main>
    </>
  );
}
