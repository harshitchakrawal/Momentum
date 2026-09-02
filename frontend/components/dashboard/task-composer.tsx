'use client'

import { useEffect, useRef, useState } from 'react'
import {
  CalendarIcon,
  Cross2Icon,
  DotFilledIcon,
  PlusIcon,
  TextAlignLeftIcon,
  BookmarkIcon,
  CheckIcon,
} from '@radix-ui/react-icons'

export type Priority = 'high' | 'mid' | 'low'

export const PRIORITIES: Priority[] = ['high', 'mid', 'low']

export interface NewTaskInput {
  title: string
  description: string
  due: string
  priority: Priority
  labels: string[]
}

export const PRIORITY_META: Record<
  Priority,
  { label: string; color: string; rank: number }
> = {
  high: { label: 'High', color: 'var(--prio-high)', rank: 0 },
  mid: { label: 'Mid', color: 'var(--prio-mid)', rank: 1 },
  low: { label: 'Low', color: 'var(--prio-low)', rank: 2 },
}

export function formatDue(due: string) {
  const date = new Date(`${due}T00:00:00`)
  if (Number.isNaN(date.getTime())) return due

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((date.getTime() - today.getTime()) / 86_400_000)

  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  })
}

function useDismiss(onDismiss: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  const latest = useRef(onDismiss)
  latest.current = onDismiss

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        latest.current()
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') latest.current()
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return ref
}

function Chip({
  active,
  onClick,
  children,
  color,
}: {
  active?: boolean
  onClick: () => void
  children: React.ReactNode
  color?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[14px] transition-colors ${
        active
          ? 'border-line-strong bg-ink/6 text-ink'
          : 'border-line text-ink-3 hover:border-line-strong hover:text-ink'
      }`}
      style={active && color ? { color } : undefined}
    >
      {children}
    </button>
  )
}

function Popover({
  onClose,
  children,
}: {
  onClose: () => void
  children: React.ReactNode
}) {
  const ref = useDismiss(onClose)

  return (
    <div
      ref={ref}
      className="absolute left-0 top-full z-20 mt-1.5 min-w-52 rounded-lg border border-line-strong bg-raised p-1 shadow-[0_16px_40px_rgba(0,0,0,0.6)]"
    >
      {children}
    </div>
  )
}

function MenuItem({
  onClick,
  icon,
  children,
  checked,
}: {
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
  checked?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-[14px] text-ink-2 transition-colors hover:bg-ink/6 hover:text-ink"
    >
      <span className="shrink-0 text-ink-3">{icon}</span>
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {checked && <CheckIcon className="h-4 w-4 shrink-0 text-ink-3" />}
    </button>
  )
}

const EMPTY: NewTaskInput = {
  title: '',
  description: '',
  due: '',
  priority: 'low',
  labels: [],
}

export default function TaskComposer({
  onAdd,
}: {
  onAdd: (input: NewTaskInput) => void
}) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<NewTaskInput>(EMPTY)
  const [menu, setMenu] = useState<'add' | 'date' | 'priority' | null>(null)
  const [showDescription, setShowDescription] = useState(false)
  const [showLabels, setShowLabels] = useState(false)
  const [labelDraft, setLabelDraft] = useState('')

  const titleRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) titleRef.current?.focus()
  }, [open])

  function reset() {
    setDraft(EMPTY)
    setLabelDraft('')
    setShowDescription(false)
    setShowLabels(false)
    setMenu(null)
  }

  function close() {
    reset()
    setOpen(false)
  }

  function submit() {
    const title = draft.title.trim()
    if (!title) return

    onAdd({
      ...draft,
      title,
      description: draft.description.trim(),
      labels: draft.labels,
    })
    reset()
    titleRef.current?.focus()
  }

  function addLabel() {
    const label = labelDraft.trim().replace(/^@/, '')
    if (!label || draft.labels.includes(label)) return
    setDraft((d) => ({ ...d, labels: [...d.labels, label] }))
    setLabelDraft('')
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group flex w-full items-center gap-2.5 rounded-lg px-2 py-2.5 text-left text-[15px] text-ink-3 transition-colors hover:text-ink"
      >
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-ink-3 transition-colors group-hover:bg-invert/90 group-hover:text-invert-ink">
          <PlusIcon className="h-3.5 w-3.5" />
        </span>
        Add task
      </button>
    )
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
      className="rounded-lg border border-line-strong bg-surface p-3"
    >
      <div className="flex items-start gap-2">
        <input
          ref={titleRef}
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          placeholder="Fix the token refresh race in api.ts"
          aria-label="Task name"
          className="min-w-0 flex-1 bg-transparent px-1 py-1 text-[16px] text-ink outline-none placeholder:text-ink-4"
        />
        <button
          type="button"
          onClick={close}
          title="Close"
          className="shrink-0 rounded p-1.5 text-ink-3 transition-colors hover:bg-ink/6 hover:text-ink"
        >
          <Cross2Icon className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>

      {showDescription && (
        <textarea
          value={draft.description}
          onChange={(e) =>
            setDraft((d) => ({ ...d, description: e.target.value }))
          }
          placeholder="Description"
          aria-label="Description"
          rows={2}
          className="mt-1 w-full resize-none bg-transparent px-1 text-[14px] text-ink-2 outline-none placeholder:text-ink-4"
        />
      )}

      {showLabels && (
        <div className="mt-2 px-1">
          <div className="flex flex-wrap items-center gap-1.5">
            {draft.labels.map((label) => (
              <span
                key={label}
                className="flex items-center gap-1 rounded border border-line-strong px-1.5 py-0.5 text-[13px] text-ink-2"
              >
                @{label}
                <button
                  type="button"
                  onClick={() =>
                    setDraft((d) => ({
                      ...d,
                      labels: d.labels.filter((l) => l !== label),
                    }))
                  }
                  className="text-ink-4 transition-colors hover:text-danger"
                >
                  <Cross2Icon className="h-3 w-3" />
                  <span className="sr-only">Remove {label}</span>
                </button>
              </span>
            ))}
            <input
              value={labelDraft}
              onChange={(e) => setLabelDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault()
                  addLabel()
                }
              }}
              placeholder="Add a label"
              aria-label="Add a label"
              className="min-w-28 flex-1 bg-transparent text-[13px] text-ink-2 outline-none placeholder:text-ink-4"
            />
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <div className="relative">
          <Chip onClick={() => setMenu(menu === 'add' ? null : 'add')}>
            <PlusIcon className="h-3.5 w-3.5" />
          </Chip>

          {menu === 'add' && (
            <Popover onClose={() => setMenu(null)}>
              <MenuItem
                icon={<TextAlignLeftIcon className="h-4 w-4" />}
                checked={showDescription}
                onClick={() => {
                  setShowDescription((v) => !v)
                  setMenu(null)
                }}
              >
                Description
              </MenuItem>
              <MenuItem
                icon={<BookmarkIcon className="h-4 w-4" />}
                checked={showLabels}
                onClick={() => {
                  setShowLabels((v) => !v)
                  setMenu(null)
                }}
              >
                Labels
              </MenuItem>
            </Popover>
          )}
        </div>

        <div className="relative">
          <Chip
            active={draft.due !== ''}
            onClick={() => setMenu(menu === 'date' ? null : 'date')}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {draft.due ? formatDue(draft.due) : 'Date'}
          </Chip>

          {menu === 'date' && (
            <Popover onClose={() => setMenu(null)}>
              <div className="p-2">
                <input
                  type="date"
                  value={draft.due}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, due: e.target.value }))
                  }
                  aria-label="Due date"
                  className="w-full rounded-md border border-line-strong bg-surface px-2.5 py-2 text-[14px] text-ink outline-none"
                />
                {draft.due && (
                  <button
                    type="button"
                    onClick={() => {
                      setDraft((d) => ({ ...d, due: '' }))
                      setMenu(null)
                    }}
                    className="mt-1.5 w-full rounded-md px-2.5 py-1.5 text-left text-[14px] text-ink-3 transition-colors hover:bg-ink/6 hover:text-ink"
                  >
                    Clear date
                  </button>
                )}
              </div>
            </Popover>
          )}
        </div>

        <div className="relative">
          <Chip
            active={draft.priority !== 'low'}
            color={PRIORITY_META[draft.priority].color}
            onClick={() => setMenu(menu === 'priority' ? null : 'priority')}
          >
            <DotFilledIcon
              className="h-3.5 w-3.5"
              style={{ color: PRIORITY_META[draft.priority].color }}
            />
            {PRIORITY_META[draft.priority].label}
          </Chip>

          {menu === 'priority' && (
            <Popover onClose={() => setMenu(null)}>
              {PRIORITIES.map((level) => (
                <MenuItem
                  key={level}
                  icon={
                    <DotFilledIcon
                      className="h-4 w-4"
                      style={{ color: PRIORITY_META[level].color }}
                    />
                  }
                  checked={draft.priority === level}
                  onClick={() => {
                    setDraft((d) => ({ ...d, priority: level }))
                    setMenu(null)
                  }}
                >
                  {PRIORITY_META[level].label}
                </MenuItem>
              ))}
            </Popover>
          )}
        </div>
      </div>

      <div className="mt-3 flex justify-end gap-2 border-t border-line pt-3">
        <button
          type="button"
          onClick={close}
          className="rounded-md px-3.5 py-2 text-[14px] font-medium text-ink-3 transition-colors hover:bg-ink/6 hover:text-ink"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={draft.title.trim() === ''}
          className="rounded-md bg-invert px-3.5 py-2 text-[14px] font-semibold text-invert-ink transition-colors hover:bg-invert/90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add task
        </button>
      </div>
    </form>
  )
}
