import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ContratoAI — Contratos com Inteligência Artificial",
  description: "Gere contratos e documentos jurídicos profissionais em minutos com IA. Sem advogado, sem complicação.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
