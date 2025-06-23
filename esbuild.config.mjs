// esbuild.config.js
import esbuild from 'esbuild'

// --- Build Script ---
async function build() {
  try {
    const context = await esbuild.context({
      entryPoints: ['src/index.ts'],
      // If you have multiple entry points and want them as separate files, use `outdir`
      // outdir: outdir,
      // If you have a single entry point or want to bundle everything into one file, use `outfile`
      outfile: 'dist/index.js',
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
      logLevel: 'info' // 'silent', 'verbose', 'info', 'warning', 'error',
    })

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
