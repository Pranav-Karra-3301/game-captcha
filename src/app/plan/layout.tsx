import { Orbitron, Space_Mono } from 'next/font/google';

// Define the fonts
const orbitron = Orbitron({
  variable: '--font-orbitron',
  subsets: ['latin'],
  display: 'swap',
});

const spaceMono = Space_Mono({
  variable: '--font-space-mono',
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${orbitron.variable} ${spaceMono.variable}`}>
      {children}
    </div>
  );
} 