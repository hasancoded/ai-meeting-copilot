export type RequestUser = {
  id: number;
  email: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: RequestUser;
    }
  }
}

export type Meeting = {
  id: number;
  title: string;
  audioPath?: string;
  transcript?: string;
  summary?: string;
  actionItems?: any;
  decisions?: any;
  createdAt: Date;
  updatedAt: Date;
  ownerId: number;
};
