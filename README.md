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

- Install [`unzip`](https://linux.die.net/man/1/unzip)
- Install the
  [Deno runtime](https://deno.land/manual/getting_started/installation)
- Run
  `PUPPETEER_PRODUCT=chrome deno run -A --unstable https://deno.land/x/puppeteer@9.0.0/install.ts`
  to cache the required version of Chromium
- Run
  `deno install -n underleaf --unstable --allow-env --allow-read --allow-write .\underleaf.ts`
  to install the Underleaf CLI

## Usage :computer:

todo...

### Flags

todo...

## Limitations

_One way operation_. All edits need to be made on Overleaf, then downloaded onto
your local machine for version control of other purposes. This tool cannot help
push local changes back to Overleaf.

_No Windows support_. This tool does not currently support Windows. I recommend
using
[Windows System for Linux (WSL)](https://docs.microsoft.com/en-us/windows/wsl/install-win10)
instead.

## License

MIT
