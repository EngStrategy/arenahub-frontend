import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

type StatusAssinatura = 'ATIVA' | 'INATIVA' | 'CANCELADA' | 'ATRASADA';

declare module "next-auth" {
  interface User {
    accessToken: string;
    userId: string;
    name: string;
    role: string;
    expiresIn: number;
    imageUrl: string;
    statusAssinatura?: StatusAssinatura;
    cpfCnpj?: string;
  }
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/usuarios/auth`;

        try {
          const res = await axios.post(apiUrl, {
            email: credentials?.email,
            password: credentials?.password,
          });

          const user = res.data;

          if (user) {
            return user;
          } else {
            return null;
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message ?? error.message ?? "An unexpected error occurred.";
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.userId = user.userId;
        token.name = user.name;
        token.role = user.role;
        token.picture = user.imageUrl;
        token.statusAssinatura = user.statusAssinatura;
        token.cpfCnpj = user.cpfCnpj;

        const nowInSeconds = Math.floor(Date.now() / 1000);
        token.exp = nowInSeconds + user.expiresIn;

        return token;
      }

      // Token expirado, limpando sessão.
      if (Date.now() / 1000 > (token.exp as number)) {
        return {};
      }

      // Atualiza o token com os dados mais recentes da sessão
      if (trigger === "update" && session) {
        const updatePayload = session;

        token.name = updatePayload.name as string;
        token.picture = updatePayload.picture as string;
        token.statusAssinatura = updatePayload.statusAssinatura as StatusAssinatura;
        token.cpfCnpj = updatePayload.cpfCnpj as string | undefined;

        return token;
      }


      return token;
    },
    async session({ session, token }) {
      if (token?.userId) {
        session.user.accessToken = token.accessToken as string;
        session.user.userId = token.userId as string;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.expiresIn = token.exp as number;
        session.user.imageUrl = token.picture as string;
        session.user.statusAssinatura = token.statusAssinatura as StatusAssinatura;
        session.user.cpfCnpj = token.cpfCnpj as string | undefined;
      }

      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
});

export { handler as GET, handler as POST };