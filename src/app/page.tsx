import { About } from "@/components/About";
import { ContactSection } from "@/components/ContactSection";
import { Hero } from "@/components/Hero";
import { Nozzle } from "@/components/Nozzle";
import { SiteFooter } from "@/components/SiteFooter";
import { Work } from "@/components/Work";
import { site } from "@/data/content";

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
  knowsAbout: [
    "Hydropower plant management",
    "Inventory management",
    "Budget and human resource systems",
    "Audit and loan systems",
    "Web application development",
    "IoT automation",
    "Linux",
  ],
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
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  );
}
