"use client"
import HeroSection from "@/components/HeroSection";
import RentSection from "@/components/RentSection";
import WhySkyRealty from "@/components/WhySkyRealty";
import CommunicationSection from "@/components/CommunicationSection";
import CTASection from "@/components/CTASection";
import FAQ from "@/sections/FAQ";
import Footer from "@/components/Footer";
import PainPointsPage from "@/components/PainPoints";
import SolutionsPage from "@/components/Solutions";
import TestimonialCards from "@/components/TestimonialCards";
import FreeTrialSection from "@/components/FreeTrial";


export default function HomePage() {
  return (
    <main className="overflow-x-hidden min-h-screen p-0 m-0">
      <HeroSection />
      <WhySkyRealty />
      <CTASection />
      <RentSection />
      <FreeTrialSection />
      <TestimonialCards />
      <CommunicationSection />
      <PainPointsPage />
      <Footer />
    </main>
  );
}