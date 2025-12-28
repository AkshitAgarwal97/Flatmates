interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
declare class EmailService {
    private transporter;
    private escapeHtml;
    constructor();
    sendEmail(options: EmailOptions): Promise<boolean>;
    sendNewMessageNotification(recipientEmail: string, senderName: string, propertyTitle: string): Promise<boolean>;
    sendPropertyViewNotification(ownerEmail: string, propertyTitle: string, viewerName?: string): Promise<boolean>;
    sendPropertySavedNotification(ownerEmail: string, propertyTitle: string, savedByName: string): Promise<boolean>;
    sendWelcomeEmail(userEmail: string, userName: string): Promise<boolean>;
    sendPasswordResetEmail(userEmail: string, resetToken: string): Promise<boolean>;
}
declare const _default: EmailService;
export default _default;
//# sourceMappingURL=emailService.d.ts.map