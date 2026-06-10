
import { HeroSection } from '@/components/hero-section-1';
import CoderArenaFeatures from '@/components/landing/CoderArenaFeatures';
import SEO from '@/components/shared/SEO';

const Home = () => {
  return (
    <>
      <SEO 
        keywords={["competitive programming", "coding battles", "multiplayer coding", "learn algorithms", "data structures", "interview prep", "CoderArena", "coder arena", "coders arena", "codr arena", "code arena"]}
      />
      <HeroSection/>
      <CoderArenaFeatures/>
    </>
  )
}

export default Home
