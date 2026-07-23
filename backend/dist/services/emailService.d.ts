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
    sendOTPEmail(email: string, otp: string): Promise<boolean>;
    /**
     * Generate a 6-digit OTP. Uses crypto for better randomness than Math.random.
     */
    generateOTP(): string;
}
declare const emailServiceInstance: EmailService;
export declare const sendOTPEmail: (email: string, otp: string) => Promise<boolean>;
export declare const generateOTP: () => string;
export default emailServiceInstance;
//# sourceMappingURL=emailService.d.ts.map