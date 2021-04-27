# Underleaf 🍃
A CLI tool for downloading source files from [Overleaf](https://www.overleaf.com/) projects.

## Why?
I write academic reports on Overleaf and want to keep version control of the `.tex` files via Git. I use this CLI tool to download source files from Overleaf, then commit them to a Git repository. Additionally, I wanted to create something using [Deno](https://deno.land/).

## How does it work
The CLI uses headless Chromium to login into https://www.overleaf.com, then stores your session cookie for future use. The source files are downloaded from the `/${projectId}/download/zip` endpoint, then unzipped and copied into your working directory. 

## Installation
- Install [`unzip`](https://linux.die.net/man/1/unzip) (Linux/MacOS only)
- Install the [Deno runtime](https://deno.land/manual/getting_started/installation)
- Run `install script`

## Usage
todo...

## Flags
todo...

## Limitations
*One way operation*. All edits need to be made on Overleaf, then downloaded onto your local machine for version control of other purposes. This tool cannot help push local changes back to Overleaf.

*`main.tex` only*. All files will be downloaded and unzipped, but only `main.tex` will be copied into your working directory. I plan to upgrade this tool to handle copying multiple source files.

## License
MIT
