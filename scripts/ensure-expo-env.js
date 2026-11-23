// Writes expo-env.d.ts when it is missing (metroduel#12).
//
// Expo generates this file on `expo start` and gitignores it, but `tsc` needs
// its `expo/types` reference to type CSS-module and global.css imports. A fresh
// clone or worktree has never run Expo, so typecheck (and the pre-commit hook)
// failed until it did. Runs from `postinstall` (cwd = repo root); never overwrites Expo's copy.
const fs = require('node:fs')
const path = require('node:path')

const target = path.join(process.cwd(), 'expo-env.d.ts')
const contents =
  '/// <reference types="expo/types" />\n\n' +
  '// NOTE: This file should not be edited and should be in your git ignore\n'

if (!fs.existsSync(target)) {
  fs.writeFileSync(target, contents)
}
