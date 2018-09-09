const error = require('sergeant/error')
const chalk = require('chalk')
const promisify = require('util').promisify
const glob = promisify(require('glob'))
const path = require('path')
const assert = require('assert')

module.exports = (deps) => {
  assert.strictEqual(typeof deps.copy, 'function')

  assert.strictEqual(typeof deps.watch, 'function')

  assert.ok(deps.out)

  assert.strictEqual(typeof deps.out.write, 'function')

  return (args) => {
    return deps.watch(args.watch, args.source, async () => {
      let globRoot

      if (args.source.length > 1) {
        globRoot = '{' + args.source.join(',') + '}'
      } else {
        globRoot = args.source[0]
      }

      try {
        const files = await glob(path.join(globRoot, '**/*'), { nodir: true })

        return Promise.all(files.map(async (file) => {
          const newFile = path.join(args.destination, path.relative(args.source.reduce((parent, source) => file.startsWith(source) ? source : parent), file))

          await deps.copy(file, newFile, { parents: true })

          return deps.out.write(`${chalk.gray('[copy-files]')} saved ${newFile}\n`)
        }))
      } catch (err) {
        error(err)
      }
    })
  }
}
