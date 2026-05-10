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
  generator: "Next.js",
  keywords: ["renta de maquinaria", "retroexcavadoras", "gruas", "montacargas", "maquinaria pesada", "Mexico"],
  applicationName: "PasameLaRetro",
  authors: [{ name: "PasameLaRetro" }],
  creator: "PasameLaRetro",
  publisher: "PasameLaRetro",
  alternates: {
    canonical: "https://pasamelaretro.vercel.app",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "PasameLaRetro | Renta de maquinaria",
    description: "Encuentra maquinaria disponible, revisa horarios y agenda directo con el dueño.",
    url: "https://pasamelaretro.vercel.app",
    siteName: "PasameLaRetro",
    images: [
      {
        url: "https://pasamelaretro.vercel.app/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Pasame La Retro",
      },
    ],
    locale: "es_MX",
    alternateLocale: ["es_MX", "es_ES"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PasameLaRetro | Renta de maquinaria",
    description: "Encuentra maquinaria disponible, revisa horarios y agenda directo con el dueño.",
    images: ["https://pasamelaretro.vercel.app/opengraph-image"],
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
