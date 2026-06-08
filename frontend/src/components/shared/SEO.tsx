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
  description = "CoderArena is a premium platform for competitive programming, playlist curated challenges, and real-time multiplayer coding battles.",
  keywords = ["competitive programming", "coding battle", "leetcode", "codeforces", "learn to code", "interview prep"],
  ogTitle,
  ogDescription,
  ogImage = "/logo.svg",
  ogType = "website",
  ogUrl = typeof window !== "undefined" ? window.location.href : "",
  twitterCard = "summary_large_image",
  canonicalUrl = typeof window !== "undefined" ? window.location.href : "",
}) => {
  const fullTitle = "CoderArena";
  const finalOgTitle = ogTitle || fullTitle;
  const finalOgDescription = ogDescription || description;

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
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={finalOgTitle} />
      <meta name="twitter:description" content={finalOgDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Canonical Link */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </Helmet>
  );
};

export default SEO;

