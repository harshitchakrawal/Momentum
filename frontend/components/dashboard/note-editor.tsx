'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import {
  CheckboxIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CodeIcon,
  Cross2Icon,
  DotsHorizontalIcon,
  DrawingPinFilledIcon,
  DrawingPinIcon,
  FontBoldIcon,
  FontItalicIcon,
  HeadingIcon,
  Link2Icon,
  ListBulletIcon,
  PlusIcon,
  QuoteIcon,
} from '@radix-ui/react-icons'
import { Trash2 } from 'lucide-react'
import { Popover, MenuItem } from './menu'
import NoteStarters, { type StarterPatch } from './note-starters'
import type { Note, NoteDraft, SaveStatus } from './notes-workspace'

type Format =
  | 'bold'
  | 'italic'
  | 'code'
  | 'heading'
  | 'bullet'
  | 'todo'
  | 'quote'
  | 'link'

const WRAPS: Partial<Record<Format, string>> = {
  bold: '**',
  italic: '*',
  code: '`',
}

const PREFIXES: Partial<Record<Format, string>> = {
  heading: '## ',
  bullet: '- ',
  todo: '- [ ] ',
  quote: '> ',
}

const TOOL_GROUPS: {
  id: Format
  label: string
  icon: typeof FontBoldIcon
}[][] = [
  [
    { id: 'bold', label: 'Bold', icon: FontBoldIcon },
    { id: 'italic', label: 'Italic', icon: FontItalicIcon },
    { id: 'heading', label: 'Heading', icon: HeadingIcon },
  ],
  [
    { id: 'bullet', label: 'Bullet list', icon: ListBulletIcon },
    { id: 'todo', label: 'Checklist', icon: CheckboxIcon },
    { id: 'quote', label: 'Quote', icon: QuoteIcon },
  ],
  [
    { id: 'code', label: 'Code', icon: CodeIcon },
    { id: 'link', label: 'Link', icon: Link2Icon },
  ],
]

export default function NoteEditor({
  note,
  draft,
  status,
  dirty,
  titleRef,
  onChange,
  onBack,
  onTogglePin,
  onDelete,
  onAddTag,
  onRemoveTag,
}: {
  note: Note
  draft: NoteDraft
  status: SaveStatus
  dirty: boolean
  titleRef: RefObject<HTMLInputElement | null>
  onChange: (draft: NoteDraft) => void
  onBack: () => void
  onTogglePin: () => void
  onDelete: () => void
  onAddTag: (tag: string) => void
  onRemoveTag: (tag: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [tagDraft, setTagDraft] = useState('')

  const bodyRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const field = bodyRef.current
    if (!field) return

    field.style.height = 'auto'
    field.style.height = `${field.scrollHeight}px`
  }, [draft.body])

  function commit(body: string, from: number, to: number) {
    onChange({ ...draft, body })

    requestAnimationFrame(() => {
      const field = bodyRef.current
      if (!field) return

      field.focus()
      field.setSelectionRange(from, to)
    })
  }

  function applyFormat(format: Format) {
    const field = bodyRef.current
    if (!field) return

    const value = draft.body
    const start = field.selectionStart
    const end = field.selectionEnd

    if (format === 'link') {
      const text = value.slice(start, end) || 'text'
      const caret = start + text.length + 3

      commit(
        `${value.slice(0, start)}[${text}](url)${value.slice(end)}`,
        caret,
        caret + 3,
      )
      return
    }

    const wrap = WRAPS[format]

    if (wrap) {
      const selected = value.slice(start, end)
      const before =
        start >= wrap.length ? value.slice(start - wrap.length, start) : ''
      const after = value.slice(end, end + wrap.length)

      if (before === wrap && after === wrap) {
        commit(
          value.slice(0, start - wrap.length) +
            selected +
            value.slice(end + wrap.length),
          start - wrap.length,
          end - wrap.length,
        )
        return
      }

      commit(
        `${value.slice(0, start)}${wrap}${selected}${wrap}${value.slice(end)}`,
        start + wrap.length,
        end + wrap.length,
      )
      return
    }

    const prefix = PREFIXES[format]
    if (!prefix) return

    const lineStart = value.lastIndexOf('\n', start - 1) + 1

    if (value.slice(lineStart).startsWith(prefix)) {
      commit(
        value.slice(0, lineStart) + value.slice(lineStart + prefix.length),
        Math.max(lineStart, start - prefix.length),
        Math.max(lineStart, end - prefix.length),
      )
      return
    }

    commit(
      value.slice(0, lineStart) + prefix + value.slice(lineStart),
      start + prefix.length,
      end + prefix.length,
    )
  }

  function applyStarter({ title, body }: StarterPatch) {
    onChange({ title: title ?? draft.title, body })

    requestAnimationFrame(() => {
      const field = bodyRef.current
      if (!field) return

      field.focus()
      field.setSelectionRange(body.length, body.length)
    })
  }

  const blank = draft.body.trim() === ''

  const words = blank ? 0 : draft.body.trim().split(/\s+/).length

  const savedLabel =
    status === 'saving'
      ? 'Saving…'
      : status === 'error'
        ? 'Could not save'
        : dirty
          ? 'Unsaved changes'
          : 'All changes saved'

  return (
    <>
      <header className="flex items-center gap-2 px-4 py-3 md:px-6">
        <button
          type="button"
          onClick={onBack}
          className="-ml-1.5 rounded-md p-1.5 text-ink-3 transition-colors hover:bg-ink/6 hover:text-ink md:hidden"
        >
          <ChevronLeftIcon className="h-4 w-4" />
          <span className="sr-only">Back to notes</span>
        </button>

        <p className="flex min-w-0 flex-1 items-center gap-1 text-[14px] text-ink-4">
          <span className="shrink-0">Notes</span>
          <ChevronRightIcon className="h-3.5 w-3.5 shrink-0" />
          {note.pinned && (
            <DrawingPinFilledIcon className="h-3.5 w-3.5 shrink-0 text-ink-3" />
          )}
          <span className="truncate text-ink-2">
            {draft.title.trim() || 'Untitled'}
          </span>
        </p>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            className="rounded-md p-1.5 text-ink-3 transition-colors hover:bg-ink/6 hover:text-ink"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Note options</span>
          </button>

          {menuOpen && (
            <Popover align="right" onClose={() => setMenuOpen(false)}>
              <MenuItem
                icon={
                  note.pinned ? (
                    <DrawingPinFilledIcon className="h-4 w-4" />
                  ) : (
                    <DrawingPinIcon className="h-4 w-4" />
                  )
                }
                onClick={() => {
                  onTogglePin()
                  setMenuOpen(false)
                }}
              >
                {note.pinned ? 'Unpin note' : 'Pin note'}
              </MenuItem>
              <MenuItem
                icon={<Trash2 className="h-4 w-4" strokeWidth={1.8} />}
                onClick={() => {
                  onDelete()
                  setMenuOpen(false)
                }}
              >
                Delete note
              </MenuItem>
            </Popover>
          )}
        </div>
      </header>

      <div className="flex items-center border-y border-line px-4 py-1.5 md:px-6">
        {TOOL_GROUPS.map((group, index) => (
          <div key={index} className="flex items-center gap-0.5">
            {index > 0 && <span className="mx-2 h-4 w-px bg-line" />}
            {group.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => applyFormat(id)}
                title={label}
                className="rounded-md p-2 text-ink-3 transition-colors hover:bg-ink/6 hover:text-ink"
              >
                <Icon className="h-4 w-4" />
                <span className="sr-only">{label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto w-full max-w-3xl px-6 pt-10 pb-16 md:px-10">
          <input
            ref={titleRef}
            value={draft.title}
            onChange={(event) =>
              onChange({ ...draft, title: event.target.value })
            }
            placeholder="Title"
            aria-label="Note title"
            className="w-full bg-transparent text-[30px] font-semibold tracking-tight text-ink outline-none placeholder:text-ink-4"
          />

          <textarea
            ref={bodyRef}
            value={draft.body}
            onChange={(event) =>
              onChange({ ...draft, body: event.target.value })
            }
            onKeyDown={(event) => {
              if (!event.ctrlKey && !event.metaKey) return

              const key = event.key.toLowerCase()
              if (key !== 'b' && key !== 'i') return

              event.preventDefault()
              applyFormat(key === 'b' ? 'bold' : 'italic')
            }}
            placeholder="Start writing, or pick a starting point below"
            aria-label="Note body"
            rows={1}
            className={`mt-6 w-full resize-none overflow-hidden bg-transparent text-[16.5px] leading-[1.8] text-ink-2 outline-none placeholder:text-ink-4 ${
              blank ? 'min-h-0' : 'min-h-96'
            }`}
          />

          {blank && (
            <NoteStarters
              hasTitle={draft.title.trim() !== ''}
              onApply={applyStarter}
            />
          )}
        </div>
      </div>

      <footer className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line px-4 py-3 md:px-6">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded border border-line-strong px-1.5 py-0.5 text-[14px] text-ink-2"
            >
              #{tag}
              <button
                type="button"
                onClick={() => onRemoveTag(tag)}
                className="text-ink-4 transition-colors hover:text-danger"
              >
                <Cross2Icon className="h-3 w-3" />
                <span className="sr-only">Remove {tag}</span>
              </button>
            </span>
          ))}

          <div className="flex items-center gap-1 text-ink-4">
            <PlusIcon className="h-3.5 w-3.5" />
            <input
              value={tagDraft}
              onChange={(event) => setTagDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== 'Enter' && event.key !== ',') return
                event.preventDefault()
                onAddTag(tagDraft)
                setTagDraft('')
              }}
              onBlur={() => {
                if (tagDraft.trim() === '') return
                onAddTag(tagDraft)
                setTagDraft('')
              }}
              placeholder="Add tag"
              aria-label="Add tag"
              className="min-w-24 bg-transparent text-[14px] text-ink-2 outline-none placeholder:text-ink-4"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 text-[13px]">
          <span className="text-ink-4">
            {words} {words === 1 ? 'word' : 'words'}
          </span>
          <span className="h-3 w-px bg-line" />
          <span className={status === 'error' ? 'text-danger' : 'text-ink-4'}>
            {savedLabel}
          </span>
        </div>
      </footer>
    </>
  )
}
