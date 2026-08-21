import Link from 'next/link';
import { PublicFooter, PublicHeader } from '@/components/public-chrome';

export default function NotFound() {
  return (
    <>
      <PublicHeader />
      <main className="container section" style={{ textAlign: 'center', padding: '80px 16px' }}>
        <h1 style={{ fontSize: '2.4rem' }}>Page not found</h1>
        <p className="muted" style={{ maxWidth: '44ch', margin: '0 auto 20px' }}>
          The page you&apos;re looking for moved or doesn&apos;t exist. Let&apos;s get you back to solving your school problem.
        </p>
        <div className="row" style={{ justifyContent: 'center', gap: 10 }}>
          <Link href="/" className="btn btn--primary">Go home</Link>
          <Link href="/search" className="btn btn--outline">Search</Link>
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
