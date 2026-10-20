import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { APP_NAME, TARGET_COMPANY } from "@/lib/constants";
import { ThemeInitializer } from "@/components/layout/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: `${APP_NAME} | ${TARGET_COMPANY} Interview & Test Simulator`,
  description:
    "Original educational test and interview preparation simulator for data science interns targeting Grid Dynamics campus drives.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="font-sans antialiased min-h-screen bg-slate-50/50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 transition-colors duration-200">
        <ThemeInitializer />
        {children}
      </body>
    </html>
  );
}
