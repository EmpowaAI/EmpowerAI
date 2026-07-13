
import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle, AlignLeft } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { CVInputMode } from '../types';

interface CVUploadZoneProps {
  inputMode: CVInputMode;
  file: File | null;
  cvText: string;
  onModeChange: (mode: CVInputMode) => void;
  onFileSelect: (file: File | null) => void;
  onTextChange: (text: string) => void;
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const ACCEPTED_EXT = ['.pdf', '.docx', '.txt'];
const MAX_SIZE_MB = 5;

function isValidFile(file: File): string | null {
  if (
    !ACCEPTED_TYPES.includes(file.type) &&
    !ACCEPTED_EXT.some((ext) => file.name.toLowerCase().endsWith(ext))
  ) {
    return 'Invalid file type. Please upload a PDF, DOCX, or TXT file.';
  }
  if (file.size > MAX_SIZE_MB * 1024 * 1024) {
    return `File too large. Maximum size is ${MAX_SIZE_MB}MB.`;
  }
  return null;
}

export default function CVUploadZone({
  inputMode,
  file,
  cvText,
  onModeChange,
  onFileSelect,
  onTextChange,
}: CVUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (incoming: File) => {
      setFileError(null);
      const error = isValidFile(incoming);
      if (error) {
        setFileError(error);
        return;
      }
      // File wins - switch to file mode (clears any pasted text)
      onModeChange('file');
      onFileSelect(incoming);
    },
    [onFileSelect, onModeChange]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile]
  );

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const removeFile = () => {
    onFileSelect(null);
    setFileError(null);
    if (inputRef.current) inputRef.current.value = '';
    // Revert to file mode (text area becomes available)
    onModeChange('file');
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    // Auto-switch to text mode on first keystroke (file is already absent here
    // since textarea is disabled while a file is selected)
    if (inputMode !== 'text') {
      onModeChange('text');
    }
    onTextChange(text);
  };

  const textReady = cvText.trim().length >= 50;
  const textTooShort = cvText.length > 0 && !textReady;

  return (
    <div className="space-y-5">

      {/* ── Upload Zone ────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {file ? (
          /* File selected - success chip */
          <motion.div
            key="file-selected"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="relative flex items-center gap-4 p-4 rounded-2xl border border-[hsl(var(--success)/0.4)] bg-gradient-to-r from-[hsl(var(--success)/0.07)] to-transparent overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[hsl(var(--success)/0.7)] rounded-l-2xl" />
            <div className="h-11 w-11 rounded-xl bg-[hsl(var(--success)/0.12)] flex items-center justify-center flex-shrink-0 ml-1">
              <FileText className="h-5 w-5 text-[hsl(var(--success))]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
                <span className="flex items-center gap-1 text-[10px] font-bold text-[hsl(var(--success))] bg-[hsl(var(--success)/0.1)] px-1.5 py-0.5 rounded-md flex-shrink-0">
                  <CheckCircle className="h-2.5 w-2.5" />
                  Ready
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {(file.size / 1024 / 1024).toFixed(2)} MB · CV file loaded
              </p>
            </div>
            <button
              onClick={removeFile}
              className="p-2 rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
              aria-label="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ) : (
          /* Drop zone */
          <motion.div
            key="drop-zone"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <div
              onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                'relative flex flex-col items-center justify-center gap-4 py-10 px-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden group',
                isDragging
                  ? 'border-secondary bg-secondary/5 scale-[1.015]'
                  : 'border-border/50 hover:border-secondary/50 hover:bg-secondary/3'
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={onInputChange}
                className="hidden"
              />

              {/* Drag glow */}
              {isDragging && (
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 via-transparent to-primary/5 pointer-events-none" />
              )}

              {/* Icon */}
              <div className={cn(
                'relative flex h-16 w-16 items-center justify-center rounded-2xl transition-all duration-200',
                isDragging
                  ? 'bg-secondary/25 text-secondary scale-110'
                  : 'bg-gradient-to-br from-primary/10 to-secondary/10 text-muted-foreground group-hover:from-secondary/20 group-hover:to-primary/10 group-hover:text-secondary'
              )}>
                <Upload className="h-7 w-7" />
                {isDragging && (
                  <div className="absolute inset-0 rounded-2xl ring-2 ring-secondary/60 animate-pulse" />
                )}
              </div>

              <div className="text-center space-y-1">
                <p className={cn(
                  'text-sm font-semibold transition-colors',
                  isDragging ? 'text-secondary' : 'text-foreground group-hover:text-secondary'
                )}>
                  {isDragging ? 'Drop your CV here' : 'Drag & drop your CV file'}
                </p>
                <p className="text-xs text-muted-foreground">
                  or{' '}
                  <span className="font-semibold text-secondary/80 group-hover:text-secondary transition-colors">
                    click to browse
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {['PDF', 'DOCX', 'TXT'].map((type) => (
                  <span
                    key={type}
                    className="px-2 py-0.5 rounded-md bg-muted/70 text-[10px] font-bold text-muted-foreground tracking-wide"
                  >
                    {type}
                  </span>
                ))}
                <span className="text-[10px] text-muted-foreground/60">· Max {MAX_SIZE_MB}MB</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* File validation error */}
      {fileError && (
        <p className="text-xs text-destructive flex items-center gap-1.5 -mt-2">
          <X className="h-3 w-3 flex-shrink-0" />
          {fileError}
        </p>
      )}

      {/* ── Divider ────────────────────────────────────────────────────── */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/70 to-transparent" />
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border/50 bg-muted/30">
          <AlignLeft className="h-3 w-3 text-muted-foreground" />
          <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
            or paste your CV text
          </span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-border/70 to-transparent" />
      </div>

      {/* ── Paste Text Area ─────────────────────────────────────────────── */}
      <div className="relative">
        {/* Lock overlay when file is selected */}
        {file && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-background/75 backdrop-blur-sm border border-dashed border-border/40">
            <FileText className="h-5 w-5 text-muted-foreground/50 mb-2" />
            <p className="text-xs text-muted-foreground text-center px-4">
              File uploaded - remove it above to paste text instead
            </p>
          </div>
        )}

        <textarea
          value={cvText}
          onChange={handleTextChange}
          disabled={!!file}
          placeholder="Paste your full CV here - work experience, skills, education, and all..."
          rows={9}
          className={cn(
            'w-full px-4 py-3.5 rounded-2xl border-2 bg-card text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none transition-all duration-200 font-mono leading-relaxed',
            file
              ? 'border-border/30 opacity-40 cursor-not-allowed'
              : inputMode === 'text' && textReady
              ? 'border-[hsl(var(--success)/0.5)] ring-2 ring-[hsl(var(--success)/0.08)] shadow-sm'
              : inputMode === 'text' && cvText.length > 0
              ? 'border-secondary/40 ring-2 ring-secondary/8 shadow-sm'
              : 'border-border/50 focus:border-secondary/50 focus:ring-2 focus:ring-secondary/10 focus:shadow-sm'
          )}
        />

        {/* Char count */}
        {!file && (
          <div className={cn(
            "absolute bottom-3 right-3 text-[11px] font-medium transition-colors",
            textReady ? "text-[hsl(var(--success))]" : "text-muted-foreground/50"
          )}>
            {cvText.length > 0 ? `${cvText.length.toLocaleString()} chars` : ''}
          </div>
        )}
      </div>

      {/* Too-short warning */}
      {textTooShort && !file && (
        <p className="text-xs text-amber-500 flex items-center gap-1.5 -mt-2">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500 flex-shrink-0" />
          Paste your full CV - at least 50 characters needed
        </p>
      )}
    </div>
  );
}
