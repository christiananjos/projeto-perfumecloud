// Gera dist/ com só o que deve ser público no deploy (Azure Static Web Apps usa
// output_location: "dist" no workflow) - evita expor node_modules/, docs/, testes,
// configs internas etc., que ficavam públicas quando o output_location era "/".
import { cpSync, mkdirSync, rmSync, existsSync, readdirSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import path from "node:path";

const outDir = "dist";

if (existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir);

execSync(
  "npx tailwindcss -i ./assets/css/tailwind.src.css -o ./assets/css/tailwind.css --minify",
  { stdio: "inherit" },
);

cpSync("index.html", path.join(outDir, "index.html"));

function copyAssets(src, dest) {
  mkdirSync(dest, { recursive: true });
  for (const entry of readdirSync(src)) {
    const srcPath = path.join(src, entry);
    const destPath = path.join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyAssets(srcPath, destPath);
    } else if (!entry.endsWith(".test.js") && entry !== "tailwind.src.css") {
      cpSync(srcPath, destPath);
    }
  }
}

copyAssets("assets", path.join(outDir, "assets"));

console.log(`dist/ pronta em ${path.resolve(outDir)}`);
