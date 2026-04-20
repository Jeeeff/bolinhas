import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bolinhas Voadoras",
  description: "Simulação de partículas com vento e gravidade",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
        {children}
      </body>
    </html>
  );
}
