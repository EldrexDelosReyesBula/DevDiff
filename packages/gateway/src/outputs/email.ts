export interface EmailConfig {
  to: string;
  subject: string;
  smtpHost?: string;
  smtpPort?: number;
}

export class EmailOutputter {
  static async send(config: EmailConfig, content: string): Promise<boolean> {
    console.log(`[Email] Sending email to: ${config.to}`);
    console.log(`[Email] Subject: ${config.subject}`);
    console.log(`[Email] Content: ${content.substring(0, 100)}...`);

    // In a real application, we can use nodemailer or SendGrid.
    // For now we will mock a successful send.
    return true;
  }
}
