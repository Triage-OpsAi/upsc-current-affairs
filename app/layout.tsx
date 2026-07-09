import "./globals.css";

export const metadata = {
  title: "The Current Affairs Gazette - UPSC Practice",
  description: "Daily current-affairs practice for UPSC & competitive exam aspirants.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-body min-h-screen">{children}</body>
    </html>
  );
}
