require('./insights').setup()
const createServer = require('./server')

const init = async () => {
  const server = await createServer()
  await server.start()
  console.log('Server running on %s', server.info.uri)

  require('./process-batches')()
}

process.on('unhandledRejection', (err) => {
  console.log(err)
  process.exit(1)
})

init()
