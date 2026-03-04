import "./globals.css";
import Script from "next/script";
import LayoutComponent from "./layoutComponent";

export const metadata = {
  title: "Limbus Company Mirror Dungeon Resource and Achievements Tracker",
  description: "Plan mirror dungeon runs and track achievement progress",
  metadataBase: new URL("https://limbus-builds.eldritchtools.com")
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-RSG36T7DVB" />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-RSG36T7DVB', {page_path: window.location.pathname});
          `}
        </Script>
      </head>
      <body style={{ display: "flex", flexDirection: "column" }}>
        <LayoutComponent>{children}</LayoutComponent>
      </body>
    </html>
  );
}
