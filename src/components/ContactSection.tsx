import { ContactForm } from "@/components/ContactForm";
import { CopyEmail } from "@/components/CopyEmail";
import { KathmanduClock } from "@/components/KathmanduClock";
import { contact } from "@/data/content";

export function ContactSection() {
  return (
    <section id="contact" className="contact section">
      <div className="shell contact__grid">
        <div className="contact__statement" data-reveal suppressHydrationWarning>
          <p className="eyebrow eyebrow--light">Contact</p>
          <h2>Have something worth building?</h2>
          <p className="contact__blurb">{contact.blurb}</p>

          <a className="contact__email" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>

          <div className="contact__actions">
            <CopyEmail />
            <KathmanduClock />
          </div>
        </div>

        <div className="contact__form" data-reveal suppressHydrationWarning>
          <h3>Send a message</h3>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
