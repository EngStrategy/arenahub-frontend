"use client";

import { useEffect } from "react";
import { useTheme } from "@/context/ThemeProvider";

export function LandingPageWrapper({ children }: { readonly children: React.ReactNode }) {
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
        <main style={{ backgroundColor: isDarkMode ? 'var(--cor-fundo-dark)' : 'var(--cor-fundo-light)' }}>
            {children}
        </main>
    );
}
