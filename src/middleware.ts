import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Se não houver token, o acesso é negado
        if (!token) return false;

        const { pathname } = req.nextUrl;

        if (pathname.startsWith("/admin")) {
          return token.role === "ADMIN";
        }

        if (pathname.startsWith("/dashboard") || pathname.startsWith("/perfil/arena")) {
          return token.role === "ARENA";
        }

        if (pathname.startsWith("/perfil/atleta")) {
          return token.role === "ATLETA";
        }

        // Se nenhuma das rotas protegidas acima corresponder, permite o acesso
        return true;
      },
    },
    pages: {
      signIn: "/login",
      error: "/acesso-negado",
    },
  }
);

export const config = {
  matcher: ["/perfil/:path*", "/admin/:path*", "/dashboard"],
};