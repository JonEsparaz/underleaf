# Underleaf :fallen_leaf:

A Deno-powered CLI tool for downloading source files from
[Overleaf](https://www.overleaf.com/) projects.

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
  `curl -s https://raw.githubusercontent.com/JonEsparaz/underleaf/main/install.sh | sh`

## Usage :computer:

Move into the directory where you want to download the source files, then run
`underleaf`.

The first time you run `underleaf`, you will be prompted for your Overleaf login
credentials. If your session cookie has expired, you will be automatically
re-prompted for your credentials.

Additionally, you will be prompted for your Overleaf project's ID.

### Ignore patterns

Running `underleaf --ignore` allows you to specify ignore patterns to prevent
certain files and/or directories that exist on Overleaf from being expanded into
your working directory.

Example: to ignore all `.png` files, run `underleaf --ignore`, follow the
prompts, and add the pattern `*.png`.

### Flags

| Flag(s)           | Description                               |
| ----------------- | ----------------------------------------- |
| `--ignore`        | Add, delete or update ignore patterns     |
| `--ignore --list` | List the current set of ignore patterns   |
| `--login`         | Force login and re-prompt for credentials |
| `--project`       | Modify the project ID                     |
| `--help`          | View a summary of available flags         |

## Limitations

_One way operation_. All edits need to be made on Overleaf, then downloaded onto
your local machine for version control or other purposes. This tool cannot help
push local changes back to Overleaf.

_No Windows support_. This tool does not work in Windows Powershell or CMD. 
I recommend using
[Windows System for Linux (WSL)](https://docs.microsoft.com/en-us/windows/wsl/install-win10).

## License

MIT
