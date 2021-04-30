# Underleaf :fallen_leaf:

A Deno-powered CLI tool for downloading source files from
[Overleaf](https://www.overleaf.com/) projects. This project is current a work
in progress (WIP) - the first stable release is coming soon.

## Why?

I write academic reports on Overleaf and want to keep version control of the
`.tex` files via Git. I use this CLI tool to download source files from
Overleaf, then commit them to a Git repository.

> Additionally, I wanted to create something using the Deno runtime.

## How does it work?

The CLI uses headless Chromium to login into https://www.overleaf.com, then
stores your session cookie for future use. The source files are downloaded from
the `/${projectId}/download/zip` endpoint, then unzipped in your working
directory.

## Installation :gear:

- Install [`unzip`](https://linux.die.net/man/1/unzip) (Linux/MacOS only)
- Install the
  [Deno runtime](https://deno.land/manual/getting_started/installation)
- Run `install script`

## Usage :computer:

todo...

### Flags

todo...

## Limitations

_One way operation_. All edits need to be made on Overleaf, then downloaded onto
your local machine for version control of other purposes. This tool cannot help
push local changes back to Overleaf.

## License

MIT
