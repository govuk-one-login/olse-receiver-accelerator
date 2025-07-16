// esbuild.config.js
import esbuild from 'esbuild'

import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { yamlParse } from 'yaml-cfn'

const baseEsBuildConfig = {
  bundle: true,
  minify: false,
  platform: 'node',
  sourcemap: true,
  target: 'node20',
  format: 'esm',
  treeShaking: true,
  loader: {
    '.ts': 'ts' // Handles .ts files
  },
  logLevel: 'info'
}

async function main() {
  if (process.env['CONTAINER'] === 'true') {
    console.log('Running esbuild for container')
    await buildForContainer()
  }
}

async function buildForContainer() {
  const finalConfig = {
    ...baseEsBuildConfig,
    entryPoints: ['examples/express-container/server.ts'],
    outfile: 'dist/examples/express-container/server.js'
  } else if (process.env['AWS_LAMBDA_REFERENCE'] === 'true') {
    console.log('Running esbuild for container')
    await buildFor_AWS_LAMBDA_REFERENCE()
  } else {
    throw new Error('Invalid build target')
  }
}

async function buildFor_AWS_LAMBDA_REFERENCE() {
  const baseLambdaPath = 'examples/aws-lambda'
  const lambdasPath = `${baseLambdaPath}/src/lambda`
  const { Resources } = yamlParse(
    readFileSync(join(dirname('.'), `${baseLambdaPath}/template.yaml`), 'utf-8')
  )

  const awsResources = Object.values(Resources)
  const lambdas = awsResources.filter(
    (resource) => resource.Type === 'AWS::Serverless::Function'
  )

  const entries = lambdas.reduce((entryPoints, lambda) => {
    const lambdaName = lambda.Properties.CodeUri.split('/').pop()
    if (!(lambdaName in entryPoints)) {
      entryPoints.push(`./${lambdasPath}/${lambdaName}/handler.ts`)
    }

    return entryPoints
  }, [])

  console.log('entries')
  console.log(entries)
  const finalConfig = {
    ...baseEsBuildConfig,
    entryPoints: entries,
    outdir: `dist/${lambdasPath}`
  }
  await esbuild.build(finalConfig)
}

async function buildForContainer() {
  const basePath = 'examples/express-container'
  const finalConfig = {
    ...baseEsBuildConfig,
    entryPoints: [`${basePath}/server.ts`],
    outfile: `dist/${basePath}/server.js`
  }
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
main().then(() => console.log('finished build'))
