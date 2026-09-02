'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarIcon } from '@radix-ui/react-icons'
import { Trash2 } from 'lucide-react'
import HandCheckbox from './hand-checkbox'
import TaskComposer, {
  PRIORITY_META,
  formatDue,
  type NewTaskInput,
  type Priority,
} from './task-composer'

export interface Task extends NewTaskInput {
  id: string
  done: boolean
  createdAt: string
}

type Filter = 'all' | 'active' | 'done'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Done' },
]

function newId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function normalise(raw: unknown): Task[] {
  if (!Array.isArray(raw)) return []

  return raw.map((task) => ({
    id: String(task?.id ?? newId()),
    title: String(task?.title ?? ''),
    description: String(task?.description ?? ''),
    due: String(task?.due ?? ''),
    priority: migratePriority(task?.priority),
    labels: Array.isArray(task?.labels) ? task.labels.map(String) : [],
    done: Boolean(task?.done),
    createdAt: String(task?.createdAt ?? new Date().toISOString()),
  }))
}

const LEGACY_PRIORITY: Record<number, Priority> = {
  1: 'high',
  2: 'mid',
  3: 'low',
  4: 'low',
}

function migratePriority(raw: unknown): Priority {
  if (raw === 'high' || raw === 'mid' || raw === 'low') return raw
  if (typeof raw === 'number' && raw in LEGACY_PRIORITY) return LEGACY_PRIORITY[raw]
  return 'low'
}

function isOverdue(due: string) {
  if (!due) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(`${due}T00:00:00`).getTime() < today.getTime()
}

export default function TaskList({ storageKey }: { storageKey: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loaded, setLoaded] = useState(false)
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    setLoaded(false)
    try {
      const raw = localStorage.getItem(storageKey)
      setTasks(raw ? normalise(JSON.parse(raw)) : [])
    } catch {
      setTasks([])
    }
    setLoaded(true)
  }, [storageKey])

  useEffect(() => {
    if (!loaded) return
    try {
      localStorage.setItem(storageKey, JSON.stringify(tasks))
    } catch {
      // A full or blocked store shouldn't take the page down.
    }
  }, [tasks, loaded, storageKey])

  const remaining = useMemo(() => tasks.filter((t) => !t.done).length, [tasks])

  const visible = useMemo(() => {
    const rows =
      filter === 'active'
        ? tasks.filter((t) => !t.done)
        : filter === 'done'
          ? tasks.filter((t) => t.done)
          : tasks

    return [...rows].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1
      const rank =
        PRIORITY_META[a.priority].rank - PRIORITY_META[b.priority].rank
      if (rank !== 0) return rank
      return 0
    })
  }, [tasks, filter])

  function addTask(input: NewTaskInput) {
    setTasks((current) => [
      { ...input, id: newId(), done: false, createdAt: new Date().toISOString() },
      ...current,
    ])
  }

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    )
  }

  function removeTask(id: string) {
    setTasks((current) => current.filter((t) => t.id !== id))
  }

  return (
    <>
      {tasks.length > 0 && (
        <div className="mb-4 flex flex-w417317
        ap items-center justify-between gap-3">
          <div className="flex gap-1">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={`rounded-md px-2.5 py-1 text-[14px] transition-colors ${
                  filter === value
                    ? 'bg-ink/6 text-ink'
                    : 'text-ink-3 hover:bg-ink/4 hover:text-ink'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <p className="text-[13px] text-ink-3">
            {remaining} of {tasks.length} left
          </p>
        </div>
      )}

      {!loaded ? null : visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line-strong px-4 py-10 text-center text-[14px] text-ink-3">
          {tasks.length === 0
            ? 'Nothing here yet. Add the first thing you want to ship.'
            : filter === 'done'
              ? 'Nothing finished yet.'
              : 'All done here.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((task) => (
            <li
              key={task.id}
              className="group flex gap-3 rounded-lg border border-line bg-surface px-4 py-3.5 transition-colors hover:border-line-strong"
            >
              <label className="mt-px flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task.id)}
                  aria-label={`Mark "${task.title}" as ${task.done ? 'not done' : 'done'}`}
                  className="peer sr-only"
                />
                <HandCheckbox
                  checked={task.done}
                  className={`h-6 w-6 transition-colors peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink-3 ${
                    task.done ? 'text-ink' : 'text-ink-3'
                  }`}
                />
              </label>

              <span
                title={`${PRIORITY_META[task.priority].label} priority`}
                className="mt-2 -mr-1 h-2 w-2 shrink-0 rounded-full transition-opacity"
                style={{
                  backgroundColor: PRIORITY_META[task.priority].color,
                  opacity: task.done ? 0.35 : 1,
                }}
              >
                <span className="sr-only">
                  {PRIORITY_META[task.priority].label} priority
                </span>
              </span>

              <div className="min-w-0 flex-1">
                <p
                  className={`wrap-break-word text-[15px] transition-colors ${
                    task.done ? 'text-ink-4 line-through' : 'text-ink-2'
                  }`}
                >
                  {task.title}
                </p>

                {task.description && (
                  <p className="mt-1 wrap-break-word text-[13px] text-ink-3">
                    {task.description}
                  </p>
                )}

                {task.labels.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {task.labels.map((label) => (
                      <span key={label} className="text-[13px] text-ink-3">
                        @{label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-3 self-center">
                {task.due && (
                  <span
                    className="flex items-center gap-1.5 text-[14px] whitespace-nowrap"
                    style={{
                      color:
                        !task.done && isOverdue(task.due)
                          ? 'var(--prio-high)'
                          : 'var(--ink-3)',
                    }}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {formatDue(task.due)}
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  title={`Delete "${task.title}"`}
                  className="rounded-md p-1.5 text-ink-4 transition-colors hover:bg-ink/6 hover:text-danger"
                >
                  <Trash2 className="h-5 w-5" strokeWidth={1.8} />
                  <span className="sr-only">Delete</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-2">
        <TaskComposer onAdd={addTask} />
      </div>
    </>
  )
}
