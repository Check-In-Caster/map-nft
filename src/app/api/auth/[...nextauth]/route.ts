import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { SiweMessage } from "siwe";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Ethereum",
      credentials: {
        message: {
          label: "Message",
          type: "text",
          placeholder: "0x0",
        },
        signature: {
          label: "Signature",
          type: "text",
          placeholder: "0x0",
        },
      },
      async authorize(credentials) {
        try {
          const siwe = new SiweMessage(
            JSON.parse(credentials?.message || "{}")
          );

          // const nextAuthUrl = new URL(process.env.NEXTAUTH_URL)
          // const result = await siwe.verify({
          //   signature: credentials?.signature || "",
          //   domain: nextAuthUrl.host,
          //   nonce: await getCsrfToken({ req }),
          // })

          const response = await siwe.validate(credentials?.signature ?? "");

          if (response) {
            return {
              id: siwe.address,
              name: siwe.address.toLocaleLowerCase(),
            };
          }
          return null;
        } catch (e) {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: any; token: any }) {
      session.address = token.sub;
      session.user = {
        name: token.sub,
      };

      return session;
    },
  },
});

export { handler as GET, handler as POST };
