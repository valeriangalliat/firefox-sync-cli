# Firefox Sync CLI

> Manage Firefox Sync from the CLI! ✨

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
