import "./globals.css";

export const metadata = {
  title: "AspirantOS - Current Affairs Command Center",
  description: "Question-led current affairs practice, guided breakdowns, and personalized exam-readiness reports.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="dark-app min-h-screen">{children}</body>
    </html>
  );
}
