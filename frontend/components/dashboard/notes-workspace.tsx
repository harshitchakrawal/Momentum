'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useSWR from 'swr'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'
import {
  CaretSortIcon,
  DrawingPinFilledIcon,
  DrawingPinIcon,
  MixerHorizontalIcon,
} from '@radix-ui/react-icons'
import { FilePlusCorner } from 'lucide-react'
import { api, fetcher } from '@/lib/api'
import MarkerUnderline from './marker-underline'
import { Popover, MenuItem } from './menu'
import NoteEditor from './note-editor'
import {
  DEFAULT_FONT,
  DEFAULT_SIZE,
  isNoteFont,
  normaliseSize,
  type NoteFont,
} from './note-fonts'

const KEY = '/notes/'

const EASE = [0.22, 1, 0.36, 1] as const

export interface Note {
  id: number
  title: string
  body: string
  tags: string[]
  pinned: boolean
  font: NoteFont
  font_size: number
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
  font: DEFAULT_FONT,
  font_size: DEFAULT_SIZE,
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
  { value: 'all', label: 'Notes' },
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
    font: isNoteFont(note?.font) ? note.font : DEFAULT_FONT,
    font_size: normaliseSize(note?.font_size),
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
  return body
    .replace(/<\/(p|div|li|h[1-6]|blockquote|pre)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function isBlank(draft: NoteDraft) {
  return draft.title.trim() === '' && draft.body.trim() === ''
}

function IconButton({
  label,
  onClick,
  active = false,
  expanded,
  children,
}: {
  label: string
  onClick: () => void
  active?: boolean
  expanded?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className={`group relative rounded-md p-2 transition-colors hover:bg-ink/6 hover:text-ink ${
        active ? 'text-ink' : 'text-ink-3'
      }`}
    >
      {children}
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-full mb-1.5 rounded-md border border-line-strong bg-raised px-2.5 py-1 text-[13px] font-medium whitespace-nowrap text-ink opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-opacity delay-150 group-hover:opacity-100"
      >
        {label}
      </span>
    </button>
  )
}

export default function NotesWorkspace() {
  const { data, isLoading, error, mutate } = useSWR<unknown>(KEY, fetcher)

  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [draft, setDraft] = useState<NoteDraft | null>(null)
  const [scratch, setScratch] = useState<NoteDraft | null>(null)
  const [status, setStatus] = useState<SaveStatus>('saved')
  const [sort, setSort] = useState<Sort>('updated')
  const [filter, setFilter] = useState<Filter>('all')
  const [menu, setMenu] = useState<'sort' | 'filter' | null>(null)
  const [pane, setPane] = useState<'list' | 'editor'>('list')
  const [createFailed, setCreateFailed] = useState(false)
  const [editorKey, setEditorKey] = useState('scratch')

  const titleRef = useRef<HTMLInputElement>(null)
  const creatingRef = useRef(false)
  const scratchStartedAt = useRef('')

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
      scratchStartedAt.current = new Date().toISOString()
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
    scratchStartedAt.current = new Date().toISOString()
    setEditorKey(`scratch-${Date.now()}`)
    setStatus('saved')
    setCreateFailed(false)
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
        font: DEFAULT_FONT,
        font_size: DEFAULT_SIZE,
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

  function discardScratch() {
    const first = notesRef.current[0]
    if (first) select(first)
    else startScratch()
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
    const rows =
      filter === 'pinned'
        ? notes.filter((note) => note.pinned)
        : filter === 'tagged'
          ? notes.filter((note) => note.tags.length > 0)
          : notes

    const byStamp = (a: string, b: string) => (a < b ? 1 : a > b ? -1 : 0)

    return [...rows].sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
      if (sort === 'created') return byStamp(a.created_at, b.created_at)
      if (sort === 'title')
        return (a.title || 'Untitled').localeCompare(b.title || 'Untitled')
      return byStamp(a.updated_at, b.updated_at)
    })
  }, [notes, sort, filter])

  const editing = selected && draft ? { note: selected, draft } : null
  const scratching = !editing && scratch !== null ? scratch : null

  const rows = useMemo(() => {
    if (!scratching) return visible

    return [
      {
        ...SCRATCH,
        title: scratching.title,
        body: scratching.body,
        updated_at: scratchStartedAt.current,
      },
      ...visible,
    ]
  }, [scratching, visible])

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex h-screen min-h-0 flex-1 overflow-hidden bg-page">
        <aside
          className={`w-full shrink-0 flex-col border-line bg-surface md:flex md:w-108 md:border-r ${
            pane === 'editor' ? 'hidden' : 'flex'
          }`}
        >
          <div className="px-5 pt-6">
            <h2 className="relative inline-block text-2xl font-semibold text-ink">
              {FILTERS.find((option) => option.value === filter)?.label}
              <MarkerUnderline className="absolute -bottom-2 left-0 h-2.5 w-full text-ink" />
            </h2>

            <div className="mt-3 flex items-center justify-end">
              <div className="flex items-center gap-0.5">
                <IconButton label="New Note" onClick={startScratch}>
                  <FilePlusCorner className="h-4 w-4" strokeWidth={1.8} />
                </IconButton>

                <div className="relative">
                  <IconButton
                    label="Filter"
                    active={filter !== 'all'}
                    expanded={menu === 'filter'}
                    onClick={() =>
                      setMenu((open) => (open === 'filter' ? null : 'filter'))
                    }
                  >
                    <MixerHorizontalIcon className="h-4 w-4" />
                  </IconButton>

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
                  <IconButton
                    label={`Sort: ${SORTS.find((option) => option.value === sort)?.label}`}
                    expanded={menu === 'sort'}
                    onClick={() =>
                      setMenu((open) => (open === 'sort' ? null : 'sort'))
                    }
                  >
                    <CaretSortIcon className="h-4 w-4" />
                  </IconButton>

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

          <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
            {createFailed && (
              <p className="mb-3 px-2 text-[13px] text-danger">
                Could not save the note. Check that the notes API is running.
              </p>
            )}

            {error && (
              <p className="mb-3 px-2 text-[13px] text-danger">
                Could not load your notes. Is <code>/api/notes/</code> set up
                on the backend?
              </p>
            )}

            {isLoading ? null : rows.length === 0 ? (
              error ? null : (
                <p className="px-2 py-10 text-center text-[14px] text-ink-3">
                  {notes.length === 0
                    ? 'No notes yet. Your first one is waiting on the right.'
                    : filter === 'pinned'
                      ? 'No pinned notes yet.'
                      : 'No tagged notes yet.'}
                </p>
              )
            ) : (
              <ul className="flex flex-col gap-1.5">
                <AnimatePresence initial={false}>
                  {rows.map((note) => (
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
                        onClick={() =>
                          note.id === 0 ? setPane('editor') : select(note)
                        }
                        aria-current={note.id === 0 || note.id === selectedId}
                        className={`flex min-h-36 w-full flex-col rounded-lg border px-4 py-3.5 text-left transition-colors ${
                          note.id === 0 || note.id === selectedId
                            ? 'border-line-strong bg-raised'
                            : 'border-transparent hover:bg-ink/6'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          {note.pinned && (
                            <DrawingPinFilledIcon className="h-3.5 w-3.5 shrink-0 text-ink-3" />
                          )}
                          <p className="min-w-0 flex-1 truncate text-[16px] text-ink">
                            {note.id === selectedId && draft
                              ? draft.title.trim() || 'Untitled'
                              : note.title.trim() || 'Untitled'}
                          </p>
                        </div>

                        {snippet(note.body) !== '' && (
                          <p className="mt-1 line-clamp-2 wrap-anywhere text-[14px] text-ink-3">
                            {snippet(note.body)}
                          </p>
                        )}

                        <p className="mt-auto pt-3 text-[13px] text-ink-4">
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
                  onDelete={discardScratch}
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
