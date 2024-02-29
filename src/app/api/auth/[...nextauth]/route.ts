import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { User, Rol } from '../../../../types/interfaces';
import { getSession } from 'next-auth/react';
import { JWT } from 'next-auth/jwt';

// interface Session {
// 	user: User;
// 	expires: string;
// 	id: number;
// 	password: string;
// 	rol: Rol;
// 	nombre: string;
// 	apellido: string;
// 	dni: string;
// 	telefono: string;
// 	legajo: string;
// }

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
			if (session.user) {
				session.user = token.user as User; // Asigna todo el objeto de usuario a la sesión
			}
			console.log(session)
			// console.log(token.accessToken); // Imprime el token codificado
			return session; // Devuelve el objeto de sesión actualizado
		},
		async jwt(params: { token: JWT; user: User | any } & JWT['jwt']) {
			const { token, user } = params;
			if (user) {
			    token.user = user;
			}
			console.log(token)
			return token;
		},
		
	},
	pages: {
		signIn: '/login',
	},
});

export { handler as GET, handler as POST };
