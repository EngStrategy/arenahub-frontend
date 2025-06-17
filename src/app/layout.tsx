
import "./styles/globals.css";
import Navbar from "@/components/Navbar";
import SessionAuthProvider from "@/context/SessionAuthProvider";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { App, ConfigProvider, theme } from "antd";
import '@ant-design/v5-patch-for-react-19';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Alugai",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const primary = "#15a01a";
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased h-full`}>
        <ConfigProvider
          theme={{
            token: {
              colorPrimary: primary,
              borderRadius: 5,
              colorBgContainer: '#FFFFFF',
            },
            components: {
              Button: {
                colorPrimary: primary,
                algorithm: true,
              },
              Input: {
                colorPrimary: primary,
                algorithm: true,
              }
            },
            algorithm: theme.defaultAlgorithm,
          }}
        >
          <App style={{ height: '100%' }}>
            <SessionAuthProvider>
              <main className="flex flex-col min-h-screen">
                <Navbar />
                {children}
              </main>
            </SessionAuthProvider>
          </App>
        </ConfigProvider>
      </body>
    </html>
  );
}