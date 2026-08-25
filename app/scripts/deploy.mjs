// Builds the app and syncs the output into the repo root, which GitHub Pages
// serves for restaurants.swiftgo.online (Pages source: main branch, / root).
// Usage: npm run deploy   (from app/)
import { cpSync, existsSync, readdirSync, rmSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = resolve(fileURLToPath(import.meta.url), '../..')
const repoRoot = resolve(appDir, '..')
const dist = join(appDir, 'dist')

// Never touch these repo-root entries
const KEEP = new Set(['app', 'CNAME', 'README.md', '.git', '.gitignore', '.nojekyll'])

execSync('npm run build', { cwd: appDir, stdio: 'inherit' })

if (!existsSync(join(dist, 'index.html'))) {
  console.error('Build output missing index.html — aborting deploy copy.')
  process.exit(1)
}

for (const entry of readdirSync(repoRoot)) {
  if (KEEP.has(entry)) continue
  rmSync(join(repoRoot, entry), { recursive: true, force: true })
}

cpSync(dist, repoRoot, { recursive: true })
console.log('\nDeployed build to repo root. Review with `git status`, then commit and push.')
