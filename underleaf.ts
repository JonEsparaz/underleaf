import { parseFlags } from "https://deno.land/x/cliffy/flags/mod.ts";
import { download, getCookie, getProjectId, unzip } from "./util.ts";

async function main() {
  const rmFlags = Deno.build.os === "windows" ? "-r" : "-rf";
  Deno.run({
    cmd: ["rm", rmFlags, "./.overleaf_download", "./.overleaf_download.zip"],
  });
  Deno.run({ cmd: ["mkdir", ".overleaf_download"] });

  const { flags } = parseFlags(Deno.args);

  const cookie = await getCookie(flags);
  const projectId = await getProjectId(flags);

  console.log("Downloading project...\n");
  await download(projectId, cookie);

  console.log("Unzipping project...\n");
  unzip();

  console.log("Copying main.tex...\n");
  Deno.run({ cmd: ["mv", "./.overleaf_download/main.tex", "."] });
}

if (import.meta.main) {
  main();
}
