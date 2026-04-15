import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "ContratoAI — Contratos e Documentos Juridicos com IA",
    template: "%s | ContratoAI",
  },
  description: "Gere contratos, pecas judiciais e documentos juridicos profissionais em minutos com Inteligencia Artificial. 19 tipos de documento, analise de risco, assinatura digital. A partir de R$11,90.",
  manifest: "/manifest.json",
  metadataBase: new URL("https://contrato.rga-technologies.com"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "ContratoAI",
    title: "ContratoAI — Contratos e Documentos Juridicos com IA",
    description: "Gere contratos profissionais em minutos com IA. 19 tipos de documento, analise de risco, assinatura digital. Sem advogado, sem complicacao.",
    url: "https://contrato.rga-technologies.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "ContratoAI — Contratos com IA",
    description: "Gere contratos e documentos juridicos profissionais em minutos. A partir de R$11,90.",
  },
  robots: { index: true, follow: true },
  keywords: ["contrato", "documento juridico", "inteligencia artificial", "gerador de contrato", "peticao inicial", "NDA", "contrato de prestacao de servico", "contrato online", "gerar contrato com IA"],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ContratoAI",
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#3B82F6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js')` }} />
      </body>
    </html>
  );
}
