import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/marketplace/navbar";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentUserProfile } from "@/lib/queries";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pasamelaretro.vercel.app"),
  title: "PasameLaRetro | Renta premium de maquinaria",
  description: "Marketplace profesional para publicar, rentar y agendar maquinaria.",
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    title: "PasameLaRetro | Renta de maquinaria sin vueltas",
    description: "Encuentra maquinaria disponible, revisa horarios y agenda directo con el dueño.",
    url: "https://pasamelaretro.vercel.app",
    siteName: "PasameLaRetro",
    images: [
      {
        url: "/pasamelaretro-hero.jpg",
        width: 1536,
        height: 864,
        alt: "Pasame La Retro",
      },
    ],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PasameLaRetro | Renta de maquinaria sin vueltas",
    description: "Encuentra maquinaria disponible, revisa horarios y agenda directo con el dueño.",
    images: ["/pasamelaretro-hero.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { user, profile } = await getCurrentUserProfile();

  return (
    <html
      lang="es"
      className={`${inter.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Navbar user={user} profile={profile} />
        <main className="flex-1">{children}</main>
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
