import Hero from '@/components/hero';
import Features from '@/components/features';
import Footer from '@/components/footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#08090A] text-[#F7F8F8] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-30 h-20 border-b border-white/3 sticky top-0 z-50 bg-[#08090A]/90 backdrop-blur-md">
        {/* Left: Logo only */}
        <a href="/" className="flex items-center gap-2.5 shrink-0">
         
          <span className="text-xl font-semibold tracking-tight text-[#F7F8F8]">Momentum</span>
        </a>

        {/* Right: nav links + divider + auth */}
        <div className="flex items-center gap-7">
          <div className="hidden md:flex items-center gap-7">
            {[
              { label: 'Features', href: '#features' },
              { label: 'GitHub',   href: '#features' },
              { label: 'WakaTime', href: '#features' },
              { label: 'Pricing',  href: '#pricing'  },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="text-sm text-[#777] hover:text-[#F7F8F8] transition-colors"
              >
                {label}
              </a>
            ))}
          </div>
          <div className="hidden md:block w-px h-4 bg-white/10" />
          <a
            href="/login"
            className="text-sm text-[#777] hover:text-[#F7F8F8] transition-colors"
          >
            Log in
          </a>
          <a
            href="/signup"
            className="text-sm font-medium text-[#F7F8F8] border border-white/20 hover:border-white/40 px-4 py-2 rounded-lg transition-colors"
          >
            Sign up
          </a>
        </div>
      </nav>

      <Hero />
      <Features />

      <Footer />
    </main>
  );
}
