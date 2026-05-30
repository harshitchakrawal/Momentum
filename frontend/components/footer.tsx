const GITHUB_LOGIN_URL = 'http://localhost:3001/auth/github';

const links = {
  Product:   ['Features', 'GitHub Activity', 'Coding Time', 'AI Insights', 'Streak'],
  Resources: ['Documentation', 'Changelog', 'Status', 'Roadmap'],
  Company:   ['About', 'Blog', 'Privacy', 'Terms'],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/6 px-30 pt-16 pb-10">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 justify-between">

        {/* Brand */}
        <div className="shrink-0 max-w-xs">
          <span className="text-base font-semibold text-[#F7F8F8]">Momentum</span>
          <p className="text-[#555] text-sm leading-relaxed mt-3">
            Your personal dev productivity dashboard. Track commits, coding time, and streaks in one place.
          </p>
          <a
            href={GITHUB_LOGIN_URL}
            className="mt-6 inline-flex items-center gap-2 text-sm text-[#F7F8F8] border border-white/15 hover:border-white/30 px-4 py-2 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Get started free
          </a>
        </div>

        {/* Link columns */}
        <div className="grid grid-cols-3 gap-10 lg:gap-16">
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <p className="text-xs text-[#444] uppercase tracking-widest mb-4">{group}</p>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-[#666] hover:text-[#F7F8F8] transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>

      {/* Bottom bar */}
      <div className="mt-14 pt-6 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-[#3a3a3a]">© 2025 Momentum. Built with Next.js &amp; Express.</p>
        <div className="flex items-center gap-5">
          {['Twitter', 'GitHub', 'Discord'].map((s) => (
            <a key={s} href="#" className="text-xs text-[#3a3a3a] hover:text-[#777] transition-colors">{s}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}
