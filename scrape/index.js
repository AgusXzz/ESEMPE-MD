/* [ Ngambil kode nya nekobot jir 😭 ] */

import chokidar from 'chokidar';
import path from 'node:path';
import fs from 'node:fs';
import { promisify } from 'node:util';
import { pathToFileURL } from 'url';
import chalk from 'chalk';
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

const Scandir = async (dir) => {
  let subdirs = await readdir(path.resolve(dir));
  let files = await Promise.all(
    subdirs.map(async (subdir) => {
      let res = path.resolve(path.resolve(dir), subdir);
      return (await stat(res)).isDirectory() ? Scandir(res) : res;
    }),
  );
  return files.reduce((a, f) => a.concat(f), []);
};
class Scrape {
  #src;
  constructor(dir) {
    this.dir = dir;
    this.#src = {};
  }
  load = async () => {
    let data = await Scandir("./scrape/src");
    for (let i of data) {
      let name = i.split("/").pop().replace(".js", "");
      try {
        if (!i.endsWith(".js")) return;
        this.#src[name] = import(i);
      } catch (e) {
        console.log(chalk.red.bold("- Gagal memuat Scraper :" + e));
        delete this.#src[name];
      }
    }
    return this.#src;
  };watch = async () => {
  const watcher = chokidar.watch(path.resolve(this.dir), {
    persistent: true,
    ignoreInitial: true,
  });

  watcher.on("add", async (filename) => {
    if (!filename.endsWith(".js")) return;
    const name = path.basename(filename, ".js");
    const fileUrl = pathToFileURL(filename).href + `?update=${Date.now()}`;
    const module = await import(fileUrl);

    this.#src[name] = module.default || module;
    console.log(chalk.cyan.bold(`- Scraper baru telah ditambahkan: ${name}`));
    return this.load();
  });

  watcher.on("change", async (filename) => {
    if (!filename.endsWith(".js")) return;
    const name = path.basename(filename, ".js");
    const fileUrl = pathToFileURL(filename).href + `?update=${Date.now()}`;
    const module = await import(fileUrl);

    this.#src[name] = module.default || module;
    console.log(chalk.cyan.bold(`- Scraper telah diubah: ${name}`));
    return this.load();
  });

  watcher.on("unlink", (filename) => {
    if (!filename.endsWith(".js")) return;
    const name = path.basename(filename, ".js");
    delete this.#src[name];
    console.log(chalk.cyan.bold(`- Scraper telah dihapus: ${name}`));
    return this.load();
  });
};
  list = () => this.#src;
}

export default Scrape;
