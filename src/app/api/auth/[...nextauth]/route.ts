import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

declare module "next-auth" {
  interface User {
    token?: string;
    [key: string]: any; // Escolher um tipo melhor
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
          console.log("API Success Response:", user);

          if (user) {
            return user;
          } else {
            console.log("API returned success, but no user object.");
            return null;
          }
        } catch (error: any) { // Escolher um tipo melhor
          console.error("AXIOS ERROR:", error);

          if (error.response) {
            console.error("API Response Status:", error.response.status);
            console.error("API Response Data:", error.response.data);
          } else if (error.request) {
            console.error("No response received from API:", error.request);
          } else {
            console.error("Error setting up request:", error.message);
          }

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
        token.expiresIn = user.expiresIn;
        token.picture = user.imageUrl;
      }

      if (trigger === "update" && session) {
        console.log("Atualizando token com dados da sessão:", session);
        token.name = session.name;
        token.picture = session.picture;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.accessToken = token.accessToken as string;
        session.user.userId = token.userId as number;
        session.user.name = token.name as string;
        session.user.role = token.role as string;
        session.user.expiresIn = token.expiresIn as number;
        // Mapeamos token.picture para session.user.imageUrl
        session.user.imageUrl = token.picture as string;
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