import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'EduReach Hub — Fast, Reliable, No Stress',
  description: 'A practical digital front desk for Nigerian tertiary students.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
