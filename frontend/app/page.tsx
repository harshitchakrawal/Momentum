import Nav from '@/components/nav'
import Hero from '@/components/hero'
import Features from '@/components/features'
import { StaggerTestimonials } from '@/components/ui/stagger-testimonials'
import CtaSection from '@/components/cta-section'
import Footer from '@/components/footer'
import { ProductHighlight } from '@/components/product-highlight'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#e5e5e5] flex flex-col">
      <Nav />
      <Hero />
      <Features />
      {/* <StaggerTestimonials /> */}
      {/* <ProductHighlight/> */}
      <CtaSection />
      <Footer />
    </main>
  )
}
