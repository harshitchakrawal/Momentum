const GitHubIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

// Mock dashboard preview
function DashboardPreview() {
  return (
    <div className="w-full rounded-xl border border-white/10 bg-[#0e0f10] overflow-hidden shadow-2xl shadow-black/60" style={{ height: '780px' }}>
     

      {/* Three-panel layout */}
      <div className="flex h-full">

        {/* Left sidebar */}
        <div className="w-56 border-r border-white/6 flex flex-col shrink-0 bg-[#0f1011]">
          {/* Workspace */}
          <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/6">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-bold text-white">M</span>
            </div>
            <span className="text-md font-semibold text-[#F7F8F8]">Momentum</span>
          </div>

          {/* Nav items */}
          <div className="p-2.5 space-y-0.5 flex-1">
            {[
              {
                label: 'Dashboard',
                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
              },
              {
                label: 'My Activity',
                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="3" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="21" y2="12"/></svg>,
              },
              {
                label: 'Commits',
                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><line x1="3" y1="12" x2="9" y2="12"/><line x1="15" y1="12" x2="21" y2="12"/></svg>,
              },
              {
                label: 'Streak',
                icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>,
              },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 px-2.5 py-2 rounded text-xs text-[#999] hover:text-[#ccc]">
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}

            <div className="px-2.5 pt-4 pb-1.5 flex items-center gap-1">
              <span className="text-[10px] text-[#555] uppercase tracking-widest">Workspace</span>
              <svg className="w-2.5 h-2.5 text-[#555]" fill="currentColor" viewBox="0 0 20 20"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/></svg>
            </div>

            {[
              { label: 'Repos',       icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/></svg> },
              { label: 'WakaTime',    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2"/></svg> },
              { label: 'Languages',   icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"/></svg> },
              { label: 'Goals',       icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm9.75-4.5c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"/></svg> },
              { label: 'Settings',    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z"/><circle cx="12" cy="12" r="3"/></svg> },
            ].map(({ label, icon }) => (
              <div key={label} className="flex items-center gap-2.5 px-2.5 py-2 rounded text-xs text-[#888]">
                {icon}
                <span>{label}</span>
              </div>
            ))}

            <div className="px-2.5 pt-4 pb-1.5 flex items-center gap-1">
              <span className="text-[10px] text-[#555] uppercase tracking-widest">Favorites</span>
              <svg className="w-2.5 h-2.5 text-[#555]" fill="currentColor" viewBox="0 0 20 20"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"/></svg>
            </div>

            {[
              { label: 'momentum',   dot: 'bg-blue-500',   active: true  },
              { label: 'portfolio',  dot: 'bg-purple-500', active: false },
              { label: 'api-server', dot: 'bg-green-500',  active: false },
            ].map((item) => (
              <div key={item.label} className={`flex items-center gap-2.5 px-2.5 py-2 rounded text-xs ${item.active ? 'bg-white/8 text-[#ccc]' : 'text-[#777]'}`}>
                <span className={`w-4 h-4 rounded flex items-center justify-center shrink-0`}>
                  <span className={`w-2 h-2 rounded-full ${item.dot} opacity-80`} />
                </span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/6 shrink-0">
            <div className="flex items-center gap-2 text-xs text-[#888]">
              <span>harshit</span>
              <span className="text-[#555]">/</span>
              <span className="text-[#888]">momentum</span>
              <span className="text-[#555]">/</span>
              <span>main</span>
            </div>
            
          </div>

          {/* Detail + right panel */}
          <div className="flex flex-1 overflow-hidden">
            {/* Detail */}
            <div className="flex-1 p-6 overflow-auto space-y-6">
              {/* Title + description */}
              <div>
                <h3 className="text-[#F7F8F8] font-semibold text-base mb-2">Add WakaTime OAuth integration</h3>
                <p className="text-[#888] text-xs leading-relaxed">
                  Connect WakaTime API to pull coding stats and display language breakdown in the dashboard. Users should be able to link their WakaTime account from the settings page.
                </p>
              </div>

              {/* Sub-tasks checklist */}
              <div>
                <p className="text-[10px] text-[#666] uppercase tracking-widest mb-3">Sub-tasks</p>
                <div className="space-y-2">
                  {[
                    { label: 'Set up OAuth redirect URI',       done: true  },
                    { label: 'Store WakaTime token in DB',      done: true  },
                    { label: 'Fetch /summary endpoint',         done: false },
                    { label: 'Display language breakdown chart',done: false },
                  ].map((t) => (
                    <div key={t.label} className="flex items-center gap-2.5">
                      <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${t.done ? 'bg-blue-600 border-blue-600' : 'border-white/20'}`}>
                        {t.done && <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>}
                      </span>
                      <span className={`text-xs ${t.done ? 'text-[#555] line-through' : 'text-[#aaa]'}`}>{t.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Code snippet */}
              <div>
                <p className="text-[10px] text-[#666] uppercase tracking-widest mb-3">Reference</p>
                <div className="bg-black/40 border border-white/8 rounded-lg p-3 font-mono text-[10px] leading-relaxed text-[#888]">
                  <span className="text-[#666]">GET </span>
                  <span className="text-blue-400">/auth/wakatime/callback</span>
                  <br />
                  <span className="text-[#666]">→ </span>
                  <span className="text-green-400">exchange_code(req.query.code)</span>
                  <br />
                  <span className="text-[#666]">→ </span>
                  <span className="text-[#888]">save token to user record</span>
                </div>
              </div>

              {/* Activity */}
              <div>
                <p className="text-[10px] text-[#666] uppercase tracking-widest mb-3">Activity</p>
                <div className="space-y-4">
                  {[
                    { action: 'pushed 3 commits to',  target: 'main',               time: '2min ago',  color: 'bg-blue-500'  },
                    { action: 'opened PR',             target: '#12 wakatime-oauth', time: '18min ago', color: 'bg-purple-500' },
                    { action: 'left a comment on',     target: 'token storage',      time: '45min ago', color: 'bg-blue-500'  },
                    { action: 'closed issue',          target: 'GitHub auth flow',   time: '1h ago',    color: 'bg-green-500' },
                    { action: 'created branch',        target: 'feat/wakatime-oauth', time: '3h ago',   color: 'bg-blue-500'  },
                  ].map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full ${a.color} opacity-60 shrink-0 mt-0.5`} />
                      <p className="text-xs text-[#888]">
                        <span className="text-[#bbb]">harshit</span>{' '}
                        {a.action}{' '}
                        <span className="text-[#999]">{a.target}</span>
                        <span className="text-[#555]"> · {a.time}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right metadata panel */}
            <div className="w-48 border-l border-white/6 p-4 shrink-0 space-y-5">
              <div>
                <p className="text-[10px] text-[#666] uppercase tracking-widest mb-2">Status</p>
                <div className="flex items-center gap-2 text-xs text-[#777]">
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                  In Progress
                </div>
              </div>
              <div>
                <p className="text-[10px] text-[#666] uppercase tracking-widest mb-2">Priority</p>
                <div className="flex items-center gap-2 text-xs text-[#777]">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="currentColor"><path d="M6 1l1.5 3h3l-2.5 2 1 3L6 7.5 3 9l1-3L1.5 4h3z"/></svg>
                  High
                </div>
              </div>
              <div>
                <p className="text-[10px] text-[#666] uppercase tracking-widest mb-2">Assignee</p>
                <div className="flex items-center gap-2 text-xs text-[#777]">
                  <div className="w-5 h-5 rounded-full bg-blue-600/80" />
                  harshit
                </div>
              </div>
              <div>
                <p className="text-[10px] text-[#666] uppercase tracking-widest mb-2">Labels</p>
                <div className="flex flex-wrap gap-1.5">
                  {['backend', 'api'].map((tag) => (
                    <span key={tag} className="text-[10px] border border-white/15 px-2 py-0.5 rounded text-[#888]">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <>
      {/* Hero */}
      <section className="px-30 pt-24 pb-16">
        {/* Headline */}
        <h1 className="text-[64px] leading-18 font-[510] tracking-[-1.408px] text-[#F7F8F8]">
          The Developer Productivity
          <br />Dashboard for Focus Tracking
        </h1>

        {/* Subtitle row */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-[#888] text-base leading-relaxed ">
            Purpose-built for tracking commits, coding time, and momentum. Designed for developers who ship.
          </p>

          {/* Announcement badge — mirrors the "Issue tracking is dead" link */}
          <a
            href="#features"
            className="inline-flex items-center gap-2 text-sm text-[#888] hover:text-[#F7F8F8] transition whitespace-nowrap group"
          >
          </a>
        </div>

        {/* CTA buttons */}
        <div className="mt-8 flex items-center gap-4">
          <a
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-black text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-white/90 transition"
          >
            <GitHubIcon />
            Get started
          </a>
          <a
            href="#features"
            className="text-sm text-[#888] hover:text-[#F7F8F8] transition"
          >
            Learn more
          </a>
        </div>

        {/* Product preview */}
        <div className="mt-14">
          <DashboardPreview />
        </div>
      </section>

      
    </>
  );
}
