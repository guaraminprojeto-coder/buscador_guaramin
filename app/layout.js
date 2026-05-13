import Providers from "./providers";
import "./globals.css";

export const metadata = {
  title: "Guaramim Admin",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}