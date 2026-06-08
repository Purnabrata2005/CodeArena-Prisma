
import { HeroSection } from '@/components/hero-section-1';
import CodeArenaFeatures from '@/components/landing/CodeArenaFeatures';
import SEO from "@/components/shared/SEO";

const Home = () => {
  return (
    <>
      <SEO 
        title="Competitive Programming Platform" 
        description="Welcome to CodeArena, the ultimate competitive programming arena. Solve coding problems, track streaks, and master algorithms with our modern developer workspace."
        keywords="coding arena, competitive programming, solve algorithms, code challenges, developer tools"
      />
      <HeroSection/>
      <CodeArenaFeatures/>
    </>
  )
}

export default Home
