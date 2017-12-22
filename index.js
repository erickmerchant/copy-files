const error = require('sergeant/error')
const chalk = require('chalk')
const thenify = require('thenify')
const glob = thenify(require('glob'))
const parent = require('glob-parent')
const path = require('path')
const assert = require('assert')

module.exports = function (deps) {
  assert.equal(typeof deps.copy, 'function')

  assert.equal(typeof deps.watch, 'function')

  assert.ok(deps.out)

  assert.equal(typeof deps.out.write, 'function')

  return function ({parameter, option, command}) {
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

    return function (args) {
      return Promise.all(args.source.map((source) => {
        source = path.join(process.cwd(), source)

        const directory = parent(source)

        return deps.watch(args.watch, directory, () => {
          return glob(source, {nodir: true})
          .then(function (files) {
            return Promise.all(files.map((file) => {
              const relativeNewFile = path.join(args.destination, path.relative(directory, file))
              const newFile = path.join(process.cwd(), relativeNewFile)

              return deps.copy(file, newFile, { parents: true }).then(() => {
                deps.out.write(chalk.green('\u2714') + ' saved ' + relativeNewFile + '\n')
              })
            }))
          })
          .catch(error)
        })
      }))
    }
  }
}
