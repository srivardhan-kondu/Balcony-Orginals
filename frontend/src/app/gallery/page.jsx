import Gallery from "@/views/Gallery";
import { PageHero } from "@/components/PageHero";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import { pageMetadata } from "@/lib/site";

const TITLE = "Gallery";
const DESCRIPTION =
  "Stills from our shoots, behind-the-scenes moments and the journey of Balcony Originals — the work, the making, the road so far.";

export const metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/gallery",
});

export default function GalleryPage() {
  return (
    <div data-testid="gallery-page">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Gallery", path: "/gallery" },
        ])}
      />

      <PageHero
        testid="gallery-hero"
        overline="Gallery"
        titleLines={["Our work,", "our making, our journey."]}
        sub="A running record of the shoots, the sets and the road behind Balcony Originals — added as we go."
      />

      <Gallery />
    </div>
  );
}
