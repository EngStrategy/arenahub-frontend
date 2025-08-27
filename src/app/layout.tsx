import "./styles/globals.css";
import Navbar from "@/components/Navbar";
import SessionAuthProvider from "@/context/SessionAuthProvider";
import { ThemeProvider } from "@/context/ThemeProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Alugai",
    description: "",
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

    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <ThemeScript />
            </head>
            <body className={`${inter.variable} antialiased h-full`}>
                <SessionAuthProvider>
                    <ThemeProvider>
                        <main className="flex flex-col min-h-screen">
                            <Navbar />
                            {children}
                        </main>
                    </ThemeProvider>
                </SessionAuthProvider>
            </body>
        </html>
    );
}