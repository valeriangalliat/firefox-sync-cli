# Firefox Sync CLI [![npm version](http://img.shields.io/npm/v/firefox-sync-cli.svg?style=flat-square)](https://www.npmjs.org/package/firefox-sync-cli)

> Manage Firefox Sync from the CLI! ✨

## Overview

Firefox Sync is a great tool, but up to now, there was no easy way to
interact with it programmatically, or a command line interface to access
the data it holds (like bookmarks, history, or Lockwise passwords).

Using [Node Firefox Sync](https://github.com/valeriangalliat/node-firefox-sync),
this CLI gives you access to all the endpoints and objects exposed by
the [Firefox Sync API](https://mozilla-services.readthedocs.io/en/latest/storage/apis-1.5.html).

It features two ways to authenticate, one using a Firefox Accounts email
and password to open a session, and one using OAuth. See more about them
[below](#authentication).

## Installation

```sh
npm install -g firefox-sync-cli
```

The command will be available as `ffs`. 😏

## Usage

```
Usage: ffs [options] [command]

Options:
  --version                           Show version.
  -c, --creds <file>                  File to get Firefox Sync creds from (or
                                      write to during authentication and
                                      refresh).
  -v, --verbose                       Output more details.
  -h, --help                          Show this screen.

Commands:
  auth [email] [password]             Sign in using email and password.
  oauth                               Sign in using OAuth.
  collections                         List available collections.
  get [options] <collection> [id...]  Get some or all items from a collection.
                                      When getting all items, pass '--full' to
                                      get the full objects.
  set <collection>                    Store one or multiple payloads from
                                      'stdin' in the given collection.
  delete <collection> <id...>         Delete the given items by ID.
  quota                               Get the current usage and storage quota.
  collection-usage                    Get the usage in kB of all collections.
  collection-counts                   Get the number of items in each
                                      collection.
  configuration                       Get the storage server configuration.
  help [command]                      Display help for command.
```

A typical flow will look like this:

```sh
ffs -c ~/.ffs-creds.json oauth
ffs -c ~/.ffs-creds.json collections
ffs -c ~/.ffs-creds.json get bookmarks --full
```

During authentication, this will create `~/.ffs-creds.json` to store the
credentials necessary to access Firefox Sync.

Further commands read credentials from this file to use that session to
query the API.

## Authentication

### Email and password

This opens a session with full access to the given Firefox Account in
order to get the credentials to access Firefox Sync.

By design, this means this program will have to access to your plaintext
password. It doesn't store it, and just forwards it to [fxa-js-client](https://www.npmjs.com/package/fxa-js-client)
which handles the actual authentication.

### OAuth

You're given a OAuth URL to open in your browser, where you can input
your password in Mozilla's own website, which will in turn grant access
to this program by redirecting to a URL that includes an authentication
code.

With this method, the program never gets access to the plaintext
password, on top of being granted a token with restricted permissions.

That said there's [currently no way](https://www.codejam.info/2021/08/scripting-firefox-sync-lockwise-complete-oauth.html#a-note-about-granular-scopes)
to request access to specific Firefox Sync collections meaning that this
grant will have access to all the native Firefox Sync collections.

Because this program doesn't have its own OAuth client ID, it uses the
public client ID from the [Lockwise Android app](https://github.com/mozilla-lockwise/lockwise-android/blob/d3c0511f73c34e8759e1bb597f2d3dc9bcc146f0/app/src/main/java/mozilla/lockbox/support/Constant.kt#L29%3E).

This means that we don't control the OAuth redirect URL, and can't set
it to a temporary server on some random `localhost` port, which would
allow seamless authentication of this CLI. To work around that, the CLI
will kindly ask you to open the OAuth URL in Firefox, which it knows how
to poll for "visited places" by querying `places.sqlite` in the profile
directory. It will be able to detect the Android app redirect URL to
extract the OAuth code and complete the authentication process.

In case this doesn't work (it's clearly a hack, let's face it), consider
falling back to password authentication!

## See also

[Node Firefox Sync](https://github.com/valeriangalliat/node-firefox-sync),
the underlying client library that powers the CLI.

The story on how this all started when I tried to access my Lockwise
passwords from the CLI:

1. [A journey to scripting Firefox Sync / Lockwise: existing clients](https://www.codejam.info/2021/08/scripting-firefox-sync-lockwise-existing-clients.html)
1. [A journey to scripting Firefox Sync / Lockwise: figuring the protocol](scripting-firefox-sync-lockwise-figuring-the-protocol.html)
1. [A journey to scripting Firefox Sync / Lockwise: understanding BrowserID](scripting-firefox-sync-lockwise-understanding-browserid.html)
1. [A journey to scripting Firefox Sync / Lockwise: hybrid OAuth](scripting-firefox-sync-lockwise-hybrid-oauth.html)
1. [A journey to scripting Firefox Sync / Lockwise: complete OAuth](scripting-firefox-sync-lockwise-complete-oauth.html)
