# @citycide/changelog &middot; [![Version](https://flat.badgen.net/npm/v/@citycide/changelog)](https://www.npmjs.com/package/@citycide/changelog) [![License](https://flat.badgen.net/npm/license/@citycide/changelog)](https://www.npmjs.com/package/@citycide/changelog) [![JavaScript Standard Style](https://flat.badgen.net/badge/code%20style/standard/green)](https://standardjs.com)

> standard-changelog customized with a few personal tweaks.

See [convention](convention.md). The commit conventions are the same
as the original Angular version, but their appearance in the changelog
has been updated.

## installation

```sh
npm i @citycide/changelog
```

## overview

**TL;DR:** init with `changelog -f`, commit, update `package.json:version`, run `changelog`

If this is your first time running `changelog` or to start a fresh file,
use the `--first-release` or `-f` flag:

```shell
# defaults to the filename `changelog.md`
changelog -f

# uses the given filename
changelog -f -i RELEASE_HISTORY.md
```

Once you have a file started, you just need to follow these steps:

1. commit your changes using [Angular commit conventions](convention.md)
2. increment your project's version in `package.json` as necessary
3. run `changelog` to add the latest version's changes
4. create a GitHub release / tag for the latest update

```sh
changelog

# for other filenames
changelog -i RELEASE_HISTORY.md

# read in one file, output to another
changelog -i CHANGES.MD -o RELEASE_HISTORY.md
```

## usage

```
Usage:

  changelog [options]

Options:
  -i, --in-file          Read the changelog from this file (default: changelog.md)
  -f, --first-release    Generate the changelog for the first time
  -o, --out-file         Write the changelog to this file (default: changelog.md)
  -s, --same-file        Overwrite the input file (default: true)
  -k, --pkg              Path to a specific package.json (default: nearest package.json)
  -a, --append           Whether the generated block should be appended
  -r, --release-count    Number of releases to be generated from the latest
  -v, --verbose          Whether to output more logs
  -c, --context          Path to a JSON file that is used to define template variables
  -l, --lerna-package    Generate a changelog for a specific lerna package (:pkg-name@1.0.0)
  --commit-path          Generate a changelog scoped to a specific directory
```

## output example

```markdown
<a name="2.0.0"></a>
## [`2.0.0`](https://github.com/citycide/changelog/compare/v1.4.2...v2.0.0) (2017-12-12)


###### BUG FIXES

* `b` constant name ([9c486be](https://github.com/citycide/changelog/commit/9c486be))

###### FEATURES

* add `a` constant ([04c471c](https://github.com/citycide/changelog/commit/04c471c))
* add `b` constant ([63fcb1f](https://github.com/citycide/changelog/commit/63fcb1f))
* drop `a` constant ([e19e3ce](https://github.com/citycide/changelog/commit/e19e3ce))

###### PERFORMANCE

* declare `b` as a string directly ([5d9fbee](https://github.com/citycide/changelog/commit/5d9fbee))

###### BREAKING CHANGES

* The `a` constant is removed. Use `b` instead.
```

Which displays as:

<a name="2.0.0"></a>
## [`2.0.0`](https://github.com/citycide/changelog/compare/v1.4.2...v2.0.0) (2017-12-12)


###### BUG FIXES

* `b` constant name ([9c486be](https://github.com/citycide/changelog/commit/9c486be))

###### FEATURES

* add `a` constant ([04c471c](https://github.com/citycide/changelog/commit/04c471c))
* add `b` constant ([63fcb1f](https://github.com/citycide/changelog/commit/63fcb1f))
* drop `a` constant ([e19e3ce](https://github.com/citycide/changelog/commit/e19e3ce))

###### PERFORMANCE

* declare `b` as a string directly ([5d9fbee](https://github.com/citycide/changelog/commit/5d9fbee))

###### BREAKING CHANGES

* The `a` constant is removed. Use `b` instead.

## license

MIT © [Bo Lingen / citycide](https://github.com/citycide)

Original project MIT © [Steve Mao](https://github.com/stevemao) &
[Conventional Changelog](http://conventionalcommits.org/)
