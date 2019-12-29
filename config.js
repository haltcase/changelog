'use strict'

const { readFile: readFileNode } = require('fs')
const { resolve } = require('path')

const pify = require('pify')

const readFile = pify(readFileNode)

const issueReference = /#([0-9]+)/g
const userReference = /\B@([a-z0-9](?:-?[a-z0-9]){0,38})/g

const templatePaths = {
  commit: resolve(__dirname, 'templates/commit.hbs'),
  footer: resolve(__dirname, 'templates/footer.hbs'),
  header: resolve(__dirname, 'templates/header.hbs'),
  template: resolve(__dirname, 'templates/template.hbs')
}

const parserOpts = {
  headerPattern: /^(\w*)(?:\((.*)\))?: (.*)$/,
  headerCorrespondence: ['type', 'scope', 'subject'],
  noteKeywords: ['BREAKING CHANGE', 'BREAKING CHANGES'],
  revertPattern: /^revert:\s([\s\S]*?)\s*This reverts commit (\w*)\./,
  revertCorrespondence: ['header', 'hash']
}

const labels = {
  feat: 'FEATURES',
  fix: 'BUG FIXES',
  perf: 'PERFORMANCE',
  revert: 'REVERTS',
  docs: 'DOCUMENTATION',
  style: 'STYLE CHANGES',
  refactor: 'REFACTORS',
  test: 'TESTS',
  chore: 'MAINTENANCE',
  ci: 'CI'
}

const showLabels = new Set(['feat', 'fix', 'perf', 'revert'])
const hideLabels = new Set(['docs', 'style', 'refactor', 'test', 'chore', 'ci'])

const writerOpts = {
  transform (commit, context) {
    let discard = true

    commit.notes.forEach(note => {
      note.title = 'BREAKING CHANGES'
      discard = false
    })

    if (showLabels.has(commit.type)) {
      commit.type = labels[commit.type]
    } else if (discard) {
      return
    } else if (hideLabels.has(commit.type)) {
      commit.type = labels[commit.type]
    }

    if (commit.scope === '*') {
      commit.scope = ''
    }

    if (typeof commit.hash === 'string') {
      commit.hash = commit.hash.substring(0, 7)
    }

    const issues = []
    if (typeof commit.subject === 'string') {
      let url = context.repository
        ? `${context.host}/${context.owner}/${context.repository}`
        : context.repoUrl

      if (url) {
        url += '/issues/'
        // issue URLs
        commit.subject = commit.subject.replace(
          issueReference,
          (_, issue) => issues.push(issue) && `[#${issue}](${url}${issue})`
        )
      }

      if (context.host) {
        // user URLs
        commit.subject = commit.subject.replace(
          userReference,
          `[@$1](${context.host}/$1)`
        )
      }
    }

    // remove references that already appear in the subject
    commit.references = commit.references.filter(
      reference => issues.includes(reference.issue)
    )

    return commit
  },

  groupBy: 'type',
  commitGroupsSort: 'title',
  commitsSort: ['scope', 'subject'],
  noteGroupsSort: 'title'
}

module.exports = Promise.all([
  readFile(templatePaths.template, 'utf-8'),
  readFile(templatePaths.header, 'utf-8'),
  readFile(templatePaths.commit, 'utf-8'),
  readFile(templatePaths.footer, 'utf-8')
]).then(([template, header, commit, footer]) => {
  writerOpts.mainTemplate = template
  writerOpts.headerPartial = header
  writerOpts.commitPartial = commit
  writerOpts.footerPartial = footer

  return {
    parserOpts,
    writerOpts
  }
})
