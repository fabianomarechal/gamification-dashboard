import { auth } from '@/lib/auth';
import { Session, User } from "next-auth";
import { NextRequest } from 'next/server';


export default auth((req: NextRequest & { auth: Session | null }): Response | void => {
  try {
    const user = req.auth?.user as User;

    if (!user?.email) {
      const url = new URL("/", req.url);
      if (url.pathname !== req.nextUrl.pathname) return Response.redirect(url);
    }
  } catch (error) {
    console.error("new error: ", error);
  }
})

// Don't invoke Middleware on some paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.*\\.(?:png|jpg|svg)$).*)']
};

//['/((?!api|_next/static|_next/image|favicon.ico).*\\.(?:png|jpg|svg)$)']