"use client";

import { useState, useEffect } from "react";
import { Hero } from "@/components/Landing/HeroSection";
import { Benefits } from "@/components/Landing/BenefitsSection";
import { Features } from "@/components/Landing/FeaturesSection";
import { Faq } from "@/components/Landing/FaqSection";
import { Cta } from "@/components/Landing/CtaSection";
import { Footer } from "@/components/Landing/Footer";
import { useTheme } from "@/context/ThemeProvider";
import { BackToTopButton } from "@/components/Buttons/BackToTopButton";

export default function Home() {
    const [year] = useState<number>(new Date().getFullYear());
    const { isDarkMode } = useTheme();

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const children = entry.target.querySelectorAll(":scope > *");
                        children.forEach((el, i) => {
                            (el as HTMLElement).style.animationDelay = `${i * 80}ms`;
                            el.classList.add("animate-fade-in-up");
                        });
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.2 }
        );
        document.querySelectorAll("[data-animate]").forEach((el) => observer.observe(el));
    }, []);

    return (
        <>
            <main style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark)' : 'var(--cor-fundo-light)' }}>
                <Hero isDarkMode={isDarkMode} />
                <Benefits isDarkMode={isDarkMode} />
                <Features isDarkMode={isDarkMode} />
                <Faq isDarkMode={isDarkMode} />
                <Cta isDarkMode={isDarkMode} />
                <BackToTopButton />
            </main>
            <Footer year={year} isDarkMode={isDarkMode} />
        </>
    );
}