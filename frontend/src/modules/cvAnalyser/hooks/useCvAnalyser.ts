import { useCallback, useReducer, useEffect } from 'react';

import { analyzeCVFile, analyzeCVText, revampCV, getCVProfile } from '../api';

import type {
  CVAnalysis,
  CVAnalyzerState,
  CVAnalyzerStep,
  CVInputMode,
  AnalyzeFormValues,
  RevampedCV,
} from '../types';

// ── Actions ───────────────────────────────────────────────────────────────────
type Action =
  | { type: 'SET_INPUT_MODE'; payload: CVInputMode }
  | { type: 'SET_FILE'; payload: File | null }
  | { type: 'SET_CV_TEXT'; payload: string }
  | { type: 'SET_FORM_VALUES'; payload: Partial<AnalyzeFormValues> }
  | { type: 'START_SCAN' }
  | {
      type: 'SCAN_SUCCESS';
      payload: {
        analysis: CVAnalysis;
        profileId: string;
        analysisRemaining: number | null;
        isFallback: boolean;
        cvText: string;
      };
    }
  | { type: 'SCAN_ERROR'; payload: { message: string; isRateLimit: boolean; retryAfter?: number } }
  | { type: 'START_REVAMP' }
  | { type: 'REVAMP_SUCCESS'; payload: RevampedCV }
  | { type: 'REVAMP_ERROR'; payload: string }
  | { type: 'REVAMP_NEEDS_REUPLOAD' }
  | { type: 'DISMISS_ERROR' }
  | { type: 'SHOW_POST_MODAL'; payload: boolean }
  | { type: 'RESET' }
  | { type: 'GO_TO_STEP'; payload: CVAnalyzerStep }
  | { type: 'PROFILE_LOADING' }
  | { type: 'PROFILE_LOADED'; payload: { analysis: CVAnalysis; profileId: string } }
  | { type: 'PROFILE_EMPTY' };

// ── Initial state ─────────────────────────────────────────────────────────────
const initialState: CVAnalyzerState = {
  step: 'idle',
  inputMode: 'file',
  file: null,
  cvText: '',
  formValues: { targetRole: '', industry: '', jobDescription: '' },
  analysis: null,
  profileId: null,
  analysisRemaining: null,
  isFallback: false,
  revampedCV: null,
  error: null,
  isRateLimited: false,
  retryAfter: undefined,
  showPostModal: false,
  revampPending: false,
};

// ── Reducer ───────────────────────────────────────────────────────────────────
function reducer(state: CVAnalyzerState, action: Action): CVAnalyzerState {
  switch (action.type) {
    case 'SET_INPUT_MODE':
      return { ...state, inputMode: action.payload, file: null, cvText: '' };

    case 'SET_FILE':
      return { ...state, file: action.payload, step: action.payload ? 'form' : 'idle' };

    case 'SET_CV_TEXT':
      return {
        ...state,
        cvText: action.payload,
        step: action.payload.trim().length > 50 ? 'form' : 'idle',
      };

    case 'SET_FORM_VALUES':
      return { ...state, formValues: { ...state.formValues, ...action.payload } };

    case 'PROFILE_LOADING':
      return { ...state, step: 'scanning' };

    case 'PROFILE_LOADED':
      // cvText is NOT restored here because the cached profile response
      // does not include the original CV text. The user must re-analyse
      // to use the revamp feature on a cached profile.
      return {
        ...state,
        step: 'result',
        analysis: action.payload.analysis,
        profileId: action.payload.profileId,
        showPostModal: false,
      };

    case 'PROFILE_EMPTY':
      return { ...state, step: 'idle' };

    case 'START_SCAN':
      return { ...state, step: 'scanning', error: null, isRateLimited: false };

    case 'SCAN_SUCCESS':
      return {
        ...state,
        step: 'result',
        analysis: action.payload.analysis,
        profileId: action.payload.profileId,
        analysisRemaining: action.payload.analysisRemaining,
        isFallback: action.payload.isFallback,
        // KEY FIX: persist cvText so submitRevamp can send it to POST /cv/revamp.
        cvText: action.payload.cvText,
        showPostModal: true,
      };

    case 'SCAN_ERROR':
      return {
        ...state,
        step: state.inputMode === 'file' ? 'idle' : 'form',
        error: action.payload.message,
        isRateLimited: action.payload.isRateLimit,
        retryAfter: action.payload.retryAfter,
      };

    case 'START_REVAMP':
      return { ...state, step: 'revamping', error: null };

    case 'REVAMP_SUCCESS':
      return { ...state, step: 'revamped', revampedCV: action.payload };

    case 'REVAMP_ERROR':
      return { ...state, step: 'result', error: action.payload, revampPending: false };

    case 'REVAMP_NEEDS_REUPLOAD':
      return { ...initialState, revampPending: true };

    case 'DISMISS_ERROR':
      return { ...state, error: null, isRateLimited: false, retryAfter: undefined };

    case 'SHOW_POST_MODAL':
      return { ...state, showPostModal: action.payload };

    case 'GO_TO_STEP':
      return { ...state, step: action.payload };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useCVAnalyzer() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Check for existing profile on mount ────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function loadExistingProfile() {
      const token = localStorage.getItem('empowerai-token');
      console.log('Token exists:', !!token);

      try {
        const { profile } = await getCVProfile();
        console.log('Profile result:', profile);

        if (cancelled) return;

        const p = profile as any;

        if (p && p.isComplete && p.analysis) {
          dispatch({
            type: 'SET_FORM_VALUES',
            payload: {
              targetRole: p.analysis.targetRole || '',
              industry: p.analysis.industry || '',
              jobDescription: '',
            },
          });
          dispatch({
            type: 'PROFILE_LOADED',
            payload: { analysis: p.analysis, profileId: p._id },
          });
          // Persist skills so Opportunities page can personalise results without a fresh analysis
          const loadedSkills = p.analysis?.extractedSkills;
          if (Array.isArray(loadedSkills) && loadedSkills.length > 0) {
            try { localStorage.setItem('cvSkills', JSON.stringify(loadedSkills)); } catch {}
          }
          try { localStorage.setItem('cvCompleted', 'true'); } catch {}
        } else {
          dispatch({ type: 'PROFILE_EMPTY' });
        }
      } catch (err) {
        console.log('Profile fetch error:', err);
        if (!cancelled) dispatch({ type: 'PROFILE_EMPTY' });
      }
    }

    loadExistingProfile();

    return () => { cancelled = true; };
  }, []);

  // ── Submit analysis ────────────────────────────────────────────────────────
  const submitAnalysis = useCallback(async () => {
    const { inputMode, file, cvText, formValues } = state;
    const { targetRole, industry, jobDescription } = formValues;

    if (!targetRole || !industry) return;
    if (inputMode === 'file' && !file) return;
    if (inputMode === 'text' && cvText.trim().length < 50) return;

    dispatch({ type: 'START_SCAN' });

    try {
      const response =
        inputMode === 'file'
          ? await analyzeCVFile(file!, targetRole, industry, jobDescription)
          : await analyzeCVText(cvText, targetRole, industry, jobDescription);

      // Determine the resolved cvText to persist in state:
      //   1. Use cvText returned by the backend (file upload path — backend extracts text).
      //   2. Fall back to the pasted text the user typed (text input path).
      //   3. Last resort: empty string (revamp will be blocked by backend validation).
      const resolvedCvText = response.cvText ?? cvText ?? '';

      dispatch({
        type: 'SCAN_SUCCESS',
        payload: {
          analysis: response.analysis,
          profileId: response.profileId,
          analysisRemaining: response.analysisRemaining ?? null,
          isFallback: response.fallback ?? false,
          cvText: resolvedCvText,
        },
      });

      // Persist skills to localStorage so Opportunities page can personalise results immediately
      const extractedSkills = response.analysis?.extractedSkills;
      if (Array.isArray(extractedSkills) && extractedSkills.length > 0) {
        try { localStorage.setItem('cvSkills', JSON.stringify(extractedSkills)); } catch {}
      }
      try { localStorage.setItem('cvCompleted', 'true'); } catch {}
    } catch (err: unknown) {
      const error = err as Error & {
        isRateLimit?: boolean;
        retryAfter?: number;
        limitReached?: boolean;
      };

      dispatch({
        type: 'SCAN_ERROR',
        payload: {
          message: error.message || 'Analysis failed. Please try again.',
          isRateLimit: error.isRateLimit ?? false,
          retryAfter: error.retryAfter,
        },
      });
    }
  }, [state]);

  // ── Submit revamp ──────────────────────────────────────────────────────────
  const submitRevamp = useCallback(async () => {
    const { analysis, formValues, cvText } = state;
    if (!analysis) return;

    // Guard: cvText must be non-empty. Cached profiles don't include the raw
    // CV text. Reset to the upload form so the user can re-analyse, then
    // auto-start the revamp once fresh text is available.
    if (!cvText.trim()) {
      dispatch({ type: 'REVAMP_NEEDS_REUPLOAD' });
      return;
    }

    dispatch({ type: 'START_REVAMP' });

    try {
      const response = await revampCV(
        cvText,
        analysis,
        formValues.targetRole,
        formValues.industry,
      );

      const revampedCv = response.revamp?.revampedCv;
      if (!revampedCv) throw new Error('Revamp returned no CV data.');

      dispatch({ type: 'REVAMP_SUCCESS', payload: revampedCv });
    } catch (err: unknown) {
      const error = err as Error & { requiresSubscription?: boolean };
      dispatch({
        type: 'REVAMP_ERROR',
        payload: error.message || 'Revamp failed. Please try again.',
      });
    }
  }, [state]);

  // ── Auto-revamp after re-analysis (when user clicked Revamp on a cached profile) ──
  useEffect(() => {
    if (state.step === 'result' && state.revampPending && state.cvText.trim()) {
      submitRevamp();
    }
  // submitRevamp is intentionally omitted — we only want this to fire on step/cvText transitions
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.step, state.revampPending, state.cvText]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const setInputMode = (mode: CVInputMode) => dispatch({ type: 'SET_INPUT_MODE', payload: mode });
  const setFile = (file: File | null) => dispatch({ type: 'SET_FILE', payload: file });
  const setCVText = (text: string) => dispatch({ type: 'SET_CV_TEXT', payload: text });
  const setFormValues = (values: Partial<AnalyzeFormValues>) =>
    dispatch({ type: 'SET_FORM_VALUES', payload: values });
  const dismissError = () => dispatch({ type: 'DISMISS_ERROR' });
  const dismissPostModal = () => dispatch({ type: 'SHOW_POST_MODAL', payload: false });
  const goToRevamp = () => dispatch({ type: 'GO_TO_STEP', payload: 'result' });
  const reset = () => dispatch({ type: 'RESET' });

  return {
    state,
    setInputMode,
    setFile,
    setCVText,
    setFormValues,
    submitAnalysis,
    submitRevamp,
    dismissError,
    dismissPostModal,
    goToRevamp,
    reset,
  };
}
