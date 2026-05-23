"use client";

import BestSellers from "@/components/landingPage/BestSellers";
import DisciplineSection from "@/components/landingPage/DisciplineSection";
import FeaturedProducts from "@/components/landingPage/FeaturedProducts";
import Footer from "@/components/landingPage/Footer";
import HeroSection from "@/components/landingPage/HeroSection";
import MembershipBanner from "@/components/landingPage/MembershipBanner";
import Navbar from "@/components/landingPage/Navbar";
import NewArrivals from "@/components/landingPage/NewArrivals";
import Newsletter from "@/components/landingPage/Newsletter";
import Testimonials from "@/components/landingPage/Testimonials";

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-transparent text-black">
      <Navbar />

      <HeroSection />

      <FeaturedProducts />

      <DisciplineSection />

      <NewArrivals />

      <MembershipBanner />

      <BestSellers />

      <Testimonials />

      <Newsletter />

      <Footer />
    </main>
  );
}
