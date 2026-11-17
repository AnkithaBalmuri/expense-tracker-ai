import "./globals.css";

export const metadata = {
  title: "Expense Tracker",
  description: "Full-stack bill scanner and expense analytics app."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
