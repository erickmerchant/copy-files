const error = require('sergeant/error')
const chalk = require('chalk')
const promisify = require('util').promisify
const glob = promisify(require('glob'))
const path = require('path')
const assert = require('assert')

module.exports = function (deps) {
  assert.equal(typeof deps.copy, 'function')

  assert.equal(typeof deps.watch, 'function')

  assert.ok(deps.out)

  assert.equal(typeof deps.out.write, 'function')

  return function (args) {
    return deps.watch(args.watch, args.source, function () {
      return glob(path.join(args.source, '**/*'), {nodir: true})
        .then(function (files) {
          return Promise.all(files.map(function (file) {
            const newFile = path.join(args.destination, path.relative(args.source, file))

            return deps.copy(file, newFile, { parents: true }).then(function () {
              return deps.out.write(`${chalk.gray('[copy-files]')} saved ${newFile}\n`)
            })
          }))
        })
        .catch(error)
    })
  }
}
