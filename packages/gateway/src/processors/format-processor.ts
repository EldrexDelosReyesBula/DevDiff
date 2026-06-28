import { PipelineStep, ProcessorContext } from "./pipeline";
import { formatMarkdown, formatJSON, formatHTML } from "@eldrex/core";

export class FormatProcessor implements PipelineStep {
  name = "format_processor";

  async run(context: ProcessorContext, config: any): Promise<void> {
    const formats = config.formats || context.formats || ["markdown"];
    const data = context.aiFormattedResponse || context.aiRawResponse;

    if (!data) {
      throw new Error("No AI response data to format.");
    }

    if (!context.outputs) {
      context.outputs = {};
    }

    for (const format of formats) {
      switch (format.toLowerCase()) {
        case "markdown":
          context.outputs["markdown"] = formatMarkdown(data);
          break;
        case "json":
          context.outputs["json"] = formatJSON(data);
          break;
        case "html":
          context.outputs["html"] = formatHTML(data);
          break;
        default:
          // Just fall back to JSON or raw format if unsupported
          context.outputs[format] = JSON.stringify(data, null, 2);
          break;
      }
    }
  }
}
