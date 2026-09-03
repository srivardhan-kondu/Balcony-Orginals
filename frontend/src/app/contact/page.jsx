import Contact from "@/views/Contact";
import { PageHero } from "@/components/PageHero";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import { pageMetadata } from "@/lib/site";

const TITLE = "Contact";
const DESCRIPTION =
  "Collaborations, partnerships, press, or a story that won't leave you alone — reach the Balcony Originals production desk.";

export const metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div data-testid="contact-page">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />

      <PageHero
        testid="contact-hero"
        overline="Contact"
        titleLines={["Let's talk."]}
        sub="Collaborations, partnerships, press, or a story that won't leave you alone — this is the door."
      />

      <Contact />
    </div>
  );
}
