import nodemailer from "nodemailer";

export interface EmailConfig {
  to: string;
  subject: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  from?: string;
  /** If true, sends plaintext body instead of HTML */
  plain?: boolean;
}

export class EmailOutputter {
  static async send(config: EmailConfig, content: string): Promise<boolean> {
    const host = config.smtpHost || process.env.SMTP_HOST || "smtp.gmail.com";
    const port = config.smtpPort || Number(process.env.SMTP_PORT) || 587;
    const user = config.smtpUser || process.env.SMTP_USER || "";
    const pass = config.smtpPass || process.env.SMTP_PASS || "";
    const from = config.from || user || "devdiff@localhost";

    // If no SMTP credentials, fall back to a preview log
    if (!user && !pass) {
      console.log(`[Email] No SMTP credentials found. Logging email preview:`);
      console.log(`[Email]   To:      ${config.to}`);
      console.log(`[Email]   Subject: ${config.subject}`);
      console.log(`[Email]   Body:    ${content.substring(0, 200)}...`);
      return true;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for 587/25
      auth: {
        user,
        pass,
      },
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from,
      to: config.to,
      subject: config.subject,
      ...(config.plain
        ? { text: content }
        : {
            html: `<pre style="font-family: monospace; white-space: pre-wrap;">${content}</pre>`,
            text: content,
          }),
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email] Sent to ${config.to} — Message ID: ${info.messageId}`);
      return true;
    } catch (err: any) {
      console.error(`[Email] Failed to send: ${err.message}`);
      return false;
    }
  }
}
