#!/usr/bin/env node
const command = require('sergeant')
const copy = require('cp-file')
const watch = require('@erickmerchant/conditional-watch')
const action = require('./index')

command('copy-files', 'copy files from one directory to another', action({copy, watch, out: process.stdout}))(process.argv.slice(2))
