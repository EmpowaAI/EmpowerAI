
import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, AlignLeft, Paperclip } from 'lucide-react';
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

const ACCEPTED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
const ACCEPTED_EXT = ['.pdf', '.docx', '.txt'];
const MAX_SIZE_MB = 5;

function isValidFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type) && !ACCEPTED_EXT.some(ext => file.name.toLowerCase().endsWith(ext))) {
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

  const handleFile = useCallback((incoming: File) => {
    setFileError(null);
    const error = isValidFile(incoming);
    if (error) { setFileError(error); return; }
    onFileSelect(incoming);
  }, [onFileSelect]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, [handleFile]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const removeFile = () => {
    onFileSelect(null);
    setFileError(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border w-fit">
        <button
          onClick={() => onModeChange('file')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            inputMode === 'file'
              ? 'bg-card shadow-sm text-foreground border border-border'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Paperclip className="h-3.5 w-3.5" />
          Upload File
        </button>
        <button
          onClick={() => onModeChange('text')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
            inputMode === 'text'
              ? 'bg-card shadow-sm text-foreground border border-border'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <AlignLeft className="h-3.5 w-3.5" />
          Paste Text
        </button>
      </div>

      <AnimatePresence mode="wait">
        {inputMode === 'file' ? (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {file ? (
              /* File selected state */
              <div className="flex items-center gap-3 p-4 rounded-xl border border-success/40 bg-success/5">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB · Ready to analyse
                  </p>
                </div>
                <button
                  onClick={removeFile}
                  className="p-1.5 rounded-lg hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              /* Drop zone */
              <div
                onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-3 p-10 rounded-xl border-2 border-dashed cursor-pointer transition-all',
                  isDragging
                    ? 'border-primary bg-primary/5 scale-[1.01]'
                    : 'border-border/60 hover:border-primary/40 hover:bg-muted/20'
                )}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={onInputChange}
                  className="hidden"
                />
                <div className={cn(
                  'h-12 w-12 rounded-full flex items-center justify-center transition-colors',
                  isDragging ? 'bg-primary/20' : 'bg-muted/40'
                )}>
                  <Upload className={cn('h-6 w-6', isDragging ? 'text-primary' : 'text-muted-foreground')} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    {isDragging ? 'Drop your CV here' : 'Drag & drop your CV'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or <span className="text-primary font-medium">click to browse</span>
                  </p>
                </div>
                <p className="text-xs text-muted-foreground/70">PDF, DOCX, TXT · Max {MAX_SIZE_MB}MB</p>
              </div>
            )}

            {fileError && (
              <p className="mt-2 text-xs text-destructive flex items-center gap-1.5">
                <X className="h-3 w-3" /> {fileError}
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <textarea
                value={cvText}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="Paste your full CV text here..."
                rows={12}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all font-mono leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-xs text-muted-foreground/60">
                {cvText.length.toLocaleString()} chars
              </div>
            </div>
            {cvText.length > 0 && cvText.trim().length < 50 && (
              <p className="mt-2 text-xs text-amber-500">
                CV text is too short. Please paste your full CV.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
