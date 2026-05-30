const features = [
  {
    tag: 'GitHub',
    title: 'Every commit, instantly visible',
    description: 'See your last 7 days of commits, active repos, and pull requests in one unified feed. No more switching between GitHub tabs.',
  },
  {
    tag: 'Coding Time',
    title: 'Real coding hours, not estimates',
    description: 'See exactly how long you coded each day, broken down by language and project. Truth over perception.',
  },
  {
    tag: 'Streak',
    title: 'Build habits that stick',
    description: 'Track your daily coding streak and stay consistent. Momentum rewards showing up — even for 30 minutes.',
  },
  {
    tag: 'Analytics',
    title: 'Language & project breakdown',
    description: 'Which language are you spending most time in? Which project is eating your week? The answers are already here.',
  },
  {
    tag: 'AI Insights',
    title: 'Full guidance, not just data',
    description: 'Get personalized recommendations on your coding patterns — when you peak, where you slow down, and how to improve consistency.',
  },
  {
    tag: 'Integrations',
    title: 'Two integrations, zero friction',
    description: "Connect GitHub in one click. Link your coding tracker in two. That's the entire setup. No config files, no API keys to manage.",
  },
];

export default function Features() {
  return (
    <section id="features" className="px-30 py-24 border-t border-white/6">
      {/* Section header */}
      <div className="mb-16">
        <p className="text-xs text-[#555] uppercase tracking-widest mb-4">Features</p>
        <h2 className="text-[clamp(2.5rem,5vw,4rem)] font-semibold tracking-[-0.03em] text-[#F7F8F8] leading-[1.05] max-w-4xl">
          Everything a developer actually needs
        </h2>
      </div>

      {/* Feature grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="group rounded-xl border border-white/8 bg-white/2 hover:bg-white/4 hover:border-white/14 transition-all duration-200 p-7"
          >
            {/* Tag */}
            <p className="text-[11px] text-[#555] uppercase tracking-widest mb-4">{f.tag}</p>
            {/* Title */}
            <h3 className="text-[#F7F8F8] font-medium text-xl mb-3 leading-snug">{f.title}</h3>
            {/* Description */}
            <p className="text-[#555] text-sm leading-relaxed">{f.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
