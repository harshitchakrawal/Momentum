'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

const INSIGHTS = [
  {
    image: '/deepwork.png',
    alt: 'A focused developer working at a laptop beneath large productivity text',
    caption: 'Understand where your most productive hours actually go',
  },
  {
    image: '/productivityimg.png',
    alt: 'A developer collaborating with a teammate at a desk',
    caption: 'Connect daily progress to the work that moves projects forward',
  },
  
  
  {
    image: '/devanalytics.png',
    alt: 'A developer working with multiple screens',
    caption: 'Turn your development activity into actionable insights.',
  },
  {
    image: '/buildcommunity.png',
    alt: 'A team reviewing work together on a laptop',
    caption: 'Build in public, connect with developers, and grow together.',
  },
  {
    image: '/download.jpg',
    alt: 'A blurred figure moving quickly through a bright space',
    caption: 'Spot momentum, slowdowns, and context switches across the week',
  },
  
] as const

export default function AiInsights() {
  return (
    <section
      id="ai-insights"
      className="relative overflow-hidden border-t border-line py-24"
    >
      <div className="w-full">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-14 max-w-4xl px-6 text-center text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] tracking-normal text-ink md:px-10 lg:px-12"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Powerful features for better development
        </motion.h2>

        <div className="flex snap-x snap-mandatory gap-8 overflow-x-auto mx-15 pb-4 pl-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pr-3 md:pl-10 md:pr-6 lg:gap-10 lg:pl-16 lg:pr-12">
          {INSIGHTS.map((item, index) => (
            <motion.article
              key={item.image}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{
                duration: 0.72,
                ease: [0.22, 1, 0.36, 1],
                delay: index * 0.08,
              }}
              className="w-[66vw] shrink-0 snap-start md:w-[26vw] lg:w-[23vw]"
            >
              <div className="relative aspect-[0.72/1] overflow-hidden rounded-[18px] bg-line">
                <Image
                  src={item.image}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 768px) 66vw, 23vw"
                  className="object-cover"
                />
              </div>

              <h3 className="mt-6 text-[clamp(1.45rem,2vw,1.9rem)] font-medium leading-[1.18] tracking-normal text-ink">
                {item.caption}
              </h3>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
