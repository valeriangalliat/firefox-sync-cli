const { Command } = require('commander')
const Sync = require('firefox-sync')
const { version } = require('./package')

const auth = {
  password: require('./password'),
  oauth: require('./oauth')
}

const program = new Command()

program
  .helpOption('-h, --help', 'Show this screen.')
  .version(version, '--version', 'Show version.')
  .addHelpCommand('help [command]', 'Display help for command.')
  .allowExcessArguments(false)

program
  .option('-c, --creds <file>', 'File to get Firefox Sync creds from (or write to during authentication and refresh).')
  .option('-v, --verbose', 'Output more details.')

program.hook('preAction', (program, command) => {
  const credsFile = program.opts().creds

  const sync = Sync({
    credsFile,
    oauthOptions: {
      access_type: 'offline'
    }
  })

  if (!['password', 'oauth'].includes(command.name())) {
    if (!credsFile) {
      program._displayError(1, 'sync.missingCreds', "error: missing creds, see '--creds'")
    }
  }

  // Inject Sync instance.
  command.setOptionValue('sync', sync)
})

async function handleCreds (args, creds) {
  if (!args['--creds']) {
    log(creds)
    return
  }

  // Library alrady took care of this with `credsFile`.
  console.error(`Wrote creds to '${args['--creds']}'`)
}

program
  .command('auth [email] [password]')
  .description('Sign in using email and password.')
  .action(async (email, password, options) => handleCreds(options, await auth.password(email, password, options)))

program
  .command('oauth')
  .description('Sign in using OAuth.')
  .action(async options => handleCreds(options, await auth.oauth(options)))

function log (object) {
  console.log(JSON.stringify(object, null, 2))
}

program
  .command('collections')
  .description('List available collections.')
  .action(async options => log(await options.sync.getCollections()))

program
  .command('get <collection> [id...]')
  .description("Get some or all items from a collection. When getting all items, pass '--full' to get the full objects.")
  .option('--full', 'Retrieve full objects (implicit when selecting specific objects).')
  .action(async (collection, ids, options) => {
    const params = {}

    if (options.full) {
      params.full = true
    }

    if (ids.length > 0) {
      params.full = true
      params.ids = ids
    }

    log(await options.sync.getCollection(collection, params))
  })

program
  .command('set <collection>')
  .description("Store one or multiple payloads from 'stdin' in the given collection.")
  .action((collection, id) => {
    console.error(`Write methods not yet implemented!
Feel free to contribute at <https://github.com/valeriangalliat/firefox-sync-cli>!`)
    process.exit(1)
  })

program
  .command('delete <collection> <id...>')
  .description('Delete the given items by ID.')
  .action((collection, id) => {
    console.error(`Write methods not yet implemented!
Feel free to contribute at <https://github.com/valeriangalliat/firefox-sync-cli>!`)
    process.exit(1)
  })

program
  .command('quota')
  .description('Get the current usage and storage quota.')
  .action(async options => log(await options.sync.getQuota()))

program
  .command('collection-usage')
  .description('Get the usage in kB of all collections.')
  .action(async options => log(await options.sync.getCollectionUsage()))

program
  .command('collection-counts')
  .description('Get the number of items in each collection.')
  .action(async options => log(await options.sync.getCollectionCounts()))

program
  .command('configuration')
  .description('Get the storage server configuration.')
  .action(async options => log(await options.sync.getConfiguration()))

function cli (argv) {
  return program.parseAsync(argv)
}

module.exports = cli
