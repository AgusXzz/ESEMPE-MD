/**
 * Copyright (c) 2025 PurrBits
 *
 * This script is released under the ISC License.
 * See https://opensource.org/licenses/ISC for details.
 */

import { readdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import chokidar from 'chokidar'

import log from '#lib/logger.js'

async function importModule(modulePath) {
    const moduleURL = pathToFileURL(modulePath).href + `?id=${Date.now()}`;
    try {
        const esm = await import(moduleURL);
        let plugins = esm?.default ?? esm;
        // Deteksi kalau plugin adalah class (punya prototype.run)
        if (typeof plugin === "function" && plugin.prototype?.run) {
            plugin = new plugin();
        }
        return plugins;
    } catch (error) {
        log.error(`Error importing module ${modulePath}: ${error.message}`);
        throw error;
    }
}

export default class PluginsLoad {
  constructor(directory, { debug = false } = {}) {
    if (!directory) {
      throw new Error('You must add plugins path before using this code!')
    }
    this.directory = resolve(directory)
    this.plugins = {}
    this.watcher = null
    this.debug = debug
  }

  async add(p, { silent = false } = {}) {
    try {
      if (p in this.plugins) delete this.plugins[p]
      const data = await importModule(p)
      this.plugins[p] = data

      if (this.debug && !silent) {
        log.success(`Loaded plugin: ${p}`)
      }

      return data
    } catch (error) {
      delete this.plugins[p]
      if (!silent) {
        log.error(`Failed to load plugin ${p}: ${error.message}`)
      }
      return null
    }
  }

  async scan(dir = this.directory) {
    try {
      const items = readdirSync(dir, { withFileTypes: true })
      const sortedItems = items.sort((a, b) => (a.name > b.name ? 1 : -1))

      for (const item of sortedItems) {
        const p = join(dir, item.name)
        if (item.isDirectory()) {
          await this.scan(p)
        } else if (item.isFile() && p.endsWith('.js')) {
          await this.add(p, { silent: true }) // tidak spam log
        }
      }
    } catch (error) {
      log.error(`Error scanning directory ${dir}: ${error.message}`)
    }
  }

  async load() {
    await this.scan()
    log.info(`Successfully loaded ${Object.keys(this.plugins).length} plugins`)

    if (this.watcher) await this.watcher.close()

    this.watcher = chokidar.watch(this.directory, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100
      }
    })

    this.watcher.on('add', async (path) => {
      if (path.endsWith('.js')) {
        await this.add(path)
        log.info(`Detected new plugin: ${path}`)
      }
    })

    this.watcher.on('change', async (path) => {
      if (path.endsWith('.js')) {
        await this.add(path)
        log.info(`Updated plugin: ${path}`)
      }
    })

    this.watcher.on('unlink', (path) => {
      if (path in this.plugins) {
        delete this.plugins[path]
        log.warn(`Removed plugin: ${path}`)
      }
    })

    this.watcher.on('error', (error) => {
      log.error(`Watcher error: ${error}`)
    })
  }
}
