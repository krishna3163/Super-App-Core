import './globals.css';

export const metadata = {
  title: 'Super App - The Everything App',
  description: 'Social, Dating, Commerce, Rides, and AI in one app.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
