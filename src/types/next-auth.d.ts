import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      accessToken: string;
      userId: number;
      name: string;
      role: string;
      expiresIn: number;
      imageUrl: string;
    };
  }
}