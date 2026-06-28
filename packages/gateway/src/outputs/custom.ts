export interface CustomOutputPlugin {
  name: string;
  handler(content: string, config: any): Promise<boolean>;
}

export class CustomOutputter {
  private static plugins: Map<string, CustomOutputPlugin> = new Map();

  static register(plugin: CustomOutputPlugin) {
    this.plugins.set(plugin.name, plugin);
  }

  static async send(
    pluginName: string,
    content: string,
    config: any,
  ): Promise<boolean> {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`Output plugin not found: ${pluginName}`);
    }
    return plugin.handler(content, config);
  }
}
