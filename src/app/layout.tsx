import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import MuiThemeProvider from "@/providers/MuiThemeProvider";
import ReduxProvider from "@/providers/ReduxProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "KosherPhone Affiliate Dashboard",
  description: "Affiliate dashboard for KosherPhone – track referrals, earnings, and payouts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReduxProvider>
          <MuiThemeProvider>{children}</MuiThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
