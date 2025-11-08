"use client"
import HeroSection from "@/components/HeroSection";
import RentSection from "@/components/RentSection";
import WhySkyRealty from "@/components/WhySkyRealty";
import CommunicationSection from "@/components/CommunicationSection";
import ManageSection from "@/components/ManageSection";
import CTASection from "@/components/CTASection";
import FAQ from "@/sections/FAQ";
import Footer from "@/components/Footer";
import PainPointsPage from "@/components/PainPoints";
import SolutionsPage from "@/components/Solutions";
import ComparisonPage from "@/components/Comparisons";
import TestimonialCards from "@/components/TestimonialCards";


export default function HomePage() {
  return (
    <main className="overflow-x-hidden mt-20 bg-gray-100">
      {/* Hero Section */}
      <HeroSection />

      <PainPointsPage />

      <SolutionsPage />

       {/* Rent Management Section */}
      <RentSection />

      {/* Communication Section */}
      <CommunicationSection />

      <ComparisonPage />

      {/* 3 Points Section */}
      <WhySkyRealty />

      <TestimonialCards />

      {/* FAQ Section */}
      <FAQ />

      {/* CTA Section */}
      <CTASection />

      <Footer />
    </main>
  );
}