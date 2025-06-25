// esbuild.config.js
import esbuild from 'esbuild'

console.log(process.env['CONTAINER'])

const baseEsBuildConfig = {
  bundle: true,
  minify: false,
  platform: 'node',
  sourcemap: true,
  target: 'node20',
  format: 'cjs',
  treeShaking: true,
  loader: {
    '.ts': 'ts' // Handles .ts files
  },
  logLevel: 'info'
}

if (process.env['CONTAINER'] === 'true') {
  console.log('Running esbuild for container')
}

const finalConfig = {
  ...baseEsBuildConfig,
  entryPoints: ['examples/express.ts'],
  outfile: 'dist/express.js'
}
// --- Build Script ---
async function build() {
  try {
    const context = await esbuild.context(finalConfig)

    if (process.argv.includes('--watch')) {
      // Watch mode
      await context.watch()
      console.log('Watching for changes...')
    } else {
      // Single build
      await context.rebuild()
      console.log('Build complete!')
      await context.dispose()
    }
  } catch (error) {
    console.error('Build failed:', error)
    process.exit(1)
  }
}

// --- Run the build ---
build().then(() => console.log('finished build'))
