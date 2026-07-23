import { Request, Response } from 'express';
interface RegisterRequest {
    name: string;
    email: string;
    password: string;
}
interface LoginRequest {
    email: string;
    password: string;
}
export declare const register: (req: Request<{}, {}, RegisterRequest>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const login: (req: Request<{}, {}, LoginRequest>, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUser: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const completeProfile: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const forgotPassword: (req: Request<{}, {}, {
    email: string;
}>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const verifyOtp: (req: Request<{}, {}, {
    email: string;
    otp: string;
}>, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const resetPassword: (req: Request<{}, {}, {
    email: string;
    otp: string;
    password: string;
}>, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=authController.d.ts.map