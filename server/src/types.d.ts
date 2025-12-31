declare namespace Express {
  export interface Request {
    auth?: {
      userId: string;
      roles: string[];
      email: string;
    };
  }
}
