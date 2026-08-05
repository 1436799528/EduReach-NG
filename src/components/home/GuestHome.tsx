import HeroSection from "@/components/landing/HeroSection";
import BrowseFaculties from "@/components/landing/BrowseFaculties";
import BrowseUniversities from "@/components/landing/BrowseUniversities";
import RecentPapers from "@/components/landing/RecentPapers";
import WhySection from "@/components/landing/WhySection";
import PlatformStats from "@/components/landing/PlatformStats";
import CTASection from "@/components/landing/CTASection";

export default function GuestHome() {
  return (
    <>
      <HeroSection />
      <BrowseFaculties />
      <BrowseUniversities />
      <RecentPapers />
      <WhySection />
      <PlatformStats />
      <CTASection />
    </>
  );
}
