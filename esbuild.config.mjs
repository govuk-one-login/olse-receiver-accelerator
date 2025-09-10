// esbuild.config.js
import esbuild from 'esbuild'
import { existsSync, readFileSync } from 'fs'
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
  } else if (process.env['AWS_LAMBDA_REFERENCE'] === 'true') {
    console.log('Running esbuild for container')
    await buildFor_AWS_LAMBDA_REFERENCE()
  } else {
    throw new Error('Invalid build target')
  }
}

function copySchemas(outdir) {
  const schemasSource = 'schemas'
  const scehmasTarget = join(outdir, 'schemas')
  if (existsSync(schemasSource)) {
    if (!existsSync(outdir)) {
      fs.mkdirSync(outdir, { recursive: true })
      console.log('Copied schemas to', scehmasTarget)
    }
    fs.cpSync(schemasSource, scehmasTarget, { recursive: true })
  } else {
    console.warn('No schemas folder found to copy')
  }
}
async function buildFor_AWS_LAMBDA_REFERENCE() {
  const baseLambdaPath = 'examples/aws-lambda'
  const { Resources } = yamlParse(
    readFileSync(join(dirname('.'), `${baseLambdaPath}/template.yaml`), 'utf-8')
  )

  const awsResources = Object.values(Resources)
  const lambdas = awsResources.filter(
    (resource) => resource.Type === 'AWS::Serverless::Function'
  )

  const entries = lambdas.reduce((entryPoints, lambda) => {
    const codeUri = lambda.Properties.CodeUri

    const sourcePath = codeUri.startsWith('dist/')
      ? codeUri.substring(5)
      : codeUri

    const handlerPath = join('.', sourcePath, 'handler.ts')
    if (!entryPoints.includes(handlerPath)) {
      entryPoints.push(handlerPath)
    }

    return entryPoints
  }, [])

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
