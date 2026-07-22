import Nav from '@/components/nav'
import Hero from '@/components/hero'
import Features from '@/components/features'
import CtaSection from '@/components/cta-section'
import Footer from '@/components/footer'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] flex flex-col">
      <Nav />
      <Hero />
      <Features />
      <CtaSection />
      <Footer />
    </main>
  )
}
