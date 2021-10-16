const fs = require('fs').promises
const path = require('path')
const os = require('os')
const sqlite3 = require('sqlite3')
const sqlite = require('sqlite')
const ini = require('ini')

function getProfiles (dir, store) {
  return Object.keys(store)
    .filter(key => key.startsWith('Profile'))
    .map(key => store[key])
    .map(profile => ({
      name: profile.Name,
      path: path.resolve(dir, profile.Path)
    }))
}

async function getFirefoxProfilesImpl (dir) {
  try {
    return getProfiles(dir, ini.parse(await fs.readFile(path.resolve(dir, 'profiles.ini'), 'utf8')))
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err
    }
  }
}

async function getFirefoxProfiles () {
  return await getFirefoxProfilesImpl(path.resolve(os.homedir(), '.mozilla/firefox')) ||
    getFirefoxProfilesImpl(path.resolve(os.homedir(), 'Library/Application Support/Firefox'))
}

async function fetchLastRedirectImpl (profile) {
  const db = await sqlite.open({
    filename: `file:${path.resolve(profile.path, 'places.sqlite')}?immutable=1`,
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READONLY | sqlite3.OPEN_URI
  })

  try {
    const result = await db.get("SELECT url FROM moz_places WHERE url LIKE 'https://lockbox.firefox.com/fxa/android-redirect.html%' ORDER BY last_visit_date DESC LIMIT 1")
    return result?.url
  } finally {
    await db.close()
  }
}

function fetchLastRedirect (profiles) {
  return Promise.all(profiles.map(profile => fetchLastRedirectImpl(profile)))
}

async function poll (profiles, initialState) {
  while (true) {
    await new Promise(resolve => setTimeout(resolve, 1000))

    const state = await fetchLastRedirect(profiles)

    for (const [i, url] of state.entries()) {
      if (initialState[i] !== url) {
        console.error('\n')
        return url
      }
    }

    process.stderr.write('.')
  }
}

async function oauth (options) {
  const { sync, verbose } = options
  const profiles = await getFirefoxProfiles()

  if (!profiles || profiles.length === 0) {
    console.error(`Couldn't find Firefox directory.

This method relies on parsing the Firefox history to retreive the OAuth
challenge response and cannot work right now.

Consider using 'ffs auth password' as a fallback.
`)
    process.exit(1)
  }

  if (verbose) {
    for (const profile of profiles) {
      console.error(`[verbose] profile ${profile.name}`)
    }
  }

  const initialState = await fetchLastRedirect(profiles)

  if (verbose) {
    for (const [i, url] of initialState.entries()) {
      console.error(`[verbose] state [${profiles[i].name}] ${url}`)
    }

    console.error()
  }

  const challenge = await sync.auth.oauth.challenge()

  console.error(`Visit the following URL in Firefox to sign in:

    ${challenge.url}
`)

  console.error(`We'll detect the OAuth response automatically.
If it hangs, closing Firefox can sometimes help.
Otheriwse, consider using 'ffs auth password' as a fallback.
`)

  const url = await poll(profiles, initialState)

  if (verbose) {
    console.error(`[verbose] detected ${url}`)
  }

  const result = Object.fromEntries(new URL(url).searchParams)

  return sync.auth.oauth.complete(challenge, result)
}

module.exports = oauth
