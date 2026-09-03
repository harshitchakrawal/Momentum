'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useSWR from 'swr'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import {
  CaretSortIcon,
  DrawingPinFilledIcon,
  DrawingPinIcon,
  FilePlusIcon,
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
} from '@radix-ui/react-icons'
import { api, fetcher } from '@/lib/api'
import { Popover, MenuItem } from './menu'
import NoteEditor from './note-editor'

const KEY = '/notes/'

const EASE = [0.22, 1, 0.36, 1] as const

export interface Note {
  id: number
  title: string
  body: string
  tags: string[]
  pinned: boolean
  created_at: string
  updated_at: string
}

export interface NoteDraft {
  title: string
  body: string
}

export type SaveStatus = 'saving' | 'saved' | 'error'

const EMPTY_DRAFT: NoteDraft = { title: '', body: '' }

const SCRATCH: Note = {
  id: 0,
  title: '',
  body: '',
  tags: [],
  pinned: false,
  created_at: '',
  updated_at: '',
}

type Sort = 'updated' | 'created' | 'title'

const SORTS: { value: Sort; label: string }[] = [
  { value: 'updated', label: 'Recently edited' },
  { value: 'created', label: 'Recently added' },
  { value: 'title', label: 'Title' },
]

type Filter = 'all' | 'pinned' | 'tagged'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All notes' },
  { value: 'pinned', label: 'Pinned' },
  { value: 'tagged', label: 'With tags' },
]

function normalise(raw: unknown): Note[] {
  if (!Array.isArray(raw)) return []

  return raw.map((note) => ({
    id: Number(note?.id),
    title: String(note?.title ?? ''),
    body: String(note?.body ?? ''),
    tags: Array.isArray(note?.tags) ? note.tags.map(String) : [],
    pinned: Boolean(note?.pinned),
    created_at: String(note?.created_at ?? ''),
    updated_at: String(note?.updated_at ?? note?.created_at ?? ''),
  }))
}

function formatStamp(iso: string) {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''

  const minutes = Math.round((Date.now() - then) / 60_000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} minutes ago`

  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d ago`

  const date = new Date(then)
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year:
      date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
  })
}

function snippet(body: string) {
  return body.replace(/\s+/g, ' ').trim()
}

function isBlank(draft: NoteDraft) {
  return draft.title.trim() === '' && draft.body.trim() === ''
}

export default function NotesWorkspace() {
  const { data, isLoading, error, mutate } = useSWR<unknown>(KEY, fetcher)

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [draft, setDraft] = useState<NoteDraft | null>(null)
  const [scratch, setScratch] = useState<NoteDraft | null>(null)
  const [status, setStatus] = useState<SaveStatus>('saved')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<Sort>('updated')
  const [filter, setFilter] = useState<Filter>('all')
  const [menu, setMenu] = useState<'sort' | 'filter' | null>(null)
  const [pane, setPane] = useState<'list' | 'editor'>('list')
  const [createFailed, setCreateFailed] = useState(false)
  const [editorKey, setEditorKey] = useState('scratch')

  const titleRef = useRef<HTMLInputElement>(null)
  const creatingRef = useRef(false)

  const notes = useMemo(() => normalise(data), [data])

  const notesRef = useRef(notes)
  notesRef.current = notes

  const scratchRef = useRef(scratch)
  scratchRef.current = scratch

  const selected = notes.find((note) => note.id === selectedId) ?? null

  useEffect(() => {
    if (isLoading || scratch !== null) return

    const fallback = notes.find((note) => note.id === selectedId) ?? notes[0]

    if (!fallback) {
      setSelectedId(null)
      setDraft(null)
      setScratch(EMPTY_DRAFT)
      return
    }

    if (fallback.id === selectedId) return

    setSelectedId(fallback.id)
    setDraft({ title: fallback.title, body: fallback.body })
    setEditorKey(String(fallback.id))
    setStatus('saved')
  }, [isLoading, notes, selectedId, scratch])

  const dirty =
    selected !== null &&
    draft !== null &&
    (draft.title !== selected.title || draft.body !== selected.body)

  const persist = useCallback(
    async (id: number, patch: Partial<Note>) => {
      setStatus('saving')

      try {
        await api.patch(`${KEY}${id}/`, patch)
        await mutate(
          notesRef.current.map((note) =>
            note.id === id
              ? { ...note, ...patch, updated_at: new Date().toISOString() }
              : note,
          ),
          { revalidate: false },
        )
        setStatus('saved')
      } catch {
        setStatus('error')
      }
    },
    [mutate],
  )

  useEffect(() => {
    if (!dirty || !selected || !draft) return

    const id = selected.id
    const patch = { title: draft.title, body: draft.body }
    const timer = setTimeout(() => void persist(id, patch), 700)

    return () => clearTimeout(timer)
  }, [dirty, draft, selected, persist])

  function select(note: Note) {
    setSelectedId(note.id)
    setDraft({ title: note.title, body: note.body })
    setScratch(null)
    setEditorKey(String(note.id))
    setStatus('saved')
    setPane('editor')
  }

  function startScratch() {
    setSelectedId(null)
    setDraft(null)
    setScratch(EMPTY_DRAFT)
    setEditorKey(`scratch-${Date.now()}`)
    setStatus('saved')
    setCreateFailed(false)
    setQuery('')
    setPane('editor')
    requestAnimationFrame(() => titleRef.current?.focus())
  }

  async function createNote(initial: Partial<Note>) {
    if (creatingRef.current) return
    creatingRef.current = true

    setCreateFailed(false)
    setStatus('saving')

    try {
      const response = await api.post(KEY, {
        title: '',
        body: '',
        tags: [],
        pinned: false,
        ...initial,
      })
      const [note] = normalise([response.data])
      if (!note) return

      await mutate([note, ...notesRef.current], { revalidate: false })

      const latest = scratchRef.current
      setSelectedId(note.id)
      setDraft(latest ?? { title: note.title, body: note.body })
      setScratch(null)
      setStatus('saved')
      setPane('editor')
    } catch {
      setCreateFailed(true)
      setStatus('error')
    } finally {
      creatingRef.current = false
    }
  }

  function editScratch(next: NoteDraft) {
    setScratch(next)

    if (createFailed || creatingRef.current || isBlank(next)) return
    void createNote({ title: next.title, body: next.body })
  }

  function removeNote(id: number) {
    const next = notesRef.current.filter((note) => note.id !== id)

    if (next.length > 0) select(next[0])
    else startScratch()

    mutate(
      async () => {
        await api.delete(`${KEY}${id}/`)
        return undefined
      },
      { optimisticData: next, rollbackOnError: true, populateCache: false },
    )
  }

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()

    const scoped =
      filter === 'pinned'
        ? notes.filter((note) => note.pinned)
        : filter === 'tagged'
          ? notes.filter((note) => note.tags.length > 0)
          : notes

    const rows =
      needle === ''
        ? scoped
        : scoped.filter(
            (note) =>
              note.title.toLowerCase().includes(needle) ||
              note.body.toLowerCase().includes(needle) ||
              note.tags.some((tag) => tag.toLowerCase().includes(needle)),
          )

    const byStamp = (a: string, b: string) => (a < b ? 1 : a > b ? -1 : 0)

    return [...rows].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      if (sort === 'created') return byStamp(a.created_at, b.created_at)
      if (sort === 'title')
        return (a.title || 'Untitled').localeCompare(b.title || 'Untitled')
      return byStamp(a.updated_at, b.updated_at)
    })
  }, [notes, query, sort, filter])

  const editing = selected && draft ? { note: selected, draft } : null
  const scratching = !editing && scratch !== null ? scratch : null

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-[calc(100vh-15rem)] min-h-150 overflow-hidden rounded-xl border border-line-strong bg-page">
        <aside
          className={`w-full shrink-0 flex-col border-line bg-surface md:flex md:w-80 md:border-r ${
            pane === 'editor' ? 'hidden' : 'flex'
          }`}
        >
          <div className="px-5 pt-6">
            <div className="flex items-baseline gap-2.5">
              <h2 className="text-[21px] font-semibold tracking-tight text-ink">
                {FILTERS.find((option) => option.value === filter)?.label}
              </h2>
              <span className="text-[14px] text-ink-4">{visible.length}</span>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={startScratch}
                className="flex items-center gap-2 rounded-md bg-invert px-3 py-2 text-[14px] font-semibold text-invert-ink transition-colors hover:bg-invert/90"
              >
                <FilePlusIcon className="h-4 w-4" />
                New note
              </button>

              <div className="flex items-center gap-0.5">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setMenu((open) => (open === 'filter' ? null : 'filter'))
                    }
                    aria-expanded={menu === 'filter'}
                    title="Filter"
                    className={`rounded-md p-2 transition-colors hover:bg-ink/6 hover:text-ink ${
                      filter === 'all' ? 'text-ink-3' : 'text-ink'
                    }`}
                  >
                    <MixerHorizontalIcon className="h-4 w-4" />
                    <span className="sr-only">Filter notes</span>
                  </button>

                  {menu === 'filter' && (
                    <Popover align="right" onClose={() => setMenu(null)}>
                      {FILTERS.map(({ value, label }) => (
                        <MenuItem
                          key={value}
                          checked={filter === value}
                          icon={
                            value === 'pinned' ? (
                              <DrawingPinIcon className="h-4 w-4" />
                            ) : undefined
                          }
                          onClick={() => {
                            setFilter(value)
                            setMenu(null)
                          }}
                        >
                          {label}
                        </MenuItem>
                      ))}
                    </Popover>
                  )}
                </div>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setMenu((open) => (open === 'sort' ? null : 'sort'))
                    }
                    aria-expanded={menu === 'sort'}
                    title={`Sort: ${SORTS.find((option) => option.value === sort)?.label}`}
                    className="rounded-md p-2 text-ink-3 transition-colors hover:bg-ink/6 hover:text-ink"
                  >
                    <CaretSortIcon className="h-4 w-4" />
                    <span className="sr-only">Sort notes</span>
                  </button>

                  {menu === 'sort' && (
                    <Popover align="right" onClose={() => setMenu(null)}>
                      {SORTS.map(({ value, label }) => (
                        <MenuItem
                          key={value}
                          checked={sort === value}
                          onClick={() => {
                            setSort(value)
                            setMenu(null)
                          }}
                        >
                          {label}
                        </MenuItem>
                      ))}
                    </Popover>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-4">
            <div className="flex items-center gap-2 rounded-md border border-line bg-page px-3 py-2.5 transition-colors focus-within:border-line-strong">
              <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-ink-4" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search notes"
                aria-label="Search notes"
                className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-4"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
            {createFailed && (
              <p className="mb-3 px-2 text-[13px] text-danger">
                Could not save the note. Check that the notes API is running.
              </p>
            )}

            {isLoading ? null : error ? (
              <p className="px-2 py-10 text-center text-[14px] text-danger">
                Could not load your notes. Is <code>/api/notes/</code> set up
                on the backend?
              </p>
            ) : visible.length === 0 ? (
              <p className="px-2 py-10 text-center text-[14px] text-ink-3">
                {notes.length === 0
                  ? 'No notes yet. Your first one is waiting on the right.'
                  : query.trim() !== ''
                    ? 'Nothing matches that search.'
                    : filter === 'pinned'
                      ? 'No pinned notes yet.'
                      : 'No tagged notes yet.'}
              </p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                <AnimatePresence initial={false}>
                  {visible.map((note) => (
                    <motion.li
                      key={note.id}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.22, ease: EASE }}
                    >
                      <button
                        type="button"
                        onClick={() => select(note)}
                        aria-current={note.id === selectedId}
                        className={`w-full rounded-lg border px-4 py-3.5 text-left transition-colors ${
                          note.id === selectedId
                            ? 'border-line-strong bg-raised'
                            : 'border-transparent hover:bg-ink/6'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {note.pinned && (
                            <DrawingPinFilledIcon className="h-3.5 w-3.5 shrink-0 text-ink-3" />
                          )}
                          <p className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ink">
                            {note.id === selectedId && draft
                              ? draft.title.trim() || 'Untitled'
                              : note.title.trim() || 'Untitled'}
                          </p>
                        </div>

                        {snippet(note.body) !== '' && (
                          <p className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-ink-3">
                            {snippet(note.body)}
                          </p>
                        )}

                        <p className="mt-3 text-[13px] text-ink-4">
                          {formatStamp(note.updated_at)}
                        </p>
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        </aside>

        <section
          className={`min-w-0 flex-1 flex-col md:flex ${
            pane === 'list' ? 'hidden' : 'flex'
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {editing ? (
              <motion.div
                key={editorKey}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: EASE }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <NoteEditor
                  note={editing.note}
                  draft={editing.draft}
                  status={status}
                  dirty={dirty}
                  titleRef={titleRef}
                  onChange={setDraft}
                  onBack={() => setPane('list')}
                  onTogglePin={() =>
                    void persist(editing.note.id, {
                      pinned: !editing.note.pinned,
                    })
                  }
                  onDelete={() => removeNote(editing.note.id)}
                  onAddTag={(raw) => {
                    const tag = raw.trim().replace(/^#/, '')
                    if (tag === '' || editing.note.tags.includes(tag)) return
                    void persist(editing.note.id, {
                      tags: [...editing.note.tags, tag],
                    })
                  }}
                  onRemoveTag={(tag) =>
                    void persist(editing.note.id, {
                      tags: editing.note.tags.filter((item) => item !== tag),
                    })
                  }
                />
              </motion.div>
            ) : scratching ? (
              <motion.div
                key={editorKey}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: EASE }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <NoteEditor
                  note={SCRATCH}
                  draft={scratching}
                  status={status}
                  dirty={!isBlank(scratching)}
                  titleRef={titleRef}
                  onChange={editScratch}
                  onBack={() => setPane('list')}
                  onTogglePin={() =>
                    void createNote({ ...scratching, pinned: true })
                  }
                  onDelete={startScratch}
                  onAddTag={(raw) => {
                    const tag = raw.trim().replace(/^#/, '')
                    if (tag === '') return
                    void createNote({ ...scratching, tags: [tag] })
                  }}
                  onRemoveTag={() => undefined}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>
      </div>
    </MotionConfig>
  )
}
