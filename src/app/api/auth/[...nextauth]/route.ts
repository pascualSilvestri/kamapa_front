import NextAuth  from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { User,Roles, UserSession  } from '../../../../types/interfaces'; // Assuming User, Rol and Session are defined in your interfaces
import { JWT } from 'next-auth/jwt';



const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        dni: { label: 'dni', type: 'text', placeholder: 'Ingresa tu DNI' },
        password: {
          label: 'Password',
          type: 'password',
          autocomplete: 'current-password',
        },
      },
      async authorize(credentials, req) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          body: JSON.stringify({
            dni: credentials?.dni,
            password: credentials?.password,
          }),
          headers: { 'Content-Type': 'application/json' },
        })

        const session = await res.json();

        if (session.error) {
          console.log(session.error);
          throw new Error(session.error);
        }
        return session 
      },
    }),
  ],
  callbacks: {
    async jwt(params: { token: JWT; user: User | any } & JWT['jwt']) { // Removed unnecessary "any" from user and made rol optional
      const { token, user } = params;

      return { ...token, ...user }; // Only add rol if it exists
    },
    async session({ session, token  }) {
      // Asigna directamente el objeto de usuario desde el token al objeto de sesión
      if (session) {
        session.user = token.user as User;
        }
      return session; // Cast the session to the correct type
    },
  },
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };
