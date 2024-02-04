import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { getSession } from 'next-auth/react';
import { JWT } from 'next-auth/jwt';


interface Session {
	user: User;
	expires: string;
	id: number;
	password: string;
	rol: Rol;
	nombre: string;
	apellido: string;
	dni: string;
	telefono: string;
	legajo: string;
}

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
			async authorize(credentials) {
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`,
					{
						method: 'POST',
						body: JSON.stringify({
							dni: credentials?.dni,
							password: credentials?.password,
						}),
						headers: { 'Content-Type': 'application/json' },
					},
				);
				const session = await res.json();

				if (session.error) {
					throw new Error(session.error);
				}

				return session;
			},
		}),
	],
	callbacks: {
		async session({ session, token }) {
			// Asigna directamente el objeto de usuario desde el token al objeto de sesión
			if (token.user) {
			  session.user = token.user as User; // Asigna todo el objeto de usuario a la sesión
			}
			
			return session; // Devuelve el objeto de sesión actualizado
		  },
		async jwt(params: { token: JWT; user: User | any } & JWT['jwt']) {
			const { token, user } = params;
			if (user) {
				token.user = user;
			}

			return token;
		},
	},
	pages: {
		signIn: '/login',
	},
});

export { handler as GET, handler as POST };
