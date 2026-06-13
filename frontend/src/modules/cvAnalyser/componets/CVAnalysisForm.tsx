
import { motion } from 'framer-motion';
import { Briefcase, Building2, FileSearch, Loader2, Zap } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { AnalyzeFormValues, CVInputMode } from '../types';

const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Engineering',
  'Marketing',
  'Legal',
  'Retail',
  'Manufacturing',
  'Government',
  'Media',
  'Hospitality',
  'Construction',
  'Agriculture',
  'Other',
];

interface CVAnalysisFormProps {
  values: AnalyzeFormValues;
  inputMode: CVInputMode;
  isReady: boolean; // file selected or text long enough
  isScanning: boolean;
  onChange: (values: Partial<AnalyzeFormValues>) => void;
  onSubmit: () => void;
}

export default function CVAnalysisForm({
  values,
  inputMode,
  isReady,
  isScanning,
  onChange,
  onSubmit,
}: CVAnalysisFormProps) {
  const canSubmit =
    isReady &&
    values.targetRole.trim().length > 0 &&
    values.industry.trim().length > 0 &&
    !isScanning;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Target Role */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" />
            Target Role <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={values.targetRole}
            onChange={(e) => onChange({ targetRole: e.target.value })}
            placeholder="e.g. Software Engineer"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>

        {/* Industry */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5" />
            Industry <span className="text-destructive">*</span>
          </label>
          <select
            value={values.industry}
            onChange={(e) => onChange({ industry: e.target.value })}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all appearance-none cursor-pointer"
          >
            <option value="">Select industry...</option>
            {INDUSTRIES.map((ind) => (
              <option key={ind} value={ind.toLowerCase()}>
                {ind}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Job Description (optional) */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <FileSearch className="h-3.5 w-3.5" />
          Job Description{' '}
          <span className="text-muted-foreground/50 font-normal">(optional — improves match score)</span>
        </label>
        <textarea
          value={values.jobDescription ?? ''}
          onChange={(e) => onChange({ jobDescription: e.target.value })}
          placeholder="Paste the job description to get a personalised match score..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground/50 resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        />
      </div>

      {/* Submit */}
      <button
        onClick={onSubmit}
        disabled={!canSubmit}
        className={cn(
          'relative w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all overflow-hidden',
          canSubmit
            ? 'text-white shadow-lg hover:shadow-xl hover:scale-[1.01] shimmer'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        )}
        style={canSubmit ? { background: 'var(--gradient-hero)' } : undefined}
      >
        {isScanning ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Analysing your CV...
          </>
        ) : (
          <>
            <Zap className="h-4 w-4" />
            Analyse My CV
          </>
        )}
      </button>

      {!isReady && (
        <p className="text-xs text-muted-foreground text-center">
          {inputMode === 'file'
            ? 'Upload your CV file above to continue'
            : 'Paste your CV text above to continue'}
        </p>
      )}
    </motion.div>
  );
}
