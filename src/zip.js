import gulp from 'gulp'
import zip from 'gulp-zip'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const manifest = require('../build/manifest.json')

// Get the browser from command line args
const isFirefox = process.argv.includes('--firefox')

const browserPrefix = isFirefox ? 'firefox' : 'chrome'
const fileName = `${manifest.name.replaceAll(' ', '-')}-${browserPrefix}-${manifest.version}.zip`

gulp.src('build/**', { encoding: false }).pipe(zip(fileName)).pipe(gulp.dest('package'))
