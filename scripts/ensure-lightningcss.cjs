const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const repoRoot = path.join(__dirname, "..");
const webRoot = path.join(repoRoot, "apps", "web");
const pkgName = "lightningcss-linux-x64-gnu";
const nodeName = "lightningcss.linux-x64-gnu.node";

function exists(p) {
  try {
    return fs.existsSync(p);
  } catch {
    return false;
  }
}

function findPkg() {
  const dirs = [
    path.join(webRoot, "node_modules", pkgName),
    path.join(repoRoot, "node_modules", pkgName),
  ];
  return dirs.find((d) => exists(path.join(d, nodeName))) ?? null;
}

function copyDir(src, dest) {
  fs.rmSync(dest, { recursive: true, force: true });
  fs.cpSync(src, dest, { recursive: true });
}

if (process.platform !== "linux") {
  process.exit(0);
}

let pkgDir = findPkg();
if (!pkgDir) {
  execSync(`npm install ${pkgName}@1.32.0 --no-save --os=linux --cpu=x64 --libc=glibc`, {
    cwd: webRoot,
    stdio: "inherit",
  });
  pkgDir = findPkg();
}

if (!pkgDir) {
  console.warn("ensure-lightningcss: linux package still missing");
  process.exit(0);
}

const nestedPkg = path.join(webRoot, "node_modules", pkgName);
if (path.resolve(pkgDir) !== path.resolve(nestedPkg)) {
  copyDir(pkgDir, nestedPkg);
}

const lightningDir = path.join(webRoot, "node_modules", "lightningcss");
if (exists(lightningDir)) {
  fs.copyFileSync(path.join(pkgDir, nodeName), path.join(lightningDir, nodeName));
}

console.log("ensure-lightningcss: linux binary is in apps/web/node_modules");
