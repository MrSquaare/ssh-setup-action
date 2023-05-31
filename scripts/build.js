const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')
const process = require('process')

const buildDir = path.join(process.cwd(), 'build')
const distDir = path.join(process.cwd(), 'lib')

const buildIndexJs = path.join(buildDir, 'index.js')
const distIndexJs = path.join(distDir, 'index.js')
const distCleanupJs = path.join(distDir, 'cleanup.js')

var ncc = `./node_modules/.bin/ncc`;
if (process.platform === "win32") {
    ncc = `.\\node_modules\\.bin\\ncc.cmd`;
}

if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir)
}

// Build the main index.js file
console.log('Building index.ts...')
execSync(`${ncc} build src/index.ts -q -m -o ${buildDir}`)
if (fs.existsSync(distIndexJs)) {
    fs.unlinkSync(distIndexJs)
}
fs.renameSync(buildIndexJs, distIndexJs)

// Build the cleanup.js file
console.log('Building cleanup.ts...')
execSync(`${ncc} build src/cleanup.ts -q -m -o ${buildDir}`)
if (fs.existsSync(distCleanupJs)) {
    fs.unlinkSync(distCleanupJs)
}
fs.renameSync(buildIndexJs, distCleanupJs)

console.log('Cleaning up...')
fs.rmdirSync(buildDir)

console.log('Done')