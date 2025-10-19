import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { TestimonialsSection } from "@/components/landing/testimonials-section";
import { FAQSection } from "@/components/landing/faq-section";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HomeClient } from "@/components/home-client";
import { homeService } from "@/services/home.service";

const getHomeData = async () => {

  const homeData = await homeService.getHomeData();
  return homeData;
}
export default async function HomePage() {
  const homeData = await getHomeData();
  console.log("homeData" , homeData)
  return (
    <div className="min-h-screen bg-background">
      <main>
        <HomeClient
          homeData={homeData.data}
          language={homeData.language}
          // error={error}
        />
      </main>
    </div>
  );
}
