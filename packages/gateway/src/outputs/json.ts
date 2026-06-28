import * as fs from "fs/promises";
import * as path from "path";

export class JSONOutputter {
  static async write(filePath: string, data: any): Promise<void> {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, content, "utf-8");
  }
}
