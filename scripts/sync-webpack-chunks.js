#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const args = process.argv.slice(2);
const watchIndex = args.indexOf("--watch");
const hasWatch = watchIndex !== -1;
if (hasWatch) {
  args.splice(watchIndex, 1);
}

const separatorIndex = args.indexOf("--");
let commandArgs = null;
if (separatorIndex !== -1) {
  commandArgs = args.slice(separatorIndex + 1);
  args.length = separatorIndex;
}

const serverDir = path.join(process.cwd(), ".next", "server");
const chunksDir = path.join(serverDir, "chunks");
const copiedFiles = new Map();

async function ensureDirectory(dir) {
  try {
    await fs.promises.mkdir(dir, { recursive: true });
  } catch (error) {
    if (error.code !== "EEXIST") {
      throw error;
    }
  }
}

async function copyChunkFile(fileName) {
  if (!fileName.endsWith(".js")) return;

  const source = path.join(chunksDir, fileName);
  const destination = path.join(serverDir, fileName);

  try {
    const stats = await fs.promises.stat(source);
    const previous = copiedFiles.get(fileName);
    if (previous && previous === stats.mtimeMs) {
      return;
    }

    await ensureDirectory(serverDir);
    await fs.promises.copyFile(source, destination);
    copiedFiles.set(fileName, stats.mtimeMs);
    console.log(`[chunk-sync] Synced ${fileName}`);
  } catch (error) {
    if (error.code === "ENOENT") {
      return;
    }
    console.error(`[chunk-sync] Failed to copy ${fileName}:`, error);
  }
}

async function syncOnce() {
  try {
    const entries = await fs.promises.readdir(chunksDir);
    await Promise.all(entries.map(copyChunkFile));
  } catch (error) {
    if (error.code === "ENOENT") {
      return;
    }
    console.error("[chunk-sync] Unable to read chunks directory:", error);
  }
}

async function main() {
  if (commandArgs && !hasWatch) {
    const child = spawn(commandArgs[0], commandArgs.slice(1), {
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("exit", async (code, signal) => {
      if (code === 0) {
        await syncOnce();
      }
      if (signal) {
        process.kill(process.pid, signal);
      } else {
        process.exit(code ?? 0);
      }
    });

    return;
  }

  await syncOnce();

  let intervalId = null;
  if (hasWatch) {
    intervalId = setInterval(() => {
      void syncOnce();
    }, 1000);
  }

  if (commandArgs) {
    const child = spawn(commandArgs[0], commandArgs.slice(1), {
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    const shutdown = (exitCode) => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      process.exit(exitCode ?? 0);
    };

    child.on("exit", (code) => {
      void syncOnce().then(() => shutdown(code));
    });

    process.on("SIGINT", () => {
      child.kill("SIGINT");
    });
    process.on("SIGTERM", () => {
      child.kill("SIGTERM");
    });
  } else {
    if (!hasWatch) {
      process.exit(0);
    }
  }
}

void main();
