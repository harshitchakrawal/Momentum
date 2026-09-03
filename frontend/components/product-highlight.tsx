"use client"

import { motion } from "framer-motion"
import Image from "next/image"



const cards = [
  {
    id: "streak",
    title: "Build Your Streak",
    description: "Track daily coding time and keep your momentum going, one commit at a time.",
    image: "/download.jpg",
  },
  {
    id: "code",
    title: "GitHub, Fully Visible",
    description: "Every commit and repo, pulled in automatically. No more switching tabs to check progress.",
    image: "/download (1).jpg",
  },
]

export function ProductHighlight() {
  return (
    <section className="border-t border-line px-6 md:px-30 py-24">
      <motion.h2
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-[clamp(2rem,4.5vw,3.25rem)] font-normal leading-[1.08] text-ink mb-14"
        style={{ fontFamily: "var(--font-display)" }}
      >
        Build your habit
        <br />
        Keep your momentum
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: "easeOut", delay: i * 0.1 }}
            className="relative rounded-2xl overflow-hidden border border-line h-105"
          >
            <Image
              src={card.image}
              alt={card.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent" />

            <div className="absolute left-0 right-0 p-8">
              <h3 className="text-white text-2xl font-semibold mb-1">
                {card.title}
              </h3>
              <p className="text-[#ffffff] text-sm mb-5 max-w-xs">
                {card.description}
              </p>
              <a
                href="/signup"
                className="inline-block bg-white text-[#0a0a0a] text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-[#e5e5e5] transition-colors"
              >
                Get Started
              </a>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
