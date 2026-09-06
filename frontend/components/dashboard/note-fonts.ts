export type NoteFont = 'sans' | 'serif' | 'slab' | 'mono' | 'script' | 'hand'

export const NOTE_FONTS: {
  id: NoteFont
  label: string
  family: string
}[] = [
  {
    id: 'sans',
    label: 'Sans Serif',
    family: 'var(--font-manrope), var(--font-sans)',
  },
  {
    id: 'serif',
    label: 'Serif',
    family: 'var(--font-playfair), Georgia, serif',
  },
  {
    id: 'slab',
    label: 'Slab Serif',
    family: 'var(--font-roboto-slab), "Roboto Slab", serif',
  },
  {
    id: 'mono',
    label: 'Monospace',
    family: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  },
  {
    id: 'script',
    label: 'Script',
    family: 'var(--font-dancing-script), cursive',
  },
  {
    id: 'hand',
    label: 'Handwritten',
    family: 'var(--font-caveat), cursive',
  },
]

export const DEFAULT_FONT: NoteFont = 'sans'

export const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32]

export const DEFAULT_SIZE = 16

export function normaliseSize(raw: unknown) {
  const size = Number(raw)
  return Number.isFinite(size) && size >= 8 && size <= 72 ? size : DEFAULT_SIZE
}

export function isNoteFont(raw: unknown): raw is NoteFont {
  return NOTE_FONTS.some((font) => font.id === raw)
}

export function fontMeta(id: NoteFont) {
  return NOTE_FONTS.find((font) => font.id === id) ?? NOTE_FONTS[0]
}
