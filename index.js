'use strict'

const { accessSync, F_OK, writeFileSync } = require('fs')

const chalk = require('chalk')
const core = require('conventional-changelog-core')
const strat = require('strat')

const config = require('./config')

const isWin = process.platform === 'win32'
const tick = isWin ? '√' : '✔'
const cross = isWin ? '×' : '✖'

let lines = 0

const notify = (msg, args) =>
  ++lines && console.info(
    `${lines ? '' : '\n'}${chalk.green(tick)} ` +
    strat(msg, args.map(arg => chalk.bold(arg))) + '\n'
  )

const fail = msg =>
  console.error(`${lines ? '' : '\n'}${chalk.red(cross)} ${msg}\n`) ||
  process.exit(1)

const ensureExists = atPath => {
  try {
    accessSync(atPath, F_OK)
  } catch (e) {
    if (e.code === 'ENOENT') {
      notify('created {}', [atPath])
      writeFileSync(atPath, '\n', 'utf-8')
    }
  }
}

const generate = (options, context, gitRawCommitsOpts, parserOpts, writerOpts) => {
  options = options || {}
  options.config = config
  return core(options, context, gitRawCommitsOpts, parserOpts, writerOpts)
}

module.exports = {
  ensureExists,
  fail,
  generate,
  notify
}
