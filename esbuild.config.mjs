// esbuild.config.js
import esbuild from 'esbuild'
import { existsSync, readFileSync, cpSync, mkdirSync } from 'fs'
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
  loader: { '.ts': 'ts' }, // Handles .ts files
  logLevel: 'info'
}

async function main() {
  if (process.env['CONTAINER'] === 'true') {
    console.log('Running esbuild for container')
    await buildForContainer()
  } else if (process.env['AWS_LAMBDA_REFERENCE'] === 'true') {
    console.log('Running esbuild for AWS Lambda reference')
    await buildFor_AWS_LAMBDA_REFERENCE()
  } else {
    throw new Error('Invalid build target')
  }
}

function copySchemas(outdir) {
  const schemasSource = 'schemas'
  const schemasTarget = join(outdir, 'schemas')
  if (existsSync(schemasSource)) {
    if (!existsSync(outdir)) {
      mkdirSync(outdir, { recursive: true })
      console.log('Copied schemas to', schemasTarget)
    }
    cpSync(schemasSource, schemasTarget, { recursive: true })
  } else {
    console.warn('No schemas folder found to copy')
  }
}

async function buildFor_AWS_LAMBDA_REFERENCE() {
  const baseLambdaPath = 'examples/aws-lambda'
  const { Resources } = yamlParse(
    readFileSync(join(dirname('.'), `${baseLambdaPath}/template.yaml`), 'utf-8')
  )

  const lambdas = Object.values(Resources).filter(
    (r) => r && r.Type === 'AWS::Serverless::Function'
  )

  const entries = []
  for (const lambda of lambdas) {
    const codeUri = lambda.Properties.CodeUri
    const handler = lambda.Properties.Handler
    const sourcePath = codeUri.startsWith('dist/')
      ? codeUri.substring(5)
      : codeUri
    const handlerPath = handler.split('.')[0]
    const entry = join('.', sourcePath, `${handlerPath}.ts`)
    if (!entries.includes(entry)) entries.push(entry)
  }

  console.log('entries')
  console.log(entries)

  const finalConfig = {
    ...baseEsBuildConfig,
    format: 'cjs', // Override ESM format for AWS Lambda
    entryPoints: entries,
    outdir: `dist/${baseLambdaPath}/src`
  }
  await esbuild.build(finalConfig)
  copySchemas(outdir)
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

    // Single build
    await context.rebuild()
    console.log('Build complete!')
    await context.dispose()
  } catch (error) {
    console.error('Build failed:', error)
    process.exit(1)
  }
}

// --- Run the build ---
main().then(() => console.log('finished build'))
