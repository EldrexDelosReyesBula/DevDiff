import { EventEmitter } from "events";
import chokidar from "chokidar";

export interface FsWatcherConfig {
  paths: string[];
  ignore?: string[];
}

export class FsWatcher extends EventEmitter {
  private watcher: chokidar.FSWatcher | null = null;
  private paths: string[];
  private ignore: string[];

  constructor(config: FsWatcherConfig) {
    super();
    this.paths = config.paths;
    this.ignore = config.ignore || ["node_modules", ".git", "dist"];
  }

  start() {
    this.watcher = chokidar.watch(this.paths, {
      ignored: this.ignore,
      persistent: true,
      ignoreInitial: true,
    });

    this.watcher
      .on("add", (path) => this.emit("change", { event: "add", path }))
      .on("change", (path) => this.emit("change", { event: "change", path }))
      .on("unlink", (path) => this.emit("change", { event: "unlink", path }));
  }

  stop() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}
