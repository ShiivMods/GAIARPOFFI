import type { Metadata } from "next";
import type { ReactNode } from "react";


export const metadata: Metadata = {
  title: "GAIA RP",
  description: "Plateforme de jeu de rôle écrit de science-fiction.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
