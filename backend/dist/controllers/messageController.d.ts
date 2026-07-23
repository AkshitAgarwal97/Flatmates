import { Request, Response } from 'express';
interface CreateConversationRequest {
    recipient: string;
    property?: string;
    initialMessage?: string;
}
interface SendMessageRequest {
    content: string;
    attachments?: Array<{
        type: string;
        url: string;
        fileType?: string;
    }>;
}
export declare const getConversations: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createConversation: (req: Request<{}, {}, CreateConversationRequest>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getMessages: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const sendMessage: (req: Request<{
    id: string;
}, {}, SendMessageRequest>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const archiveConversation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const shareContact: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=messageController.d.ts.map