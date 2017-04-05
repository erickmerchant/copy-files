#!/usr/bin/env node
const command = require('sergeant')
const chalk = require('chalk')
const thenify = require('thenify')
const glob = thenify(require('glob'))
const parent = require('glob-parent')
const copyFile = require('cp-file')
const chokidar = require('chokidar')
const path = require('path')

command('assets', 'generate css using postcss, and js using browserify', function ({parameter, option, command}) {
  parameter('source', {
    description: 'what to save',
    required: true
  })

  parameter('destination', {
    description: 'where to save to',
    required: true
  })

  option('watch', {
    description: 'watch for changes',
    type: Boolean,
    aliases: ['w']
  })

  return function (args) {
    if (args.watch) {
      chokidar.watch(path.join(process.cwd(), args.source), {ignoreInitial: true}).on('all', function () {
        copy(args).then(console.error)
      })
    }

    return copy(args)
  }
})(process.argv.slice(2))

function copy (args) {
  return glob(path.join(process.cwd(), args.source), {nodir: true}).then(function (files) {
    return Promise.all(files.map((file) => {
      const relativeNewFile = path.join(args.destination, path.relative(parent(path.join(process.cwd(), args.source)), file))
      const newFile = path.join(process.cwd(), relativeNewFile)

      return copyFile(file, newFile, { parents: true }).then(() => {
        console.log(chalk.green('\u2714') + ' saved ' + relativeNewFile)
      })
    }))
  })
}
