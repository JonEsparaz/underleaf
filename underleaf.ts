import { parseFlags } from "https://deno.land/x/cliffy/flags/mod.ts";
import { walkSync } from "https://deno.land/std/fs/mod.ts";
import { Confirm } from "https://deno.land/x/cliffy/prompt/confirm.ts";
import { download, getCookie, getProjectId, unzip } from "./util.ts";

async function main() {
  const { flags } = parseFlags(Deno.args);

  if (flags.help) {
    console.log("help");
    return;
  }

  const cookie = await getCookie(flags);
  const projectId = await getProjectId(flags);

  console.log("Downloading project...");
  await download(projectId, cookie);

  console.log("Unzipping project...");
  const tempDir = await Deno.makeTempDir();
  await unzip(tempDir);

  const json = Deno.readTextFileSync("./.leafrc.json");
  const config = JSON.parse(json);

  for (const entry of walkSync(tempDir)) {
    if (entry.isFile) {
      if (!config[entry.name]) {
        const shouldCopy = await Confirm.prompt(
          `New file ${entry.name} found. Copy this file?`,
        );
        config[entry.name] = shouldCopy;
      }

      if (config[entry.name]) {
        console.log(`Copying ${entry.name}...`);
        await Deno.copyFile(entry.path, `./${entry.name}`);
      }
    }
  }

  Deno.writeTextFileSync("./.leafrc.json", JSON.stringify(config));

  await Deno.remove("./.overleaf_download.zip");
}

if (import.meta.main) {
  main();
}
