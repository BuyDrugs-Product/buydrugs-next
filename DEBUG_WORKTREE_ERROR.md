# Debugging TypeScript Worktree Error

## Problem
TypeScript is checking a file at: `C:/Users/en/.cursor/worktrees/design-buydrugs/WAqqR/design-system-showcase/vitest.config.mts`

## Why It's Still Happening

1. **Absolute Path Outside Workspace**: The file is in an absolute path that TypeScript might be checking regardless of workspace settings
2. **Multiple Workspace Folders**: Cursor might have multiple workspace roots including the worktree
3. **File Might Be Open**: If the file is open in a tab, TypeScript will check it
4. **TypeScript Cache**: TypeScript server might have cached the file reference

## Debugging Steps

### Step 1: Check Workspace Configuration
1. Open Command Palette (`Ctrl+Shift+P`)
2. Type "Preferences: Open Workspace Settings (JSON)"
3. Check if there are multiple `folders` entries
4. Look for any folder pointing to `.cursor/worktrees` or `design-system-showcase`

### Step 2: Check Open Files
1. Check if `vitest.config.mts` from the worktree is open in any tab
2. Close it if found
3. Check "Recently Opened" files

### Step 3: Check TypeScript Server Logs
1. Open Command Palette
2. Type "TypeScript: Open TS Server Log"
3. Look for references to the worktree path
4. Check what tsconfig files TypeScript is using

### Step 4: Check for Multiple tsconfig Files
1. Search for all `tsconfig.json` files in the project
2. Check if any reference the worktree path
3. Check if any have `include` patterns that might match worktree files

### Step 5: Verify File Exists
Check if the file actually exists at that path (it might be a stale reference)

## Solutions (Try in Order)

### Solution 1: Close and Remove from Workspace
1. Close Cursor completely
2. Reopen only the `design-buydrugs` folder (not the worktree)
3. If you have a workspace file, edit it to remove worktree folders

### Solution 2: Add to TypeScript Ignore
Create/update `.vscode/settings.json` with more aggressive exclusions

### Solution 3: Delete the Worktree File (if safe)
If the worktree is not needed:
```bash
# Navigate to the worktree location
cd C:/Users/en/.cursor/worktrees/design-buydrugs/WAqqR/design-system-showcase
# Delete the vitest.config.mts file (if it's safe to do so)
```

### Solution 4: Use TypeScript Project References
Ensure the root tsconfig only references `buydrugs-next` and doesn't include worktrees

### Solution 5: Disable TypeScript for That Specific File
Add to `.vscode/settings.json`:
```json
{
  "typescript.validate.enable": true,
  "files.associations": {
    "**/.cursor/worktrees/**/*.mts": "plaintext"
  }
}
```

### Solution 6: Nuclear Option - Reset TypeScript
1. Close Cursor
2. Delete `.vscode` folder (backup first)
3. Delete `tsconfig.tsbuildinfo` files
4. Reopen Cursor
5. Recreate settings

## Recommended Immediate Actions

1. **Check if file is open**: Close any tabs with worktree files
2. **Restart TS Server**: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"
3. **Check workspace folders**: Ensure only `design-buydrugs` is in workspace
4. **Try Solution 5**: Force TypeScript to treat worktree files as plaintext

