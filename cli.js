#!/usr/bin/env node
const command = require('sergeant')
const copy = require('./index')

command('copy-files', 'copy files from one directory to another', function ({parameter, option, command}) {
  parameter('source', {
    description: 'what to save',
    required: true,
    multiple: true
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

  return copy
})(process.argv.slice(2))
