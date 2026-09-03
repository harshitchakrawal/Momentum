'use client'

import { useState } from 'react'
import {
  CalendarIcon,
  ChatBubbleIcon,
  CheckCircledIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  GitHubLogoIcon,
  TimerIcon,
  UpdateIcon,
} from '@radix-ui/react-icons'
import { api } from '@/lib/api'
import { useDashboardUser } from '@/app/dashboard/layout'

export interface StarterPatch {
  title?: string
  body: string
}

interface Template {
  id: string
  label: string
  icon: typeof CalendarIcon
  title: () => string
  body: string
}

function today() {
  return new Date().toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

const TEMPLATES: Template[] = [
  {
    id: 'daily',
    label: 'Daily log',
    icon: CalendarIcon,
    title: () => `Daily log — ${today()}`,
    body: '## Shipped\n- \n\n## Blocked\n- \n\n## Tomorrow\n- ',
  },
  {
    id: 'standup',
    label: 'Standup',
    icon: ClockIcon,
    title: () => `Standup — ${today()}`,
    body: '## Yesterday\n- \n\n## Today\n- \n\n## Blockers\n- ',
  },
  {
    id: 'decision',
    label: 'Decision',
    icon: CheckCircledIcon,
    title: () => 'Decision: ',
    body: '## Context\n\n\n## Decision\n\n\n## Consequences\n\n',
  },
  {
    id: 'bug',
    label: 'Bug notes',
    icon: ExclamationTriangleIcon,
    title: () => 'Bug: ',
    body: '## Symptom\n\n\n## Repro\n1. \n\n## Root cause\n\n\n## Fix\n\n',
  },
  {
    id: 'meeting',
    label: 'Meeting',
    icon: ChatBubbleIcon,
    title: () => `Meeting — ${today()}`,
    body: '## Attendees\n- \n\n## Notes\n- \n\n## Action items\n- [ ] ',
  },
]

interface Commit {
  message: string
  author_date: string
  html_url: string
}

interface WakatimeToday {
  data?: {
    grand_total?: { text?: string }
    projects?: { name: string; text: string }[]
  }
}

function isToday(iso: string) {
  const date = new Date(iso)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

async function commitsToday() {
  const { data } = await api.get<unknown>('/github/commits/')
  const commits = (Array.isArray(data) ? data : []) as Commit[]
  const rows = commits.filter((commit) => isToday(commit.author_date))

  if (rows.length === 0) return '## Commits today\n_No commits yet today._\n'

  return (
    '## Commits today\n' +
    rows
      .map(
        (commit) =>
          `- [${commit.message.split('\n')[0]}](${commit.html_url})`,
      )
      .join('\n') +
    '\n'
  )
}

async function codingTimeToday() {
  const { data } = await api.get<WakatimeToday>('/wakatime/today/')
  const total = data?.data?.grand_total?.text ?? '0 mins'
  const projects = (data?.data?.projects ?? []).slice(0, 5)

  return (
    `## Coding time today\n**${total}**\n` +
    (projects.length > 0
      ? projects.map((project) => `- ${project.name} — ${project.text}`).join('\n') + '\n'
      : '')
  )
}

function Pill({
  onClick,
  icon: Icon,
  outlined,
  busy,
  children,
}: {
  onClick: () => void
  icon: typeof CalendarIcon
  outlined?: boolean
  busy?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={`flex items-center gap-2 rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors disabled:cursor-wait disabled:opacity-60 ${
        outlined
          ? 'border border-line-strong text-ink-2 hover:border-ink-3 hover:text-ink'
          : 'bg-ink/6 text-ink-2 hover:bg-ink/10 hover:text-ink'
      }`}
    >
      {busy ? (
        <UpdateIcon className="h-3.5 w-3.5 animate-spin text-ink-3" />
      ) : (
        <Icon className="h-3.5 w-3.5 text-ink-3" />
      )}
      {children}
    </button>
  )
}

export default function NoteStarters({
  hasTitle,
  onApply,
}: {
  hasTitle: boolean
  onApply: (patch: StarterPatch) => void
}) {
  const user = useDashboardUser()
  const [busy, setBusy] = useState<'commits' | 'time' | null>(null)
  const [failed, setFailed] = useState<string | null>(null)

  async function pull(kind: 'commits' | 'time') {
    setBusy(kind)
    setFailed(null)

    try {
      const body = kind === 'commits' ? await commitsToday() : await codingTimeToday()
      onApply({ body })
    } catch {
      setFailed(
        kind === 'commits'
          ? 'Could not reach GitHub right now.'
          : 'Could not reach WakaTime right now.',
      )
    } finally {
      setBusy(null)
    }
  }

  const sources = [
    user?.github_connected && (
      <Pill
        key="commits"
        outlined
        icon={GitHubLogoIcon}
        busy={busy === 'commits'}
        onClick={() => void pull('commits')}
      >
        Today&apos;s commits
      </Pill>
    ),
    user?.wakatime_connected && (
      <Pill
        key="time"
        outlined
        icon={TimerIcon}
        busy={busy === 'time'}
        onClick={() => void pull('time')}
      >
        Today&apos;s coding time
      </Pill>
    ),
  ].filter(Boolean)

  return (
    <div className="mt-10 flex flex-col gap-8">
      <section>
        <p className="text-[14px] text-ink-3">Start from a template</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TEMPLATES.map(({ id, label, icon, title, body }) => (
            <Pill
              key={id}
              icon={icon}
              onClick={() =>
                onApply({ body, title: hasTitle ? undefined : title() })
              }
            >
              {label}
            </Pill>
          ))}
        </div>
      </section>

      {sources.length > 0 && (
        <section>
          <p className="text-[14px] text-ink-3">Or pull in today&apos;s work</p>
          <div className="mt-3 flex flex-wrap gap-2">{sources}</div>
          {failed && <p className="mt-3 text-[13px] text-danger">{failed}</p>}
        </section>
      )}
    </div>
  )
}
