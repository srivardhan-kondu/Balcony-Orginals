import SubmitStory from "@/views/SubmitStory";
import { PageHero } from "@/components/PageHero";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";
import { pageMetadata } from "@/lib/site";

const TITLE = "Submit Your Story";
const DESCRIPTION =
  "Every story is a gem. If you carry a story, an idea or a lived experience that deserves a bigger canvas but need the backbone to bring it to life, tell Balcony Originals about it.";

export const metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: "/submit-story",
  image: "/assets/projects/gems.jpg",
});

export default function SubmitStoryPage() {
  return (
    <div data-testid="submit-story-page">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: TITLE, path: "/submit-story" },
        ])}
      />

      <PageHero
        testid="submit-hero"
        overline="Stories are gems"
        titleLines={["Your story", "might be a gem."]}
        sub="Have a story, idea or lived experience that deserves a bigger canvas? If you have the story but need the backbone to bring it to life, tell us in a few lines."
      />

      <SubmitStory />
    </div>
  );
}
