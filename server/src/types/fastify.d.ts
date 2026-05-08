import { UserRole } from './index.js';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: {
      id: number;
      email: string;
      role: UserRole;
      firstName: string;
      lastName: string;
    };
    user: {
      id: number;
      email: string;
      role: UserRole;
      firstName: string;
      lastName: string;
    };
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: number;
      email: string;
      role: UserRole;
      firstName: string;
      lastName: string;
    };
  }

  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}
