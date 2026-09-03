import About from "@/views/About";
import { PageHero } from "@/components/PageHero";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import { pageMetadata } from "@/lib/site";

const TITLE = "About";
const DESCRIPTION =
  "Balcony Originals is a production house rooted in Rayalaseema, built on one belief: culture, devotion, heritage, people and lived experience deserve to be documented — and brought to a wider audience.";

export const metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/about",
  image: "/assets/projects/about.jpg",
});

export default function AboutPage() {
  return (
    <div data-testid="about-page">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />

      <PageHero
        testid="about-hero"
        overline="About the house"
        titleLines={["A production house that begins", "with a place, but is not", "limited to it."]}
        sub="Balcony Originals is rooted in Rayalaseema and built on one belief: culture, devotion, heritage, people and lived experience deserve to be documented — and brought to a wider audience."
      />

      <About />
    </div>
  );
}
