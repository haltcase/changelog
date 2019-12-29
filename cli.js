#!/usr/bin/env node

'use strict'

const { createReadStream, createWriteStream } = require('fs')
const { resolve } = require('path')
const { Readable } = require('stream')

const addStream = require('add-stream')
const chalk = require('chalk')
const del = require('del')
const pickBy = require('lodash.pickby')
const meow = require('meow')
const tempy = require('tempy')

const { ensureExists, fail, generate, notify } = require('.')

const help = chalk`
  {bold Usage:} {yellow changelog} (...options)

  {bold Options:}
    -i, --in-file         <file>        Read the changelog from this file (default: changelog.md)
    -f, --first-release                 Generate the changelog for the first time
    -o, --out-file        <file>        Write the changelog to this file (default: changelog.md)
    -s, --same-file                     Overwrite the input file (default: true)
    -k, --pkg             <path>        Path to a specific package.json (default: nearest package.json)
    -a, --append                        Whether the generated block should be appended
    -r, --release-count   <#>           Number of releases to be generated from the latest
    -V, --verbose                       Whether to output more logs
    -c, --context         <path>        Path to a JSON file that is used to define template variables
    -l, --lerna-package   <name>        Generate a changelog for a specific lerna package (:pkg-name@1.0.0)
    --commit-path         <directory>   Generate a changelog scoped to a specific directory

    -h, --help       Show this help message
    -v, --version    Output the {yellow changelog} version number
    \n
`

const { flags } = meow({
  description: false,
  help,
  flags: {
    append: { type: 'boolean', alias: 'a' },
    context: { type: 'string', alias: 'c' },
    firstRelease: { type: 'boolean', alias: 'f' },
    help: { type: 'boolean', alias: 'h' },
    inFile: { type: 'string', alias: 'i', default: 'changelog.md' },
    pkg: { type: 'string', alias: 'k' },
    lernaPackage: { type: 'string', alias: 'l' },
    outFile: { type: 'string', alias: 'o' },
    releaseCount: { type: 'number', alias: 'r' },
    sameFile: { type: 'boolean', alias: 's', default: true },
    verbose: { type: 'boolean', alias: 'V' },
    version: { type: 'boolean', alias: 'v' }
  }
})

const {
  append,
  context,
  inFile,
  lernaPackage,
  pkg,
  sameFile,
  verbose
} = flags

const outFile = sameFile ? (flags.outFile || inFile) : flags.outFile
const releaseCount = flags.firstRelease ? 0 : flags.releaseCount

const options = pickBy({
  pkg: {
    path: pkg
  },
  append,
  releaseCount,
  lernaPackage
}, v => v !== undefined)

if (verbose) {
  options.warn = console.warn.bind(console)
}

let templateContext

const outputError = error => {
  if (verbose) {
    console.error(chalk.grey(error.stack))
  } else {
    console.error(chalk.red(error.toString()))
  }
  process.exit(1)
}

if (context) {
  try {
    templateContext = require(resolve(process.cwd(), context))
  } catch (e) {
    outputError(e)
  }
}

const commitPath = flags.commitPath ? { path: flags.commitPath } : {}
const changelogStream = generate(options, templateContext, commitPath)
  .on('error', e => {
    if (e.message.indexOf(`ambiguous argument 'HEAD'`) > 0) {
      fail('Could not fetch commits. Is this a new repository?')
    }

    outputError(e)
  })

ensureExists(inFile)

let readStream = null
if (releaseCount !== 0) {
  readStream = createReadStream(inFile).on('error', outputError)
} else {
  readStream = new Readable()
  readStream.push(null)
}

if (options.append) {
  changelogStream
    .pipe(createWriteStream(outFile, { flags: 'a' }))
    .on('finish', () => notify('appended changes to {}', [outFile]))
} else {
  const tmp = tempy.file({ extension: 'md' })

  changelogStream
    .pipe(addStream(readStream))
    .pipe(createWriteStream(tmp))
    .on('finish', () => {
      createReadStream(tmp)
        .pipe(createWriteStream(outFile))
        .on('finish', () => {
          notify('output changes to {}', [outFile])
          del.sync(tmp, { force: true })
        })
    })
}
