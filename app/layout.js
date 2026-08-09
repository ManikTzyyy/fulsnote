import { Toaster } from "sonner";
import "./globals.css";
import "swiper/css";
import "swiper/css/pagination";

export const metadata = {
  title: "My Finance",
  description: "Finance tracker migration to React",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="stylesheet" href="/assets/css/style.css" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full flex flex-col relative">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}

