'use client';
import { signIn, signOut, useSession } from 'next-auth/react';
import Loading from './Loading';

export default function ButtonAuth() {
	const { data: session, status } = useSession();

	if (status === 'loading') {
		return <Loading />;
	}
	if (session) {
		return (
			<>
				<p>Inicio Seccion con {session.user?.rol?.name}</p>
				<button
					onClick={() => signOut()}
					className='btn btn-danger'>
					Cerrar Seccion
				</button>
			</>
		);
	}

	return (
		<>
			<p>No registrado</p>
			<button onClick={() => signIn()}>Ingresar</button>
		</>
	);
}
