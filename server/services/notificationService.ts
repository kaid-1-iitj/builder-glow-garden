import { ITransaction } from "../models/Transaction";
import { IUser } from "../models/User";

export interface NotificationData {
  to: string;
  subject: string;
  body: string;
  type: "transaction_update" | "user_creation" | "society_creation";
}

export class NotificationService {
  private static instance: NotificationService;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Send email notification for transaction status updates
   */
  public async sendTransactionUpdateNotification(
    transaction: Partial<ITransaction>,
    updatedBy: Partial<IUser>,
    newStatus: string,
    remark?: string,
  ): Promise<void> {
    try {
      const statusMessages = {
        pending_on_society: "is now pending on society for action",
        pending_on_agent: "has been assigned to an agent for review",
        pending_for_clarification: "requires clarification from the society",
        completed: "has been completed successfully",
      };

      const notification: NotificationData = {
        to: transaction.createdBy as string, // In real app, this would be the email
        subject: `Transaction Update: ${transaction.vendorName}`,
        body: `
          Dear User,
          
          Your transaction with vendor "${transaction.vendorName}" ${statusMessages[newStatus as keyof typeof statusMessages]}.
          
          Transaction Details:
          - Vendor: ${transaction.vendorName}
          - Nature: ${transaction.nature}
          - Status: ${newStatus.replace(/_/g, " ").toUpperCase()}
          ${transaction.amount ? `- Amount: ₹${transaction.amount}` : ""}
          
          ${remark ? `Remark from ${updatedBy.name}: ${remark}` : ""}
          
          You can view the full details by logging into your SocietyHub account.
          
          Best regards,
          SocietyHub Team
        `,
        type: "transaction_update",
      };

      await this.sendEmail(notification);
      console.log(
        `Notification sent for transaction ${transaction._id} status update`,
      );
    } catch (error) {
      console.error("Failed to send transaction update notification:", error);
    }
  }

  /**
   * Send email notification for new user creation
   */
  public async sendUserCreationNotification(
    user: Partial<IUser>,
    temporaryPassword: string,
    societyName: string,
  ): Promise<void> {
    try {
      const notification: NotificationData = {
        to: user.email as string,
        subject: "Welcome to SocietyHub - Account Created",
        body: `
          Dear ${user.name},
          
          Your account has been created for SocietyHub management platform.
          
          Login Details:
          - Email: ${user.email}
          - Temporary Password: ${temporaryPassword}
          - Society: ${societyName}
          - Role: ${user.role === "society_user" ? "Society User" : "Processing Agent"}
          
          Please log in to your account and change your password immediately.
          
          Login URL: [Your SocietyHub URL]
          
          For security reasons, please do not share these credentials with anyone.
          
          Best regards,
          SocietyHub Team
        `,
        type: "user_creation",
      };

      await this.sendEmail(notification);
      console.log(`User creation notification sent to ${user.email}`);
    } catch (error) {
      console.error("Failed to send user creation notification:", error);
    }
  }

  /**
   * Send email notification for new society creation
   */
  public async sendSocietyCreationNotification(
    societyName: string,
    adminEmail: string,
  ): Promise<void> {
    try {
      const notification: NotificationData = {
        to: adminEmail,
        subject: "New Society Created - SocietyHub",
        body: `
          Dear Administrator,
          
          A new society "${societyName}" has been successfully created in SocietyHub.
          
          You can now:
          - Add users (managers, treasurers, agents) to this society
          - Configure society-specific settings
          - Monitor transactions and activities
          
          Next steps:
          1. Create initial users for the society
          2. Assign appropriate roles and permissions
          3. Guide society users through the onboarding process
          
          Best regards,
          SocietyHub Team
        `,
        type: "society_creation",
      };

      await this.sendEmail(notification);
      console.log(`Society creation notification sent for ${societyName}`);
    } catch (error) {
      console.error("Failed to send society creation notification:", error);
    }
  }

  /**
   * Mock email sending function
   * In production, this would integrate with actual email service (SendGrid, AWS SES, etc.)
   */
  private async sendEmail(notification: NotificationData): Promise<void> {
    // Mock implementation - in production, replace with actual email service
    console.log("📧 EMAIL NOTIFICATION:");
    console.log(`To: ${notification.to}`);
    console.log(`Subject: ${notification.subject}`);
    console.log(`Type: ${notification.type}`);
    console.log("---");
    console.log(notification.body);
    console.log("---\n");

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // In production, you would do something like:
    /*
    const emailClient = new EmailClient(process.env.EMAIL_API_KEY);
    await emailClient.send({
      to: notification.to,
      subject: notification.subject,
      html: this.formatEmailHTML(notification.body),
      text: notification.body
    });
    */
  }

  /**
   * Format email body as HTML (optional enhancement)
   */
  private formatEmailHTML(textBody: string): string {
    return textBody
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br>")
      .replace(/^/, "<p>")
      .replace(/$/, "</p>");
  }

  /**
   * Send bulk notifications (for future enhancement)
   */
  public async sendBulkNotifications(
    notifications: NotificationData[],
  ): Promise<void> {
    const promises = notifications.map((notification) =>
      this.sendEmail(notification),
    );
    await Promise.allSettled(promises);
  }

  /**
   * Get notification preferences (for future enhancement)
   */
  public async getNotificationPreferences(userId: string): Promise<any> {
    // Mock implementation - in production, fetch from database
    return {
      email: true,
      sms: false,
      push: true,
      transactionUpdates: true,
      systemAlerts: true,
    };
  }
}

export default NotificationService;
