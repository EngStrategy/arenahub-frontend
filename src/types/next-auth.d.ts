import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      accessToken: string;
      userId: string;
      name: string;
      role: string;
      expiresIn: number;
      imageUrl: string;
      statusAssinatura?: 'ATIVA' | 'INATIVA' | 'CANCELADA' | 'ATRASADA';
    };
  }
}