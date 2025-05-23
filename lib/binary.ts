/**
 * A binary installer for wasm-pack
 * 
 * @module
 */

import { Binary } from "@kingsword/denokit/binary-install";
import * as path from "@std/path";
import os from "node:os";
import denoJson from "../deno.json" with {type: "json"}

const windows = "x86_64-pc-windows-msvc";
const __dirname = path.dirname(path.fromFileUrl(import.meta.url))

type ARCH = "x86_64-pc-windows-msvc" | "x86_64-unknown-linux-musl" | "aarch64-unknown-linux-musl" | "x86_64-apple-darwin"

const getPlatform = (): ARCH => {
  const type = os.type();
  const arch = os.arch();

  // https://github.com/nodejs/node/blob/c3664227a83cf009e9a2e1ddeadbd09c14ae466f/deps/uv/src/win/util.c#L1566-L1573
  if ((type === "Windows_NT" || type.startsWith("MINGW32_NT-")) && arch === "x64") {
    return windows;
  }
  if (type === "Linux" && arch === "x64") {
    return "x86_64-unknown-linux-musl";
  }
  if (type === "Linux" && arch === "arm64") {
    return "aarch64-unknown-linux-musl";
  }
  if (type === "Darwin" && (arch === "x64" || arch === "arm64")) {
    return "x86_64-apple-darwin";
  }

  throw new Error(`Unsupported platform: ${type} ${arch}`);
};

const getBinary = (): Binary => {
  const platform = getPlatform();
  const version = denoJson.version;
  const author = "rustwasm";
  const name = "wasm-pack";
  const url = `https://github.com/${author}/${name}/releases/download/v${version}/${name}-v${version}-${platform}.tar.gz`;
  return new Binary(platform === windows ? "wasm-pack.exe" : "wasm-pack", url, version);
};

/**
 * Installs the binary
 */
const install = (): void => {
  const binary = getBinary();
  binary.install();
};

/**
 * Runs the binary
 */
const run = (): void => {
  const binary = getBinary();
  binary.run();
}

export {
  install,
  run,
};
