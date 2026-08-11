"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const features = [
  {
    id: "item-1",
    num: "01",
    tag: "GitHub",
    title: "Every commit, instantly visible",
    description: "See your last 7 days of commits, active repos, and recent pushes in one unified view. No more switching tabs.",
    image: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=600&h=340&fit=crop",
  },
  {
    id: "item-2",
    num: "02",
    tag: "Coding Time",
    title: "Real hours coded, not estimates",
    description: "See exactly how long you coded each day, broken down by language and project. Truth over gut feeling.",
    image: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&h=340&fit=crop",
  },
  {
    id: "item-3",
    num: "03",
    tag: "Streak",
    title: "Build habits that stick",
    description: "Track your daily coding streak and stay consistent. Momentum rewards showing up — even for 30 minutes.",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=340&fit=crop",
  },
  {
    id: "item-4",
    num: "04",
    tag: "Analytics",
    title: "Language & project breakdown",
    description: "Which language are you spending most time in? Which project is eating your week? Already answered.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=340&fit=crop",
  },
  {
    id: "item-5",
    num: "05",
    tag: "AI Insights",
    title: "Guidance, not just data",
    description: "Personalized analysis of your coding patterns — peak hours, consistency scores, improvement suggestions.",
    image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&h=340&fit=crop",
  },
  {
    id: "item-6",
    num: "06",
    tag: "Setup",
    title: "Two integrations, zero config",
    description: "Connect GitHub in one click. Link WakaTime in two. That's the entire setup. No API keys to manage.",
    image: "https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=600&h=340&fit=crop",
  },
];

export default function Features() {
  return (
    <section id="features" className="border-t border-[#1a1a1a] px-6 md:px-30 pt-24 ">

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-14"
      >
        {/* <p className="text-[11px] font-mono text-[#444] uppercase tracking-[0.15em] mb-5">
          What you get
        </p> */}
        <h2 className="text-[clamp(2rem,4.5vw,3.25rem)] font-normal leading-[1.08] text-white max-w-2xl"style={{ fontFamily: 'var(--font-display)' }}>
            Everything a developer actually needs
          </h2>
      </motion.div>

      {/* Accordion + hand image side by side */}
      {/* <div className="flex gap-10 items-start">

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="w-full max-w-lg flex-none"
        >
          <div>
            <p className="">{features.map((f) => (f.title))}</p>
          </div>
          
        </motion.div>
      </div> */}

    </section>
  );
}
