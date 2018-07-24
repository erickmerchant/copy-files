#!/usr/bin/env node
const command = require('sergeant')
const copy = require('cp-file')
const watch = require('@erickmerchant/conditional-watch')
const action = require('./index')

command('copy-files', 'copy files from one directory to another', ({option, parameter}) => {
  parameter('source', {
    description: 'a directory to copy files from',
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

  return (args) => action({copy, watch, out: process.stdout})(args)
})(process.argv.slice(2))
