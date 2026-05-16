import { Header } from "@/app/components/header";
import { HeroSection } from "@/app/components/hero-section";
import { PlatformsSection } from "@/app/components/platforms-section";
import { ProductsSection } from "@/app/components/products-section";
import { ReportsSection } from "@/app/components/reports-section";
import { EcosystemSection } from "@/app/components/ecosystem-section";
import { CTASection } from "@/app/components/cta-section";
import { Footer } from "@/app/components/footer";

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <HeroSection />
        <PlatformsSection />
        <ProductsSection />
        <ReportsSection />
        <EcosystemSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
