"use client";

import { useEffect, useState } from "react";
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
import { productApi } from "@/lib/api";
import type { Product } from "@/lib/types";

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivalProducts, setNewArrivalProducts] = useState<Product[]>([]);
  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadLandingProducts = async () => {
      try {
        setLoadingProducts(true);

        const [featured, arrivals, bestSellers, fallbackProducts] = await Promise.all([
          productApi.list({ featured: true, limit: 4 }),
          productApi.list({ newArrival: true, limit: 4 }),
          productApi.list({ bestSeller: true, limit: 4 }),
          productApi.list({ limit: 12 }),
        ]);

        if (!isMounted) {
          return;
        }

        setFeaturedProducts(
          featured.length > 0 ? featured.slice(0, 4) : fallbackProducts.slice(0, 4)
        );
        setNewArrivalProducts(
          arrivals.length > 0 ? arrivals.slice(0, 4) : fallbackProducts.slice(4, 8)
        );
        setBestSellerProducts(
          bestSellers.length > 0
            ? bestSellers.slice(0, 4)
            : fallbackProducts.slice(8, 12).length > 0
              ? fallbackProducts.slice(8, 12)
              : fallbackProducts.slice(0, 4)
        );
      } catch {
        if (!isMounted) {
          return;
        }

        setFeaturedProducts([]);
        setNewArrivalProducts([]);
        setBestSellerProducts([]);
      } finally {
        if (isMounted) {
          setLoadingProducts(false);
        }
      }
    };

    void loadLandingProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="overflow-hidden bg-transparent text-black">
      <Navbar />

      <HeroSection />

      <FeaturedProducts products={featuredProducts} loading={loadingProducts} />

      <DisciplineSection />

      <NewArrivals products={newArrivalProducts} loading={loadingProducts} />

      <MembershipBanner />

      <BestSellers products={bestSellerProducts} loading={loadingProducts} />

      <Testimonials />

      <Newsletter />

      <Footer />
    </main>
  );
}
