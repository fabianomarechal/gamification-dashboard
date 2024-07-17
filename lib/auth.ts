import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [GitHub, GoogleProvider({
    clientId: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    authorization: {
      params: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code",
        scope: "openid email profile https://www.googleapis.com/auth/drive",
      }
    },
  })],
  callbacks: {
    jwt: ({token, account })=> {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    session: ({session, token}) => {
      session.accessToken = token.accessToken as string;
      return session;
    }
  },

});
