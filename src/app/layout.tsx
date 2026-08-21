import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'EduReach NG — School problem? Start here.',
    template: '%s · EduReach NG'
  },
  description:
    'Everything you need to navigate tertiary education in Nigeria: verified JAMB & school updates, academic letter generator, GPA/CGPA tools, deadline tracker, past questions and more.',
  keywords: ['Nigerian students', 'UNICAL', 'JAMB', 'GPA calculator', 'CGPA', 'post-UTME', 'cut-off marks', 'school letters'],
  authors: [{ name: 'EduReach NG' }],
  openGraph: {
    title: 'EduReach NG — School problem? Start here.',
    description: 'Everything you need to navigate tertiary education in Nigeria.',
    type: 'website'
  }
};

export const viewport: Viewport = {
  themeColor: '#008751',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
