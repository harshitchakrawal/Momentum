import Nav from '@/components/nav'
import Hero from '@/components/hero'
import Features from '@/components/features'
import AiInsights from '@/components/ai-insights'
import { StaggerTestimonials } from '@/components/ui/stagger-testimonials'
import CtaSection from '@/components/cta-section'
import Footer from '@/components/footer'
import { ProductHighlight } from '@/components/product-highlight'

export default function Home() {
  return (
    <main className="min-h-screen bg-page text-ink-2 flex flex-col">
      <Nav />
      <Hero />
      <Features />
      <AiInsights />
      <CtaSection />
      <Footer />
    </main>
  )
}
