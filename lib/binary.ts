/**
 * A binary installer for wasm-pack
 *
 * @module
 */

import { Binary } from "@kingsword/denokit/binary-install";
import { which } from "@kingsword/denokit/which";
import os from "node:os";

const windows = "x86_64-pc-windows-msvc";

type ARCH =
  | "x86_64-pc-windows-msvc"
  | "x86_64-unknown-linux-musl"
  | "aarch64-unknown-linux-musl"
  | "x86_64-apple-darwin";

const getPlatform = (): ARCH => {
  const type = os.type();
  const arch = os.arch();

  // https://github.com/nodejs/node/blob/c3664227a83cf009e9a2e1ddeadbd09c14ae466f/deps/uv/src/win/util.c#L1566-L1573
  if (
    (type === "Windows_NT" || type.startsWith("MINGW32_NT-")) &&
    arch === "x64"
  ) {
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

const getVersion = (): string => {
  const command = new Deno.Command(which.sync("npm") ?? "npm", {
    args: ["view", "wasm-pack", "--json"],
    stdin: "inherit",
  });
  const output = command.outputSync();
  const json = JSON.parse(new TextDecoder().decode(output.stdout));

  return json["dist-tags"]["latest"] ?? json.version;
};

const getBinary = (): Binary => {
  const platform = getPlatform();
  const version = getVersion();
  const author = "rustwasm";
  const name = "wasm-pack";
  const url = `https://github.com/${author}/${name}/releases/download/v${version}/${name}-v${version}-${platform}.tar.gz`;
  const tempDirPath = Deno.makeTempDirSync({
    prefix: "denokit_binary_install_",
  });
  return new Binary(
    platform === windows ? "wasm-pack.exe" : "wasm-pack",
    url,
    version,
    { installDirectory: tempDirPath }
  );
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
};

export { install, run };
