const test = require('tape')
const chalk = require('chalk')
const execa = require('execa')
const stream = require('stream')

const noopDefiners = {
  parameter () {},
  option () {}
}

const noopDeps = {
  copy () { },
  watch () { },
  out: new stream.Writable()
}

test('index.js - options and parameters', function (t) {
  t.plan(6)

  const parameters = {}
  const options = {}

  require('./index')(noopDeps)({
    parameter (name, args) {
      parameters[name] = args
    },
    option (name, args) {
      options[name] = args
    }
  })

  t.ok(parameters.source)

  t.equal(parameters.source.required, true)

  t.ok(parameters.destination)

  t.equal(parameters.destination.required, true)

  t.ok(options.watch)

  t.deepEqual(options.watch.aliases, ['w'])
})

test('index.js - functionality', function (t) {
  t.plan(5)

  const out = new stream.Writable()
  const output = []
  const olds = []
  const news = []

  out._write = function (line, encoding, done) {
    output.push(line.toString('utf8'))

    done()
  }

  require('./index')({
    watch (watch, directory, fn, options) {
      t.equal(watch, true)

      t.equal(directory, './fixtures/')

      return fn()
    },
    copy (oldFile, newFile) {
      olds.push(oldFile)

      news.push(newFile)

      return Promise.resolve(true)
    },
    out
  })(noopDefiners)({
    source: './fixtures/',
    destination: 'dest',
    watch: true
  })
    .then(function () {
      t.deepEqual(olds, [
        'fixtures/a.txt',
        'fixtures/b.txt',
        'fixtures/c/d.txt'
      ])

      t.deepEqual(news, [
        'dest/a.txt',
        'dest/b.txt',
        'dest/c/d.txt'
      ])

      t.deepEqual(output, [
        `${chalk.gray('[copy-files]')} saved dest/a.txt\n`,
        `${chalk.gray('[copy-files]')} saved dest/b.txt\n`,
        `${chalk.gray('[copy-files]')} saved dest/c/d.txt\n`
      ])
    })
})

test('cli.js', async function (t) {
  t.plan(4)

  try {
    await execa('node', ['./cli.js', '-h'])
  } catch (e) {
    t.ok(e)

    t.equal(e.stderr.includes('Usage'), true)

    t.equal(e.stderr.includes('Options'), true)

    t.equal(e.stderr.includes('Parameters'), true)
  }
})
