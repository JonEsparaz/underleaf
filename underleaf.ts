import { parseFlags } from "https://deno.land/x/cliffy/flags/mod.ts";
import { download, getCookie, getProjectId, unzip } from "./util.ts";

async function main() {
  const { flags } = parseFlags(Deno.args);

  if (flags.help) {
    console.log("help");
    return;
  }

  const cookie = await getCookie(flags);
  const projectId = await getProjectId(flags);

  console.log("Downloading project...\n");
  await download(projectId, cookie);

  console.log("Unzipping project...\n");
  const tempDir = await Deno.makeTempDir();
  await unzip(tempDir);

  console.log("Copying main.tex...\n");
  Deno.copyFileSync(`${tempDir}/main.tex`, "./main.tex");

  await Deno.remove("./.overleaf_download.zip");
}

if (import.meta.main) {
  main();
}
