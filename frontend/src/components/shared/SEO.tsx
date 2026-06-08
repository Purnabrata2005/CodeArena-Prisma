interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
}

export default function SEO({ title, description, keywords, image, url }: SEOProps) {
  const defaultTitle = "CodeArena - Competitive Programming & Coding Challenges";
  const defaultDesc = "Solve coding problems, compete in real-time leaderboards, track your programming streaks, and master algorithms with CodeArena.";
  const defaultImage = "/dark-demo.webp";
  
  // Safe fallbacks for client-side environments
  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "https://coderarena.tech");
  const currentTitle = title ? `${title} | CodeArena` : defaultTitle;
  const currentDesc = description || defaultDesc;
  const currentImage = image || defaultImage;

  return (
    <>
      <title>{currentTitle}</title>
      <meta name="description" content={currentDesc} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={currentTitle} />
      <meta property="og:description" content={currentDesc} />
      <meta property="og:image" content={currentImage} />
      <meta property="og:url" content={currentUrl} />

      {/* Twitter */}
      <meta name="twitter:title" content={currentTitle} />
      <meta name="twitter:description" content={currentDesc} />
      <meta name="twitter:image" content={currentImage} />
    </>
  );
}
