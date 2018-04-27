const error = require('sergeant/error')
const chalk = require('chalk')
const thenify = require('thenify')
const glob = thenify(require('glob'))
const path = require('path')
const assert = require('assert')

module.exports = function (deps) {
  assert.equal(typeof deps.copy, 'function')

  assert.equal(typeof deps.watch, 'function')

  assert.ok(deps.out)

  assert.equal(typeof deps.out.write, 'function')

  return function ({parameter, option, command}) {
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
      default: false,
      aliases: ['w']
    })

    return function (args) {
      return deps.watch(args.watch, args.source, function () {
        return glob(path.join(args.source, '**/*'), {nodir: true})
          .then(function (files) {
            return Promise.all(files.map(function (file) {
              const newFile = path.join(args.destination, path.relative(args.source, file))

              return deps.copy(file, newFile, { parents: true }).then(function () {
                return deps.out.write(chalk.green('\u2714') + ' saved ' + newFile + '\n')
              })
            }))
          })
          .catch(error)
      })
    }
  }
}
