PUPPETEER_PRODUCT=chrome deno run -A --unstable https://deno.land/x/puppeteer@9.0.0/install.ts

wget -O ~/.deno/bin/underleaf.ts https://github.com/JonEsparaz/underleaf/releases/download/v1.0.1/underleaf.ts

deno install -n underleaf --unstable --allow-env --allow-read --allow-write --allow-run --allow-net -f ~/.deno/bin/underleaf.ts
