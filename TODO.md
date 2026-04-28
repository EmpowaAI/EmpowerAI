# CV Analyzer 400 Error Fix

## Current Status
- [x] Identified root cause: FormData field mismatch
- [ ] Fix aiService.ts jobRequirements append logic
- [ ] Fix api.ts cvAPIReal.analyzeFile() field name ('file' → 'cvFile')
- [ ] Test DOCX file upload
- [ ] Verify no 400 errors in console
- [ ] Update frontend error handling if needed

## Root Cause Analysis
Backend expects:
```
cvFile: UploadFile = File(...)
jobRequirements: Optional[str] = Form(None)
```

aiService.ts sends:
```
formData.append('cvFile', file)           ✅ Correct
formData.append('jobRequirements', '[]')  ❌ JSON string validation fails
