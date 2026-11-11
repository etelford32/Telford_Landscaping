import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import StickyContactBar from "@/components/StickyContactBar";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        {children}
      </main>
      <Footer />
      {/* Room for the phone call bar, so it never covers the last footer lines. */}
      <div aria-hidden className="md:hidden h-[76px] bg-gray-900" />
      <StickyContactBar />
    </>
  );
}
