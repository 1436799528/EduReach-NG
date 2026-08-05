import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import GuestHome from "@/components/home/GuestHome";
import StudentHome from "@/components/home/StudentHome";
import { HideWhenLoggedIn, ShowWhenLoggedIn } from "@/components/home/HomeRouter";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HideWhenLoggedIn>
          <GuestHome />
        </HideWhenLoggedIn>
        <ShowWhenLoggedIn>
          <StudentHome />
        </ShowWhenLoggedIn>
      </main>
      <Footer />
    </>
  );
}
