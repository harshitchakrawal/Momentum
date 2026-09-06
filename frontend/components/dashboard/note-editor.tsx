'use client'

import { useRef, useState, type RefObject } from 'react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { FontFamily, FontSize, TextStyle } from '@tiptap/extension-text-style'
import { Placeholder } from '@tiptap/extensions'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Cross2Icon,
  DotsHorizontalIcon,
  DrawingPinFilledIcon,
  DrawingPinIcon,
  PlusIcon,
} from '@radix-ui/react-icons'
import { Trash2 } from 'lucide-react'
import MarkerUnderline from './marker-underline'
import { Popover, MenuItem } from './menu'
import {
  DEFAULT_FONT,
  DEFAULT_SIZE,
  FONT_SIZES,
  NOTE_FONTS,
  fontMeta,
} from './note-fonts'
import type { Note, NoteDraft, SaveStatus } from './notes-workspace'

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function toHtml(body: string) {
  if (body === '' || /<[a-z][^>]*>/i.test(body)) return body
  return body
    .split('\n')
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join('')
}

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
  const [picker, setPicker] = useState<'font' | 'size' | null>(null)
  const [tagDraft, setTagDraft] = useState('')

  const draftRef = useRef(draft)
  draftRef.current = draft

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily,
      FontSize,
      Placeholder.configure({ placeholder: 'Start writing…' }),
    ],
    content: toHtml(draft.body),
    editorProps: {
      attributes: {
        'aria-label': 'Note body',
        class: 'min-h-96 leading-[1.8] text-ink-2 outline-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChangeRef.current({
        ...draftRef.current,
        body: editor.isEmpty ? '' : editor.getHTML(),
      })
    },
  })

  const cursor = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return { family: '', size: '', text: '' }
      const attrs = editor.getAttributes('textStyle')
      return {
        family: typeof attrs.fontFamily === 'string' ? attrs.fontFamily : '',
        size: typeof attrs.fontSize === 'string' ? attrs.fontSize : '',
        text: editor.getText(),
      }
    },
  })

  const currentFont =
    NOTE_FONTS.find((font) => font.family === cursor?.family) ??
    fontMeta(DEFAULT_FONT)
  const currentSize = Number.parseInt(cursor?.size ?? '', 10) || DEFAULT_SIZE

  const text = (cursor?.text ?? '').trim()
  const words = text === '' ? 0 : text.split(/\s+/).length

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

      <div className="flex items-center gap-1 border-y border-line px-4 py-1.5 md:px-6">
        <div className="relative">
          <button
            type="button"
            onClick={() => setPicker((open) => (open === 'font' ? null : 'font'))}
            aria-expanded={picker === 'font'}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[14px] text-ink-2 transition-colors hover:bg-ink/6 hover:text-ink"
          >
            {currentFont.label}
            <ChevronDownIcon className="h-4 w-4 text-ink-3" />
          </button>

          {picker === 'font' && (
            <Popover onClose={() => setPicker(null)}>
              {NOTE_FONTS.map((option) => (
                <MenuItem
                  key={option.id}
                  checked={option.id === currentFont.id}
                  onClick={() => {
                    editor?.chain().focus().setFontFamily(option.family).run()
                    setPicker(null)
                  }}
                >
                  <span style={{ fontFamily: option.family }}>
                    {option.label}
                  </span>
                </MenuItem>
              ))}
            </Popover>
          )}
        </div>

        <span className="mx-1 h-4 w-px bg-line" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setPicker((open) => (open === 'size' ? null : 'size'))}
            aria-expanded={picker === 'size'}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[14px] text-ink-2 tabular-nums transition-colors hover:bg-ink/6 hover:text-ink"
          >
            {currentSize}
            <ChevronDownIcon className="h-4 w-4 text-ink-3" />
          </button>

          {picker === 'size' && (
            <Popover onClose={() => setPicker(null)}>
              {FONT_SIZES.map((size) => (
                <MenuItem
                  key={size}
                  checked={size === currentSize}
                  onClick={() => {
                    editor?.chain().focus().setFontSize(`${size}px`).run()
                    setPicker(null)
                  }}
                >
                  <span className="tabular-nums">{size}</span>
                </MenuItem>
              ))}
            </Popover>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        <div className="mx-auto w-full max-w-3xl px-6 pt-10 pb-16 md:px-10">
          <div className="relative">
            <input
              ref={titleRef}
              value={draft.title}
              onChange={(event) =>
                onChange({ ...draft, title: event.target.value })
              }
              placeholder="Title"
              aria-label="Note title"
              className="w-full bg-transparent pb-3 text-[30px] font-medium text-ink outline-none placeholder:text-ink-4"
            />

            {draft.title !== '' && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden"
              >
                <span className="relative inline-block max-w-full text-[30px] font-medium whitespace-pre">
                  <span className="invisible block h-2.5 overflow-hidden">
                    {draft.title}
                  </span>
                  <MarkerUnderline className="absolute bottom-0 left-0 h-2.5 w-full text-ink" />
                </span>
              </div>
            )}
          </div>

          <div
            className="note-body mt-6"
            style={{
              fontFamily: fontMeta(DEFAULT_FONT).family,
              fontSize: `${DEFAULT_SIZE}px`,
            }}
          >
            <EditorContent editor={editor} />
          </div>
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
