import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import SubjectsSection from "@/components/home/SubjectsSection";
import FeaturedMaterials from "@/components/home/FeaturedMaterials";
import HowItWorks from "@/components/home/HowItWorks";
import RolesSection from "@/components/home/RolesSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        <SubjectsSection />
        <FeaturedMaterials />
        <HowItWorks />
        <RolesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
