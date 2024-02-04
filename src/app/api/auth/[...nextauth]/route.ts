import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

import { getSession } from 'next-auth/react';
import { JWT } from 'next-auth/jwt';

interface Rol {
	id: number;
	name: string;
	createdAt: string;
	updatedAt: string;
}

interface User {
	id: number;
	legajo: string;
	fecha_ingreso: string;
	fecha_egreso: string | null;
	nombre: string;
	apellido: string;
	dni: string;
	cuil: string;
	fechaNacimiento: string;
	telefono: string;
	is_active: boolean;
	create_for: string;
	update_for: string;
	password: string;
	createdAt: string;
	updatedAt: string;
	domicilioId: number;
	contactoId: number;
	rolId: number;
	rol: Rol;
}

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
			// Accede anidando a las propiedades de user
			session.user = (token.user as any)?.user;
			session.user.rol = (token.user as any)?.user.rol;
			console.log(session);
			console.log(session.user);
			return Promise.resolve(session);
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
