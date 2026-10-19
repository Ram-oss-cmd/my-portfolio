import { About } from "@/components/About";
import { ContactSection } from "@/components/ContactSection";
import { Hero } from "@/components/Hero";
import { Nozzle } from "@/components/Nozzle";
import { SiteFooter } from "@/components/SiteFooter";
import { Stack } from "@/components/Stack";
import { Work } from "@/components/Work";
import { site, stackGroups } from "@/data/content";

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
  knowsAbout: stackGroups.flatMap((group) => group.items),
};

const jsonLd = JSON.stringify(person).replace(/</g, "\\u003c");

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />
      <Nozzle />
      <main id="main">
        <Hero />
        <About />
        <Work />
        <Stack />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
