import React, { useState, useRef } from 'react'
import {
  Strikethrough,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Terminal,
  Table as TableIcon,
  Clock,
  Smile,
  AlertCircle,
  Maximize,
  Minimize,
  Focus,
  Search,
  Type,
  Undo,
  Redo,
  FolderOpen,
  Download,
  ZoomIn,
  ZoomOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMarkdownViewerStore } from '@/store/markdown-viewer'
import EmojiPicker from 'emoji-picker-react'

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (value: string) => void
}

export function MarkdownToolbar({ textareaRef, value, onChange }: MarkdownToolbarProps) {
  const { isZenMode, isFullscreen, zoomLevel, toggleZenMode, toggleFullscreen, setZoomLevel } = useMarkdownViewerStore()
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Modals state
  const [isRefModalOpen, setIsRefModalOpen] = useState(false)
  const [refId, setRefId] = useState('')
  const [refLink, setRefLink] = useState('')
  const [refTitle, setRefTitle] = useState('')

  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')

  const [isTableModalOpen, setIsTableModalOpen] = useState(false)
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)

  const [isEmojiModalOpen, setIsEmojiModalOpen] = useState(false)

  const insertText = (before: string, after: string = '') => {
    if (!textareaRef.current) return
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = textarea.value.substring(start, end)
    const replacement = before + selectedText + after
    
    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end)
    onChange(newValue)
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(start + before.length, end + before.length)
      }
    }, 0)
  }

  const handleAction = (action: string) => {
    switch (action) {
      case 'strikethrough': insertText('~~', '~~'); break;
      case 'blockquote': insertText('> ', ''); break;
      case 'align-left': insertText('<div align="left">\n\n', '\n\n</div>'); break;
      case 'align-center': insertText('<div align="center">\n\n', '\n\n</div>'); break;
      case 'align-right': insertText('<div align="right">\n\n', '\n\n</div>'); break;
      case 'rtl': insertText('<div dir="rtl">\n\n', '\n\n</div>'); break;
      case 'hr': insertText('\n---\n', ''); break;
      case 'code': insertText('```\n', '\n```'); break;
      case 'terminal': insertText('```bash\n', '\n```'); break;
      case 'alert': insertText('> [!NOTE]\n> ', ''); break;
      case 'date': insertText(new Date().toLocaleString(), ''); break;
      case 'undo':
        textareaRef.current?.focus();
        document.execCommand('undo');
        break;
      case 'redo':
        textareaRef.current?.focus();
        document.execCommand('redo');
        break;
      case 'import':
        fileInputRef.current?.click();
        break;
      case 'export':
        const blob = new Blob([value], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        break;
    }
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result
      if (typeof text === 'string') {
        onChange(text)
      }
    }
    reader.readAsText(file)
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleInsertRef = () => {
    if (!refId || !refLink) return
    const id = refId.startsWith('^') ? refId : `^${refId}`
    insertText(`[${id}]`, '')
    
    // Append to end of document
    const appendText = `\n[${id}]: ${refLink} "${refTitle}"`
    onChange(value + appendText)
    setIsRefModalOpen(false)
    setRefId('')
    setRefLink('')
    setRefTitle('')
  }

  const handleInsertImage = () => {
    if (!imageUrl) return
    insertText(`![${imageAlt}](${imageUrl})`, '')
    setIsImageModalOpen(false)
    setImageUrl('')
    setImageAlt('')
  }

  const handleInsertTable = () => {
    let table = '\n|'
    for (let i = 0; i < tableCols; i++) table += ` Header ${i + 1} |`
    table += '\n|'
    for (let i = 0; i < tableCols; i++) table += ' --- |'
    for (let r = 0; r < tableRows; r++) {
      table += '\n|'
      for (let i = 0; i < tableCols; i++) table += ` Cell ${r + 1}-${i + 1} |`
    }
    table += '\n'
    insertText(table, '')
    setIsTableModalOpen(false)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImageUrl(url)
      if (!imageAlt) setImageAlt(file.name)
    }
  }

  const ToolbarButton = ({ icon: Icon, onClick, title }: { icon: any, onClick: () => void, title: string }) => (
    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onClick} title={title}>
      <Icon className="h-4 w-4" />
    </Button>
  )

  return (
    <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/50 border-b border-border rounded-t-md">
      <input type="file" ref={fileInputRef} className="hidden" accept=".md,.txt,text/markdown,text/plain" onChange={handleFileImport} />
      
      <ToolbarButton icon={Undo} onClick={() => handleAction('undo')} title="Undo (Ctrl+Z)" />
      <ToolbarButton icon={Redo} onClick={() => handleAction('redo')} title="Redo (Ctrl+Y)" />
      <div className="w-px h-4 bg-border mx-1" />

      <ToolbarButton icon={FolderOpen} onClick={() => handleAction('import')} title="Import .md file" />
      <ToolbarButton icon={Download} onClick={() => handleAction('export')} title="Export as .md" />
      <div className="w-px h-4 bg-border mx-1" />

      <ToolbarButton icon={Strikethrough} onClick={() => handleAction('strikethrough')} title="Strikethrough" />
      <ToolbarButton icon={Quote} onClick={() => handleAction('blockquote')} title="Blockquote" />
      <div className="w-px h-4 bg-border mx-1" />
      
      <ToolbarButton icon={AlignLeft} onClick={() => handleAction('align-left')} title="Align Left" />
      <ToolbarButton icon={AlignCenter} onClick={() => handleAction('align-center')} title="Align Center" />
      <ToolbarButton icon={AlignRight} onClick={() => handleAction('align-right')} title="Align Right" />
      <ToolbarButton icon={Type} onClick={() => handleAction('rtl')} title="Right to Left (RTL)" />
      <div className="w-px h-4 bg-border mx-1" />

      <ToolbarButton icon={Minus} onClick={() => handleAction('hr')} title="Horizontal Rule" />
      <ToolbarButton icon={Code} onClick={() => handleAction('code')} title="Code Block" />
      <ToolbarButton icon={Terminal} onClick={() => handleAction('terminal')} title="Terminal Block" />
      <ToolbarButton icon={AlertCircle} onClick={() => handleAction('alert')} title="Markdown Alert" />
      <div className="w-px h-4 bg-border mx-1" />

      <ToolbarButton icon={LinkIcon} onClick={() => setIsRefModalOpen(true)} title="Insert Reference" />
      <ToolbarButton icon={ImageIcon} onClick={() => setIsImageModalOpen(true)} title="Insert Image" />
      <ToolbarButton icon={TableIcon} onClick={() => setIsTableModalOpen(true)} title="Insert Table" />
      <ToolbarButton icon={Clock} onClick={() => handleAction('date')} title="Insert Date & Time" />
      <ToolbarButton icon={Smile} onClick={() => setIsEmojiModalOpen(true)} title="Insert Emoji" />
      <div className="w-px h-4 bg-border mx-1" />

      {/* View modes */}
      <div className="ml-auto flex items-center gap-1">
        <ToolbarButton icon={ZoomOut} onClick={() => setZoomLevel(z => Math.max(8, z - 2))} title="Zoom Out" />
        <span className="text-xs text-muted-foreground w-8 text-center">{zoomLevel}px</span>
        <ToolbarButton icon={ZoomIn} onClick={() => setZoomLevel(z => Math.min(32, z + 2))} title="Zoom In" />
        <div className="w-px h-4 bg-border mx-1" />
        
        <ToolbarButton icon={Search} onClick={() => {
          alert("Use Ctrl+F / Cmd+F to find within the editor!")
        }} title="Find" />
        <ToolbarButton icon={Focus} onClick={toggleZenMode} title={isZenMode ? "Exit Zen Mode" : "Zen Mode"} />
        <ToolbarButton icon={isFullscreen ? Minimize : Maximize} onClick={toggleFullscreen} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"} />
      </div>

      {/* Modals */}
      <Dialog open={isRefModalOpen} onOpenChange={setIsRefModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Insert Reference</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Reference Number (e.g., 1)</Label><Input value={refId} onChange={e => setRefId(e.target.value)} placeholder="1" /></div>
            <div className="space-y-2"><Label>Link URL</Label><Input value={refLink} onChange={e => setRefLink(e.target.value)} placeholder="https://..." /></div>
            <div className="space-y-2"><Label>Title (Optional)</Label><Input value={refTitle} onChange={e => setRefTitle(e.target.value)} placeholder="My Link Title" /></div>
          </div>
          <DialogFooter><Button onClick={handleInsertRef}>Insert</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Insert Image</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Upload Image</Label><Input type="file" accept="image/*" onChange={handleImageUpload} /></div>
            <div className="relative flex items-center py-2"><div className="flex-grow border-t border-border"></div><span className="flex-shrink-0 mx-4 text-muted-foreground text-xs uppercase">Or</span><div className="flex-grow border-t border-border"></div></div>
            <div className="space-y-2"><Label>Image URL</Label><Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." /></div>
            <div className="space-y-2"><Label>Alt Text</Label><Input value={imageAlt} onChange={e => setImageAlt(e.target.value)} placeholder="Description of image" /></div>
          </div>
          <DialogFooter><Button onClick={handleInsertImage}>Insert</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTableModalOpen} onOpenChange={setIsTableModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Insert Table</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2"><Label>Rows</Label><Input type="number" min={1} value={tableRows} onChange={e => setTableRows(parseInt(e.target.value) || 1)} /></div>
            <div className="space-y-2"><Label>Columns</Label><Input type="number" min={1} value={tableCols} onChange={e => setTableCols(parseInt(e.target.value) || 1)} /></div>
          </div>
          <DialogFooter><Button onClick={handleInsertTable}>Insert</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEmojiModalOpen} onOpenChange={setIsEmojiModalOpen}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none flex justify-center items-center [&>button]:hidden sm:max-w-fit">
          <EmojiPicker 
            onEmojiClick={(emojiData) => {
              insertText(emojiData.emoji, '')
              setIsEmojiModalOpen(false)
            }}
            theme={'auto' as any}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
