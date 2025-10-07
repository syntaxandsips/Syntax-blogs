"use client"

import { useRef, useState, type ReactNode } from 'react'
import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  SpellCheck,
  Eye,
  LayoutList,
} from 'lucide-react'
import { NewMarkdownRenderer } from '@/components/ui/NewMarkdownRenderer'

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  onRequestMedia?: (insert: (markdown: string) => void) => void
}

interface ToolbarButton {
  label: string
  icon: ReactNode
  onClick: () => void
  ariaLabel: string
}

export function MarkdownEditor({ value, onChange, placeholder, onRequestMedia }: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write')

  const applyFormatting = (
    prefix: string,
    suffix: string,
    placeholderText: string,
    opts: { trim?: boolean; block?: boolean } = {},
  ) => {
    const element = textareaRef.current
    if (!element) return

    const { selectionStart, selectionEnd } = element
    const currentValue = element.value
    const selected = currentValue.slice(selectionStart, selectionEnd)
    const content = opts.trim ? selected.trim() : selected
    const replacement = content.length > 0 ? content : placeholderText

    const before = currentValue.slice(0, selectionStart)
    const after = currentValue.slice(selectionEnd)
    const newValue = `${before}${prefix}${replacement}${suffix}${after}`

    onChange(newValue)

    requestAnimationFrame(() => {
      const cursorPosition = before.length + prefix.length + replacement.length + (opts.block ? 1 : 0)
      element.focus()
      element.setSelectionRange(cursorPosition, cursorPosition)
    })
  }

  const insertBlock = (block: string) => {
    const element = textareaRef.current
    if (!element) return

    const { selectionStart, selectionEnd } = element
    const currentValue = element.value
    const before = currentValue.slice(0, selectionStart)
    const after = currentValue.slice(selectionEnd)
    const needsNewlineBefore = before.length > 0 && !before.endsWith('\n')
    const needsNewlineAfter = after.length > 0 && !after.startsWith('\n')
    const blockContent = `${needsNewlineBefore ? '\n' : ''}${block}${needsNewlineAfter ? '\n' : ''}`

    const newValue = `${before}${blockContent}${after}`
    onChange(newValue)

    requestAnimationFrame(() => {
      const cursorPosition = before.length + blockContent.length
      element.focus()
      element.setSelectionRange(cursorPosition, cursorPosition)
    })
  }

  const handleInsertLink = () => {
    const url = window.prompt('Enter the URL to link to:')
    if (!url) {
      return
    }
    applyFormatting('[', `](${url})`, 'link text')
  }

  const handleInsertMedia = () => {
    if (!onRequestMedia) return

    onRequestMedia((markdown) => {
      const element = textareaRef.current
      if (!element) return

      const { selectionStart, selectionEnd } = element
      const currentValue = element.value
      const before = currentValue.slice(0, selectionStart)
      const after = currentValue.slice(selectionEnd)
      const needsLineBreak = before.length > 0 && !before.endsWith('\n')
      const snippet = `${needsLineBreak ? '\n' : ''}${markdown}\n`

      const newValue = `${before}${snippet}${after}`
      onChange(newValue)

      requestAnimationFrame(() => {
        const cursorPosition = before.length + snippet.length
        element.focus()
        element.setSelectionRange(cursorPosition, cursorPosition)
      })
    })
  }

  const toolbarButtons: ToolbarButton[] = [
    {
      label: 'Bold',
      ariaLabel: 'Insert bold text',
      icon: <Bold className="h-4 w-4" />,
      onClick: () => applyFormatting('**', '**', 'bold text'),
    },
    {
      label: 'Italic',
      ariaLabel: 'Insert italic text',
      icon: <Italic className="h-4 w-4" />,
      onClick: () => applyFormatting('*', '*', 'italic text'),
    },
    {
      label: 'Heading 1',
      ariaLabel: 'Insert heading level 1',
      icon: <Heading1 className="h-4 w-4" />,
      onClick: () => insertBlock('# Heading 1\n'),
    },
    {
      label: 'Heading 2',
      ariaLabel: 'Insert heading level 2',
      icon: <Heading2 className="h-4 w-4" />,
      onClick: () => insertBlock('## Heading 2\n'),
    },
    {
      label: 'Quote',
      ariaLabel: 'Insert quote block',
      icon: <Quote className="h-4 w-4" />,
      onClick: () => insertBlock('> Quoted insight\n'),
    },
    {
      label: 'Bulleted list',
      ariaLabel: 'Insert bulleted list',
      icon: <List className="h-4 w-4" />,
      onClick: () => insertBlock('- First item\n- Second item\n- Third item\n'),
    },
    {
      label: 'Numbered list',
      ariaLabel: 'Insert numbered list',
      icon: <ListOrdered className="h-4 w-4" />,
      onClick: () => insertBlock('1. First step\n2. Second step\n3. Third step\n'),
    },
    {
      label: 'Inline code',
      ariaLabel: 'Insert inline code',
      icon: <SpellCheck className="h-4 w-4" />,
      onClick: () => applyFormatting('`', '`', 'code'),
    },
    {
      label: 'Code block',
      ariaLabel: 'Insert fenced code block',
      icon: <Code className="h-4 w-4" />,
      onClick: () => insertBlock('```ts\nconsole.log("Hello, world!")\n```\n'),
    },
    {
      label: 'Link',
      ariaLabel: 'Insert hyperlink',
      icon: <LinkIcon className="h-4 w-4" />,
      onClick: handleInsertLink,
    },
    {
      label: 'Media',
      ariaLabel: 'Insert media',
      icon: <ImageIcon className="h-4 w-4" />,
      onClick: handleInsertMedia,
    },
  ]

  return (
    <div className="rounded-lg border-4 border-black bg-white shadow-[6px_6px_0_0_rgba(0,0,0,0.1)]">
      <div className="flex items-center justify-between border-b-4 border-black bg-[#F0F0FF] px-4 py-3">
        <div className="flex items-center gap-2">
          {toolbarButtons.map((button) => (
            <button
              key={button.label}
              type="button"
              onClick={button.onClick}
              className="inline-flex items-center justify-center rounded-md border-2 border-black/20 bg-white p-2 text-sm font-semibold text-[#2A2A2A] shadow-sm transition hover:-translate-y-[1px] hover:border-black"
              aria-label={button.ariaLabel}
            >
              {button.icon}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-bold ${
              activeTab === 'write'
                ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]'
                : 'border-2 border-black/20 bg-white text-[#2A2A2A]'
            }`}
          >
            <LayoutList className="h-4 w-4" /> Compose
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-bold ${
              activeTab === 'preview'
                ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]'
                : 'border-2 border-black/20 bg-white text-[#2A2A2A]'
            }`}
          >
            <Eye className="h-4 w-4" /> Preview
          </button>
        </div>
      </div>
      {activeTab === 'write' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-[420px] w-full resize-none border-t border-black/5 p-4 font-mono text-sm outline-none"
        />
      ) : (
        <div className="max-h-[420px] overflow-y-auto border-t border-black/5 p-4">
          <NewMarkdownRenderer content={value} />
        </div>
      )}
    </div>
  )
}
