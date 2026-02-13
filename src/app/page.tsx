import { Hero } from "@/components/Landing/HeroSection";
import { Benefits } from "@/components/Landing/BenefitsSection";
import { Features } from "@/components/Landing/FeaturesSection";
import { Faq } from "@/components/Landing/FaqSection";
import { Cta } from "@/components/Landing/CtaSection";
import { Footer } from "@/components/Landing/Footer";
import { BackToTopButton } from "@/components/Buttons/BackToTopButton";
import { LandingPageWrapper } from "@/components/Landing/LandingPageWrapper";

export default function Home() {
    const year = new Date().getFullYear();

    return (
        <>
            <LandingPageWrapper>
                <Hero />
                <Benefits />
                <Features />
                <Faq />
                <Cta />
                <BackToTopButton />
            </LandingPageWrapper>
            <Footer year={year} />
        </>
    );
}