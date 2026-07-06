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
  Search,
  Type,
  Undo,
  Redo,
  FolderOpen,
  Download,
  ZoomIn,
  ZoomOut,
  Eraser,
  Bold,
  Italic,
  CaseSensitive,
  CaseUpper,
  CaseLower,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  BookOpen,
  Sigma,
  Copyright,
  Workflow,
  HelpCircle,
  Info,
  Columns,
  PenSquare,
  Eye
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useMarkdownViewerStore } from '@/store/markdown-viewer'
import { useTheme } from '@/providers/theme-provider'
import EmojiPicker from 'emoji-picker-react'
import { toast } from 'sonner'

interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
  value: string
  onChange: (value: string) => void
}

export function MarkdownToolbar({ textareaRef, value, onChange }: MarkdownToolbarProps) {
  const { viewMode, isFullscreen, zoomLevel, setViewMode, toggleFullscreen, setZoomLevel } = useMarkdownViewerStore()
  const { theme } = useTheme()
  
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
  
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)

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

  const handleTransformText = (transformFn: (text: string) => string) => {
    if (!textareaRef.current) return
    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    if (start === end) return // No text selected
    const selectedText = textarea.value.substring(start, end)
    const replacement = transformFn(selectedText)
    
    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end)
    onChange(newValue)
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(start, start + replacement.length)
      }
    }, 0)
  }

  const handleAction = (action: string) => {
    switch (action) {
      case 'clear': onChange(''); break;
      case 'bold': insertText('**', '**'); break;
      case 'strikethrough': insertText('~~', '~~'); break;
      case 'italic': insertText('*', '*'); break;
      case 'blockquote': insertText('> ', ''); break;
      case 'case-upper': handleTransformText(t => t.toUpperCase()); break;
      case 'case-lower': handleTransformText(t => t.toLowerCase()); break;
      case 'case-title': handleTransformText(t => t.replace(/\\w\\S*/g, w => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase())); break;
      case 'align-left': insertText('<div align="left">\\n\\n', '\\n\\n</div>'); break;
      case 'align-center': insertText('<div align="center">\\n\\n', '\\n\\n</div>'); break;
      case 'align-right': insertText('<div align="right">\\n\\n', '\\n\\n</div>'); break;
      case 'rtl': insertText('<div dir="rtl">\\n\\n', '\\n\\n</div>'); break;
      case 'h1': insertText('# ', ''); break;
      case 'h2': insertText('## ', ''); break;
      case 'h3': insertText('### ', ''); break;
      case 'h4': insertText('#### ', ''); break;
      case 'h5': insertText('##### ', ''); break;
      case 'h6': insertText('###### ', ''); break;
      case 'ul': insertText('- ', ''); break;
      case 'ol': insertText('1. ', ''); break;
      case 'hr': insertText('\\n---\\n', ''); break;
      case 'link': insertText('[', '](https://)'); break;
      case 'code': insertText('```\\n', '\\n```'); break;
      case 'terminal': insertText('```bash\\n', '\\n```'); break;
      case 'math': insertText('$$ \\n', '\\n $$'); break;
      case 'alert': insertText('> [!NOTE]\\n> ', ''); break;
      case 'date': insertText(new Date().toLocaleString(), ''); break;
      case 'copyright': insertText('©', ''); break;
      case 'mermaid': insertText('```mermaid\\ngraph TD\\n  A-->B;\\n```\\n', ''); break;
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
      case 'help':
        setIsHelpModalOpen(true);
        break;
      case 'info':
        setIsInfoModalOpen(true);
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
    const appendText = `\\n[${id}]: ${refLink} "${refTitle}"`
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
    let table = '\\n|'
    for (let i = 0; i < tableCols; i++) table += ` Header ${i + 1} |`
    table += '\\n|'
    for (let i = 0; i < tableCols; i++) table += ' --- |'
    for (let r = 0; r < tableRows; r++) {
      table += '\\n|'
      for (let i = 0; i < tableCols; i++) table += ` Cell ${r + 1}-${i + 1} |`
    }
    table += '\\n'
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

  const ToolbarButton = ({ icon: Icon, onClick, title, active = false }: { icon: any, onClick: () => void, title: string, active?: boolean }) => (
    <Tooltip>
      <TooltipTrigger render={<Button variant="ghost" size="icon" className={`h-8 w-8 ${active ? 'bg-muted text-primary' : 'text-muted-foreground hover:text-foreground'}`} onClick={onClick} aria-label={title} />}>
        <Icon className="h-4 w-4" />
      </TooltipTrigger>
      <TooltipContent>
        <p>{title}</p>
      </TooltipContent>
    </Tooltip>
  )

  return (
    <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/50 border-b border-border rounded-t-md overflow-x-auto">
      <input type="file" ref={fileInputRef} className="hidden" accept=".md,.txt,text/markdown,text/plain" onChange={handleFileImport} />
      
      {/* Group 1 */}
      <ToolbarButton icon={Undo} onClick={() => handleAction('undo')} title="Undo (Ctrl+Z)" />
      <ToolbarButton icon={Redo} onClick={() => handleAction('redo')} title="Redo (Ctrl+Y)" />
      <ToolbarButton icon={Eraser} onClick={() => handleAction('clear')} title="Clear All Text" />
      <div className="w-px h-4 bg-border mx-1" />

      {/* Group 2 */}
      <ToolbarButton icon={Bold} onClick={() => handleAction('bold')} title="Bold" />
      <ToolbarButton icon={Strikethrough} onClick={() => handleAction('strikethrough')} title="Strikethrough" />
      <ToolbarButton icon={Italic} onClick={() => handleAction('italic')} title="Italic" />
      <ToolbarButton icon={Quote} onClick={() => handleAction('blockquote')} title="Blockquote" />
      <ToolbarButton icon={CaseSensitive} onClick={() => handleAction('case-title')} title="Capitalize Each Word" />
      <ToolbarButton icon={CaseUpper} onClick={() => handleAction('case-upper')} title="UPPERCASE" />
      <ToolbarButton icon={CaseLower} onClick={() => handleAction('case-lower')} title="lowercase" />
      <div className="w-px h-4 bg-border mx-1" />
      
      {/* Group 3 */}
      <ToolbarButton icon={AlignLeft} onClick={() => handleAction('align-left')} title="Align Left" />
      <ToolbarButton icon={AlignCenter} onClick={() => handleAction('align-center')} title="Align Center" />
      <ToolbarButton icon={AlignRight} onClick={() => handleAction('align-right')} title="Align Right" />
      <ToolbarButton icon={Type} onClick={() => handleAction('rtl')} title="Right to Left (RTL)" />
      <div className="w-px h-4 bg-border mx-1" />

      {/* Group 4 */}
      <ToolbarButton icon={Heading1} onClick={() => handleAction('h1')} title="Heading 1" />
      <ToolbarButton icon={Heading2} onClick={() => handleAction('h2')} title="Heading 2" />
      <ToolbarButton icon={Heading3} onClick={() => handleAction('h3')} title="Heading 3" />
      <ToolbarButton icon={Heading4} onClick={() => handleAction('h4')} title="Heading 4" />
      <ToolbarButton icon={Heading5} onClick={() => handleAction('h5')} title="Heading 5" />
      <ToolbarButton icon={Heading6} onClick={() => handleAction('h6')} title="Heading 6" />
      <div className="w-px h-4 bg-border mx-1" />

      {/* Group 5 */}
      <ToolbarButton icon={List} onClick={() => handleAction('ul')} title="Unordered List" />
      <ToolbarButton icon={ListOrdered} onClick={() => handleAction('ol')} title="Ordered List" />
      <ToolbarButton icon={Minus} onClick={() => handleAction('hr')} title="Horizontal Rule" />
      <div className="w-px h-4 bg-border mx-1" />

      {/* Group 6 */}
      <ToolbarButton icon={LinkIcon} onClick={() => handleAction('link')} title="Insert Link" />
      <ToolbarButton icon={BookOpen} onClick={() => setIsRefModalOpen(true)} title="Insert Reference/Footnote" />
      <ToolbarButton icon={ImageIcon} onClick={() => setIsImageModalOpen(true)} title="Insert Image" />
      <ToolbarButton icon={Code} onClick={() => handleAction('code')} title="Code Block" />
      <ToolbarButton icon={Terminal} onClick={() => handleAction('terminal')} title="Terminal Block" />
      <ToolbarButton icon={Sigma} onClick={() => handleAction('math')} title="Insert Math Block" />
      <ToolbarButton icon={TableIcon} onClick={() => setIsTableModalOpen(true)} title="Insert Table" />
      <ToolbarButton icon={Clock} onClick={() => handleAction('date')} title="Insert Date & Time" />
      <ToolbarButton icon={Smile} onClick={() => setIsEmojiModalOpen(true)} title="Insert Emoji" />
      <ToolbarButton icon={AlertCircle} onClick={() => handleAction('alert')} title="Markdown Alert" />
      <div className="w-px h-4 bg-border mx-1" />
      
      {/* Group 7 */}
      <ToolbarButton icon={Copyright} onClick={() => handleAction('copyright')} title="Insert Copyright" />
      <ToolbarButton icon={FolderOpen} onClick={() => handleAction('import')} title="Import .md file" />
      <ToolbarButton icon={Download} onClick={() => handleAction('export')} title="Export as .md" />
      <ToolbarButton icon={Workflow} onClick={() => handleAction('mermaid')} title="Insert Mermaid Diagram" />
      <div className="w-px h-4 bg-border mx-1" />

      {/* View modes */}
      <div className="ml-auto flex items-center gap-1 shrink-0">
        <ToolbarButton icon={ZoomOut} onClick={() => setZoomLevel(z => Math.max(8, z - 2))} title="Zoom Out" />
        <span className="text-xs text-muted-foreground w-8 text-center">{zoomLevel}px</span>
        <ToolbarButton icon={ZoomIn} onClick={() => setZoomLevel(z => Math.min(32, z + 2))} title="Zoom In" />
        <div className="w-px h-4 bg-border mx-1" />
        
        <ToolbarButton icon={Search} onClick={() => toast("Use Ctrl+F / Cmd+F to find within the editor!")} title="Find" />
        <ToolbarButton icon={HelpCircle} onClick={() => handleAction('help')} title="Help" />
        <ToolbarButton icon={Info} onClick={() => handleAction('info')} title="Info" />
        <div className="w-px h-4 bg-border mx-1" />

        <ToolbarButton icon={PenSquare} onClick={() => setViewMode('editor')} title="Editor Only" active={viewMode === 'editor'} />
        <ToolbarButton icon={Columns} onClick={() => setViewMode('split')} title="Split View" active={viewMode === 'split'} />
        <ToolbarButton icon={Eye} onClick={() => setViewMode('preview')} title="Preview Only" active={viewMode === 'preview'} />
        <div className="w-px h-4 bg-border mx-1" />

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
          <div className="flex rounded-lg overflow-hidden [&_.epr-body::-webkit-scrollbar]:w-2 [&_.epr-body::-webkit-scrollbar-thumb]:rounded-full [&_.epr-body::-webkit-scrollbar-thumb]:bg-border [&_.epr-body::-webkit-scrollbar-track]:bg-transparent [&_.epr-body::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/50">
            <EmojiPicker 
              onEmojiClick={(emojiData) => {
                insertText(emojiData.emoji, '')
                setIsEmojiModalOpen(false)
              }}
              theme={(theme === 'dark' ? 'dark' : (theme === 'light' ? 'light' : 'auto')) as any}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isHelpModalOpen} onOpenChange={setIsHelpModalOpen}>
        <DialogContent className="sm:max-w-4xl w-[90vw] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b border-border">
            <DialogTitle>Markdown Viewer Help</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1">
            <div className="space-y-6 text-sm p-6">
              <div>
                <h3 className="font-semibold text-base mb-2">Application shortcuts</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Use the view buttons in the toolbar to switch between Editor, Split, and Preview modes.</li>
                  <li>Sync scrolling is available in Split view to keep the editor and preview aligned.</li>
                  <li>Import, Export, Copy, Share, and Theme toggle actions are always available in the header toolbar.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-base mb-2">Toolbar descriptions</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Undo/Redo and Clear Formatting help you manage editing changes quickly.</li>
                  <li>Text styling tools cover bold, italic, strikethrough, quotes, headings, and list formatting.</li>
                  <li>Insert helpers add links, images, code blocks, tables, emojis, symbols, and alerts.</li>
                  <li>Use Fullscreen, Find & Replace, Help, and About Markdown for focused editing.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-base mb-2">Markdown tips</h3>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>Create headings with #, ##, and ### prefixes.</li>
                  <li>Emphasize text with **bold**, *italic*, or ~~strikethrough~~.</li>
                  <li>Use - or 1. to build lists, and triple backticks for code blocks.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-base mb-2">Keyboard shortcuts</h3>
                <ul className="list-disc pl-5 space-y-2 text-muted-foreground mt-2">
                  <li className="flex items-center gap-2"><kbd className="bg-muted px-1.5 py-0.5 rounded text-xs border border-border">Ctrl</kbd> / <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs border border-border">⌘</kbd> + <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs border border-border">Z</kbd> — Undo</li>
                  <li className="flex items-center gap-2"><kbd className="bg-muted px-1.5 py-0.5 rounded text-xs border border-border">Ctrl</kbd> / <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs border border-border">⌘</kbd> + <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs border border-border">Shift</kbd> + <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs border border-border">Z</kbd> — Redo</li>
                  <li className="flex items-center gap-2"><kbd className="bg-muted px-1.5 py-0.5 rounded text-xs border border-border">Ctrl</kbd> / <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs border border-border">⌘</kbd> + <kbd className="bg-muted px-1.5 py-0.5 rounded text-xs border border-border">F</kbd> — Open Find & Replace</li>
                </ul>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <Dialog open={isInfoModalOpen} onOpenChange={setIsInfoModalOpen}>
        <DialogContent className="sm:max-w-3xl w-[90vw] max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b border-border">
            <DialogTitle>About Markdown</DialogTitle>
          </DialogHeader>
          <ScrollArea className="flex-1">
            <div className="space-y-6 text-sm p-6">
              <div className="flex items-start gap-4">
                <div className="bg-foreground text-background font-bold text-3xl w-16 h-16 rounded-xl flex items-center justify-center shrink-0">
                  M
                </div>
                <div>
                  <h3 className="font-bold text-lg leading-none">Markdown Viewer</h3>
                  <p className="text-muted-foreground mt-2">
                    A browser-based Markdown editor, viewer, and reader for opening .md files, split-screen live preview, GFM, sync scroll, diagrams, math, syntax highlighting, and export tools.
                  </p>
                  <p className="text-muted-foreground text-xs mt-2">Version 3.9.0 • Apache License 2.0 • Open source</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-base mb-3">Open-source links</h3>
                <ul className="list-disc pl-5 space-y-2 text-blue-500 hover:[&_a]:underline">
                  <li><a href="#">Apache License 2.0</a></li>
                  <li><a href="#">GitHub Repository</a></li>
                  <li><a href="#">Contribution Guide</a></li>
                  <li><a href="#">Report an Issue</a></li>
                  <li><a href="#">Community & Support</a></li>
                </ul>
                <p className="text-muted-foreground text-xs mt-3">For feature requests, open a GitHub issue or start a discussion so the community can weigh in.</p>
              </div>

              <div>
                <h3 className="font-semibold text-base mb-3">Markdown resources</h3>
                <ul className="list-disc pl-5 space-y-2 text-blue-500 hover:[&_a]:underline">
                  <li><a href="#">Markdown syntax reference</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-base mb-3">Technology stack</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-muted px-2.5 py-1 rounded-md text-xs font-medium border border-border">React</span>
                  <span className="bg-muted px-2.5 py-1 rounded-md text-xs font-medium border border-border">Tailwind CSS</span>
                  <span className="bg-muted px-2.5 py-1 rounded-md text-xs font-medium border border-border">Shadcn UI</span>
                  <span className="bg-muted px-2.5 py-1 rounded-md text-xs font-medium border border-border">React Markdown</span>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
