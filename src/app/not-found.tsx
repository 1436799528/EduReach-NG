import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, Home, BookOpen } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFoundPage() {
  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="text-8xl font-bold text-slate-100 mb-4">404</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Try searching for what you need.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/">
            <Button variant="primary" icon={<Home className="w-4 h-4" />}>
              Back to Home
            </Button>
          </Link>
          <Link href="/search">
            <Button variant="secondary" icon={<Search className="w-4 h-4" />}>
              Search Questions
            </Button>
          </Link>
          <Link href="/courses">
            <Button variant="ghost" icon={<BookOpen className="w-4 h-4" />}>
              Browse Courses
            </Button>
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
