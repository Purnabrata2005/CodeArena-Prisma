import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
}

const SEO = ({
  title = "CoderArena",
  description = "CoderArena is a premium platform for competitive programming, curated challenges, and real-time coding battles.",
  keywords = ["competitive programming", "coding battle", "leetcode", "codeforces", "learn to code", "interview prep"],
  image = "/icon.png",
  url = typeof window !== "undefined" ? window.location.href : "https://coderarena.tech",
}: SEOProps) => {
  // Social media crawlers need absolute URLs for og:image
  const absoluteOgImage = image.startsWith("http")
    ? image
    : `https://coderarena.tech${image.startsWith("/") ? "" : "/"}${image}`;

  return (
    <Helmet>
      {/* Title Tag */}
      <title>{title}</title>

      {/* Basic SEO */}
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}
      <link rel="canonical" href={url} />

      {/* Open Graph (Facebook/LinkedIn) */}
      <meta property="og:site_name" content="CoderArena" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={absoluteOgImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteOgImage} />
    </Helmet>
  );
};

export default SEO;