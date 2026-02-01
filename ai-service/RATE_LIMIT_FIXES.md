# AI Service Rate Limit Fixes

## Critical Issues Found

### 1. Retry Logic Retrying on Rate Limits ❌
**Problem**: `ai_client.py` was retrying on `RateLimitError` up to 3 times with exponential backoff.
- 1 request → 4 total requests (1 original + 3 retries)
- All retries count toward OpenAI's rate limit
- Causes immediate rate limit exhaustion

**Fix**: Disabled retries on rate limits - immediately raise `RateLimitExceeded` instead

### 2. Multiple OpenAI Calls Per CV Analysis ❌
**Problem**: Each CV analysis made 2 OpenAI API calls:
- `extract_skills()` → 1 OpenAI call
- `generate_suggestions()` → 1 OpenAI call
- Total: 2 calls per CV upload

**Fix**: Temporarily disabled AI suggestions generation
- Now only 1 OpenAI call per CV (skills extraction)
- Suggestions use keyword-based fallback instead

### 3. No Retry-After Extraction ❌
**Problem**: AI service didn't extract `retry_after` from OpenAI's response headers
- Always defaulted to 60 seconds
- Didn't respect OpenAI's actual rate limit window

**Fix**: Extract `retry_after` from OpenAI error responses and pass it through

## Changes Made

### `ai-service/utils/ai_client.py`
- ✅ Disabled retries on `RateLimitError`
- ✅ Extract `retry_after` from OpenAI response headers
- ✅ Re-raise `RateLimitError` immediately instead of retrying

### `ai-service/services/cv_analyzer.py`
- ✅ Disabled AI suggestions generation (reduces API calls by 50%)
- ✅ Improved keyword fallback for skills extraction
- ✅ Better error handling for rate limits

### `ai-service/routes/cv_analysis.py` & `cv_analysis_file.py`
- ✅ Extract `retry_after` from OpenAI errors
- ✅ Pass `retry_after` in response headers
- ✅ Better error messages

## Expected Impact

- **50% reduction in OpenAI API calls** (2 calls → 1 call per CV)
- **No cascading retries** (prevents 4x request multiplication)
- **Accurate retry times** (respects OpenAI's actual rate limits)
- **Better error messages** (clear distinction between OpenAI vs backend limits)

## Next Steps

1. Deploy AI service with these fixes
2. Monitor OpenAI API usage
3. If still hitting limits, check OpenAI account tier/limits
4. Consider re-enabling AI suggestions with better rate limit handling later
