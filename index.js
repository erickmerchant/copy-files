const chalk = require('chalk')
const thenify = require('thenify')
const glob = thenify(require('glob'))
const parent = require('glob-parent')
const copyFile = require('cp-file')
const chokidar = require('chokidar')
const path = require('path')

module.exports = function (args) {
  if (args.watch) {
    chokidar.watch(args.source.map((source) => path.join(process.cwd(), source)), {ignoreInitial: true}).on('all', function () {
      copy(args).catch(console.error)
    })
  }

  return copy(args)
}

function copy (args) {
  return Promise.all(args.source.map((source) => glob(path.join(process.cwd(), source), {nodir: true}).then(function (files) {
    return Promise.all(files.map((file) => {
      const relativeNewFile = path.join(args.destination, path.relative(parent(path.join(process.cwd(), source)), file))
      const newFile = path.join(process.cwd(), relativeNewFile)

      return copyFile(file, newFile, { parents: true }).then(() => {
        console.log(chalk.green('\u2714') + ' saved ' + relativeNewFile)
      })
    }))
  })))
}
