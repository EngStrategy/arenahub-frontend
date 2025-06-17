import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      const { pathname } = req.nextUrl;

      if (!token) return false;

      if (pathname.startsWith("/admin")) {
        return token.role === "ADMIN";
      }

      if (pathname.startsWith("/dashboard") || pathname.startsWith("/perfil/arena")) {
        return token.role === "ARENA";
      }

      if (pathname.startsWith("/perfil/atleta")) {
        return token.role === "ATLETA";
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
    error: "/acesso-negado",
  },
});

export const config = {
  matcher: ["/perfil/:path*", "/admin/:path*", "/dashboard"],
};