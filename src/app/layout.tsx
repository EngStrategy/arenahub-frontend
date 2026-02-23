import "./styles/globals.css";
import Navbar from "@/components/Navbar";
import SmartAppBanner from "@/components/Navigation/SmartAppBanner";
import JsonLd from "@/components/JsonLd";
import SessionAuthProvider from "@/context/SessionAuthProvider";
import { ThemeProvider } from "@/context/ThemeProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { App as AntdApp } from 'antd';
import Script from 'next/script';
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "https://arenahub.app"),
  title: "ArenaHub - Gestão e Agendamento de Quadras Esportivas",
  description: "O ArenaHub facilita o agendamento de quadras e a gestão da sua Arena. Encontre horários, gerencie agendamentos e automatize seu negócio em um só lugar.",
  icons: {
    icon: "/icons/logo_arenahub_icone.svg",
  },
  keywords: ["arenahub", "aluguel de quadras", "alugar jogo", "jogar futebol", "gestão de arenas", "agendamento de quadras", "plataforma de esportes", "gestão de espaços esportivos", "agendamento de espaços esportivos", "plataforma de gestão esportiva", "quadras esportivas"],
  authors: [{ name: "Sávio Soares", url: "https://saviosoaresufc.github.io/meu-portfolio" }],
  alternates: {
    canonical: "/",
  },
};

const ThemeScript = () => {
  const script = `
    (function() {
      function getTheme() {
        const theme = window.localStorage.getItem('theme');
        if (theme) return theme;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      const theme = getTheme();
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://arenahub.app/#website",
        "url": "https://arenahub.app",
        "name": "ArenaHub - Gestão e Agendamento de Quadras Esportivas",
        "description": "O ArenaHub facilita o agendamento de quadras e a gestão da sua Arena. Encontre horários, gerencie agendamentos e automatize seu negócio em um só lugar.",
        "publisher": {
          "@id": "https://arenahub.app/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://arenahub.app/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://arenahub.app/#organization",
        "name": "ArenaHub",
        "url": "https://arenahub.app",
        "logo": {
          "@type": "ImageObject",
          "url": "https://arenahub.app/icons/logo_arenahub_icone.svg",
          "width": 112,
          "height": 112
        },
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+55-89-99467-3969",
          "contactType": "customer service",
          "areaServed": "BR",
          "availableLanguage": ["Portuguese", "English"]
        },
        "sameAs": [
          "https://www.instagram.com/arenahub.br"
        ]
      }
    ]
  };

  return (
    <html lang="pt-br" suppressHydrationWarning>
      <head>
        {/* Google tag (gtag.js) */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-L1EKJW34FT"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-L1EKJW34FT');
          `}
        </Script>
        <ThemeScript />
        <JsonLd data={jsonLd} />
      </head>
      <body className={`${inter.variable} antialiased h-full`}>
        <SessionAuthProvider>
          <ThemeProvider>
            <AntdApp>
              <div className="relative flex flex-col min-h-screen">
                <SmartAppBanner />
                <Navbar />
                {children}
              </div>
            </AntdApp>
          </ThemeProvider>
        </SessionAuthProvider>
      </body>
    </html>
  );
}