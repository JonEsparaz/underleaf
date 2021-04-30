import { Buffer } from "https://deno.land/std/io/buffer.ts";
import { existsSync } from "https://deno.land/std/fs/mod.ts";
import puppeteer from "https://deno.land/x/puppeteer@9.0.0/mod.ts";
import { parseFlags } from "https://deno.land/x/cliffy/flags/mod.ts";
import { Input } from "https://deno.land/x/cliffy/prompt/input.ts";
import { Secret } from "https://deno.land/x/cliffy/prompt/secret.ts";
import { Confirm } from "https://deno.land/x/cliffy/prompt/confirm.ts";
import { Select } from "https://deno.land/x/cliffy/prompt/select.ts";

type UnderleafConfig = {
  projectId?: string;
  ignore?: Array<string>;
};

type Flags = Record<string, boolean | undefined>;

async function download(
  projectId: string,
  cookie: string,
): Promise<void> {
  const project = await fetch(
    `https://www.overleaf.com/project/${projectId}/download/zip`,
    { headers: { cookie } },
  );
  const blob = await project.blob();
  const buffer = await blob.arrayBuffer();
  const unit8arr = new Buffer(buffer).bytes();
  Deno.writeFileSync("./.overleaf_download.zip", unit8arr);
}

async function unzip(): Promise<void> {
  const json = Deno.readTextFileSync("./.leafrc.json");
  const config: UnderleafConfig = JSON.parse(json);

  const cmd = ["unzip", "./.overleaf_download.zip"];

  if (config?.ignore?.length) {
    cmd.push("-x");
    config.ignore.forEach((pattern) => {
      cmd.push(pattern);
    });
  }

  const process = Deno.run({
    cmd,
    stdout: "piped",
    stderr: "piped",
  });

  Deno.writeTextFileSync("./.leafrc.json", JSON.stringify(config));

  const { success } = await process.status();

  if (success) {
    const raw = await process.output();
    new TextDecoder().decode(raw);
  }
}

async function login(): Promise<string> {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto("https://overleaf.com/login");

  const email = await Input.prompt("Enter your email");
  const password = await Secret.prompt("Enter your password");

  await page.type("#email", email);
  await page.type("#password", password);

  await page.click('button[type="submit"]');

  const res = await page.waitForNavigation();

  const resCookie = res?.headers()["set-cookie"];

  let cookie = "";

  if (resCookie) {
    cookie = resCookie.substring(0, resCookie.indexOf(";") + 1);
    const searchString = "Expires=";
    const resCookieTail = resCookie.substring(
      resCookie.indexOf(searchString) + searchString.length,
    );
    const expires = resCookieTail.substring(0, resCookieTail.indexOf(";"));

    Deno.writeTextFileSync(
      `${Deno.env.get("HOME")}/.deno/overleaf_cookie.txt`,
      cookie + "\n" + expires,
    );
  }

  await browser.close();

  return cookie;
}

async function getCookie(flags: Flags) {
  let cookie = "";

  if (flags.login) {
    cookie = await login();
  } else {
    try {
      const cookieData = Deno.readTextFileSync(
        `${Deno.env.get("HOME")}/.deno/overleaf_cookie.txt`,
      );
      const cookieDataArray = cookieData.split("\n");
      const oldCookie = cookieDataArray[0];
      const expires = new Date(cookieDataArray[1]);

      if (expires > new Date()) {
        return oldCookie;
      }
    } catch (e) {
      if (e instanceof Deno.errors.NotFound || e instanceof RangeError) {
        cookie = await login();
      } else {
        console.log(e);
      }
    }
  }

  return cookie;
}

async function getProjectId(flags: Flags) {
  let projectId = "";

  if (!existsSync("./.leafrc.json")) {
    projectId = await Input.prompt("Enter Overleaf project ID");
    Deno.writeTextFileSync(
      "./.leafrc.json",
      JSON.stringify({ projectId }),
    );
  } else {
    const json = Deno.readTextFileSync("./.leafrc.json");
    const config: UnderleafConfig = JSON.parse(json);
    projectId = config.projectId ?? "";
    if (flags.project || !projectId) {
      projectId = await Input.prompt("Enter Overleaf project ID");
      config.projectId = projectId;
      Deno.writeTextFileSync("./.leafrc.json", JSON.stringify(config));
    }
  }

  return projectId;
}

async function ignoreConfig(list?: boolean) {
  const json = Deno.readTextFileSync("./.leafrc.json");
  const config: UnderleafConfig = JSON.parse(json);
  if (!config.ignore) {
    config.ignore = [];
  }

  if (list) {
    if (!config.ignore.length) {
      console.log("Ignore config is empty.");
    }

    config.ignore.forEach((pattern: string) => {
      console.log(pattern);
    });

    return;
  }

  while (1) {
    const option = await Select.prompt({
      message: "Edit ignore configuration",
      options: [
        { name: "Add", value: "Add" },
        { name: "Delete", value: "Delete" },
        { name: "Update", value: "Update" },
      ],
    });

    if (option === "Add") {
      const x = await Input.prompt("Add filter pattern");
      config.ignore.push(x);
    } else {
      const x = await Select.prompt({
        message: `${option} filter pattern`,
        options: config.ignore.map((item: string) => {
          return { name: item, value: item };
        }),
      });

      const idx = config.ignore.indexOf(x);

      if (option === "Delete") {
        config.ignore.splice(idx, 1);
      } else if (option === "Update") {
        const xEdited = await Input.prompt({
          default: x,
          message: "Updating pattern",
        });
        config.ignore[idx] = xEdited;
      }
    }

    const done = await Confirm.prompt({ default: true, message: "Done?" });
    if (done) {
      break;
    }
  }

  Deno.writeTextFileSync("./.leafrc.json", JSON.stringify(config));
}

async function main() {
  const { flags } = parseFlags(Deno.args);

  if (flags.help) {
    console.log("--ignore: Add, delete or update ignore patters");
    console.log("`--ignore --list: List the current set of ignore patterns");
    console.log("--login: Force login and re-prompt for credentials");
    console.log("--project: Modify the project ID");
    return;
  }

  if (flags.ignore) {
    await ignoreConfig(flags.list);
    return;
  }

  const cookie = await getCookie(flags);
  const projectId = await getProjectId(flags);
  await download(projectId, cookie);
  await unzip();

  await Deno.remove("./.overleaf_download.zip");
}

if (import.meta.main) {
  main();
}
