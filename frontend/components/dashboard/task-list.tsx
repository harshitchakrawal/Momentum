'use client'

import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { CalendarIcon, ChevronDownIcon } from '@radix-ui/react-icons'
import { Trash2 } from 'lucide-react'
import { api, fetcher } from '@/lib/api'
import HandCheckbox from './hand-checkbox'
import MarkerUnderline from './marker-underline'
import { Popover, MenuItem } from './menu'
import TaskComposer, {
  PRIORITY_META,
  formatDue,
  type NewTaskInput,
  type Priority,
} from './task-composer'

const KEY = '/tasks/'

export interface Task extends NewTaskInput {
  id: number
  done: boolean
  created_at: string
}

type Filter = 'all' | 'active' | 'done'
type Sort = 'priority' | 'due' | 'added'

const SORTS: { value: Sort; label: string }[] = [
  { value: 'priority', label: 'Priority' },
  { value: 'due', label: 'Due date' },
  { value: 'added', label: 'Recently added' },
]

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'done', label: 'Done' },
]

function isPriority(raw: unknown): raw is Priority {
  return raw === 'high' || raw === 'mid' || raw === 'low'
}

// The API sends null for "no due date"; the UI works in empty strings, so the
// two are translated here and in toPayload rather than everywhere downstream.
function normalise(raw: unknown): Task[] {
  if (!Array.isArray(raw)) return []

  return raw.map((task) => ({
    id: Number(task?.id),
    title: String(task?.title ?? ''),
    description: String(task?.description ?? ''),
    due: task?.due ? String(task.due) : '',
    priority: isPriority(task?.priority) ? task.priority : 'low',
    labels: Array.isArray(task?.labels) ? task.labels.map(String) : [],
    done: Boolean(task?.done),
    created_at: String(task?.created_at ?? ''),
  }))
}

function toPayload(input: NewTaskInput) {
  return { ...input, due: input.due === '' ? null : input.due }
}

function isOverdue(due: string) {
  if (!due) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(`${due}T00:00:00`).getTime() < today.getTime()
}

export default function TaskList() {
  const { data, isLoading, error, mutate } = useSWR<unknown>(KEY, fetcher)
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('priority')
  const [sortOpen, setSortOpen] = useState(false)

  const tasks = useMemo(() => normalise(data), [data])

  const remaining = useMemo(() => tasks.filter((t) => !t.done).length, [tasks])

  const visible = useMemo(() => {
    const rows =
      filter === 'active'
        ? tasks.filter((t) => !t.done)
        : filter === 'done'
          ? tasks.filter((t) => t.done)
          : tasks

    const byPriority = (a: Task, b: Task) =>
      PRIORITY_META[a.priority].rank - PRIORITY_META[b.priority].rank

    // A task with no due date sorts last rather than first, which is what an
    // empty string would do on a plain compare.
    const byDue = (a: Task, b: Task) => {
      if (a.due === b.due) return 0
      if (!a.due) return 1
      if (!b.due) return -1
      return a.due < b.due ? -1 : 1
    }

    const byAdded = (a: Task, b: Task) => (a.created_at < b.created_at ? 1 : -1)

    return [...rows].sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1

      if (sort === 'priority') return byPriority(a, b) || byDue(a, b)
      if (sort === 'due') return byDue(a, b) || byPriority(a, b)
      return byAdded(a, b)
    })
  }, [tasks, filter, sort])

  async function addTask(input: NewTaskInput) {
    // No optimistic row here: the id comes from the server, and inventing a
    // temporary one would break the delete/toggle calls keyed on it.
    await api.post(KEY, toPayload(input))
    mutate()
  }

  function toggleTask(task: Task) {
    const next = tasks.map((t) =>
      t.id === task.id ? { ...t, done: !t.done } : t,
    )

    mutate(
      async () => {
        await api.patch(`${KEY}${task.id}/`, { done: !task.done })
        return undefined
      },
      { optimisticData: next, rollbackOnError: true, populateCache: false },
    )
  }

  function removeTask(id: number) {
    const next = tasks.filter((t) => t.id !== id)

    mutate(
      async () => {
        await api.delete(`${KEY}${id}/`)
        return undefined
      },
      { optimisticData: next, rollbackOnError: true, populateCache: false },
    )
  }

  return (
    <>
      {tasks.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-5">
            {FILTERS.map(({ value, label }, index) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                aria-pressed={filter === value}
                className={`relative px-0.5 pb-2 text-[15px] ${
                  filter === value ? 'text-ink' : 'text-ink-3'
                }`}
              >
                {label}
                {filter === value && (
                  <MarkerUnderline
                    variant={index}
                    className="pointer-events-none absolute bottom-0 left-0 h-2 w-full text-ink"
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setSortOpen((open) => !open)}
                aria-expanded={sortOpen}
                className="flex items-center gap-1.5 text-[15px] text-ink-3 transition-colors hover:text-ink"
              >
                Sort:{' '}
                <span className="text-ink-2">
                  {SORTS.find((s) => s.value === sort)?.label}
                </span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>

              {sortOpen && (
                <Popover align="right" onClose={() => setSortOpen(false)}>
                  {SORTS.map(({ value, label }) => (
                    <MenuItem
                      key={value}
                      checked={sort === value}
                      onClick={() => {
                        setSort(value)
                        setSortOpen(false)
                      }}
                    >
                      {label}
                    </MenuItem>
                  ))}
                </Popover>
              )}
            </div>

            <p className="text-[14px] text-ink-3">
              {remaining} of {tasks.length} left
            </p>
          </div>
        </div>
      )}

      {isLoading ? null : error ? (
        <p className="rounded-lg border border-dashed border-danger-line px-4 py-10 text-center text-[15px] text-danger">
          Could not load your tasks. Refresh to try again.
        </p>
      ) : visible.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line-strong px-4 py-10 text-center text-[15px] text-ink-3">
          {tasks.length === 0
            ? 'Nothing here yet. Add the first thing you want to ship.'
            : filter === 'done'
              ? 'Nothing finished yet.'
              : 'All done here.'}
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {visible.map((task, index) => (
            <li
              key={task.id}
              className="group flex gap-3 px-1 py-2"
            >
              <label className="mt-px flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded">
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => toggleTask(task)}
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
                <div className="relative inline-block max-w-full pb-2">
                  <p
                    className={`wrap-break-word text-[16px] transition-colors ${
                      task.done ? 'text-ink-4 line-through' : 'text-ink-2'
                    }`}
                  >
                    {task.title}
                  </p>

                  <MarkerUnderline
                    variant={index}
                    className={`pointer-events-none absolute bottom-0 left-0 h-2 w-full transition-colors ${
                      task.done ? 'text-ink-4' : 'text-ink-3'
                    }`}
                  />
                </div>

                {task.description && (
                  <p className="mt-1 wrap-break-word text-[14px] text-ink-3">
                    {task.description}
                  </p>
                )}

                {task.labels.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    {task.labels.map((label) => (
                      <span key={label} className="text-[14px] text-ink-3">
                        @{label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-3 self-center">
                {task.due && (
                  <span
                    className="flex items-center gap-1.5 text-[15px] whitespace-nowrap"
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
