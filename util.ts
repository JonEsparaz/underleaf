import { existsSync } from "https://deno.land/std/fs/mod.ts";
import { Buffer } from "https://deno.land/std/io/buffer.ts";
import puppeteer from "https://deno.land/x/puppeteer@9.0.0/mod.ts";
import { Input } from "https://deno.land/x/cliffy/prompt/input.ts";
import { Secret } from "https://deno.land/x/cliffy/prompt/secret.ts";

export async function download(
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

export async function unzip(tempDir: string): Promise<void> {
  const process = Deno.run({
    cmd: Deno.build.os === "windows"
      ? [
        "Expand-Archive",
        "./.overleaf_download.zip",
        "-DestinationPath ",
        tempDir,
      ]
      : ["unzip", "./.overleaf_download.zip", "-d", tempDir],
    stdout: "piped",
    stderr: "piped",
  });

  const { success } = await process.status();

  if (success) {
    const raw = await process.output();
    new TextDecoder().decode(raw);
  }
}

export async function login(): Promise<string> {
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

export async function getCookie(flags: Record<string, boolean | undefined>) {
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

export async function getProjectId(flags: Record<string, boolean | undefined>) {
  let projectId = "";

  if (!existsSync("./.leafrc.json")) {
    projectId = await Input.prompt("Enter Overleaf project ID");
    Deno.writeTextFileSync(
      "./.leafrc.json",
      JSON.stringify({ projectId }),
    );
  } else {
    const json = Deno.readTextFileSync("./.leafrc.json");
    const config = JSON.parse(json);
    projectId = config.projectId;
    if (flags.project || !projectId) {
      projectId = await Input.prompt("Enter Overleaf project ID");
      config.projectId = projectId;
      Deno.writeTextFileSync("./.leafrc.json", JSON.stringify(config));
    }
  }

  return projectId;
}
