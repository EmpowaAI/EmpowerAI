# Cleanup Notes

## Root Directory Cleanup

### Status
- ✅ Removed duplicate frontend config files (vite.config.ts, tailwind.config.js, etc.)
- ✅ Removed duplicate documentation files (moved to docs/)
- ✅ Removed test files
- ⚠️ Root `node_modules/` may be recreated by npm workspaces (this is normal for monorepos)
- ⚠️ Root `src/` and `public/` directories may persist (check if they're symlinks or real directories)

### About Root node_modules
If you see a `node_modules/` in the root directory, this is **normal** for npm workspaces. It contains:
- Workspace management files
- Hoisted dependencies (shared across workspaces)
- Only `concurrently` as a dev dependency

This is expected and should be kept. It's different from the `node_modules/` in `frontend/` and `empowerai-backend/`.

### If src/ and public/ persist
If `src/` and `public/` directories still appear in the root:

1. **Check if they're symlinks:**
   ```powershell
   Get-Item src | Select-Object LinkType, Target
   ```

2. **If they're real directories, remove them:**
   ```powershell
   Remove-Item -Path "src" -Recurse -Force
   Remove-Item -Path "public" -Recurse -Force
   ```

3. **Verify they're gone:**
   ```powershell
   Get-ChildItem -Path . -Directory | Where-Object { $_.Name -in @('src', 'public') }
   ```

### Expected Root Structure
```
EmpowerAI/
├── frontend/              # Frontend code
├── empowerai-backend/     # Backend code
├── ai-service/            # AI service
├── docs/                  # Documentation
├── node_modules/          # Workspace node_modules (OK - managed by npm)
├── package.json           # Root package.json
├── package-lock.json      # Root lock file (OK)
└── README.md
```

### What Should NOT Be in Root
- ❌ `src/` directory
- ❌ `public/` directory
- ❌ `vite.config.ts`
- ❌ `tailwind.config.js`
- ❌ `tsconfig.*.json` files
- ❌ `index.html`
- ❌ `eslint.config.js`
- ❌ `vercel.json` (should only be in frontend/)

### Verification
After cleanup, run:
```powershell
Get-ChildItem -Path . -File | Where-Object { $_.Name -match '\.(ts|js|json|html)$' } | Select-Object Name
```

Should only show:
- `package.json`
- `package-lock.json`
- `README.md`
- `.gitignore`
- `TEAM_MESSAGE.txt` (temporary)

