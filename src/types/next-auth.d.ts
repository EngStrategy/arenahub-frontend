import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      accessToken: string;
      userId: UUID;
      name: string;
      role: string;
      expiresIn: number;
      imageUrl: string;
    };
  }
}