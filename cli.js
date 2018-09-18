#!/usr/bin/env node
const command = require('sergeant')
const copy = require('cp-file')
const chokidar = require('chokidar')
const action = require('./index')

command('copy-files', 'copy files from one directory to another', ({ option, parameter }) => {
  parameter('source', {
    description: 'a directory to copy files from',
    multiple: true,
    required: true
  })

  parameter('destination', {
    description: 'where to save to',
    required: true
  })

  option('watch', {
    description: 'watch for changes',
    alias: 'w'
  })

  return (args) => action({
    copy,
    watch (watch, path, fn) {
      if (watch) {
        chokidar.watch(path, { ignoreInitial: true }).on('all', fn)
      }

      return fn()
    },
    out: process.stdout
  })(args)
})(process.argv.slice(2))
