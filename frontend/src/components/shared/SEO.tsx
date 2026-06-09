import React from "react";
import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  twitterCard?: string;
  canonicalUrl?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = "CoderArena is a premium platform for competitive programming, playlist curated challenges, and real-time multiplayer coding battles.",
  keywords = ["competitive programming", "coding battle", "leetcode", "codeforces", "learn to code", "interview prep"],
  ogTitle,
  ogDescription,
  ogImage = "/icon.png",
  ogType = "website",
  ogUrl = typeof window !== "undefined" ? window.location.href : "",
  twitterCard = "summary_large_image",
  canonicalUrl = typeof window !== "undefined" ? window.location.href : "",
}) => {
  const fullTitle = title ? `${title} | CoderArena` : "CoderArena";
  const finalOgTitle = ogTitle || fullTitle;
  const finalOgDescription = ogDescription || description;

  // Social media crawlers need absolute URLs for og:image
  const absoluteOgImage = ogImage.startsWith("http")
    ? ogImage
    : `https://coderarena.tech${ogImage.startsWith("/") ? "" : "/"}${ogImage}`;

  return (
    <Helmet>
      {/* Title Tag */}
      <title>{fullTitle}</title>

      {/* Meta Tags */}
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(", ")} />
      )}

      {/* Open Graph (Facebook/LinkedIn) */}
      <meta property="og:site_name" content="CoderArena" />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:image" content={absoluteOgImage} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={finalOgTitle} />
      <meta name="twitter:description" content={finalOgDescription} />
      <meta name="twitter:image" content={absoluteOgImage} />

      {/* Canonical Link */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* WebSite Structured Data for Google Search Site Name */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "CoderArena",
          "alternateName": ["coderarena.tech"],
          "url": "https://coderarena.tech"
        })}
      </script>
    </Helmet>
  );
};

export default SEO;

