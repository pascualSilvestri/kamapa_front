'use client';
import React, { Suspense, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../components/Navigation';
import 'bootstrap/dist/css/bootstrap.min.css';
import Loading from '../components/Loading';

export default function RootLayout({ children }) {
	const { data: session } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (session) {
			const allowedRoutes = {
				admin: [
					'/dashboard',
					'/dashboard/admin',
					'/dashboard/admin/vistainstitucion',
					'/dashboard/admin/vistainstitucion/reginstitucion',
					'/dashboard/admin/vistausuario',
					'/dashboard/admin/vistausuario/regempleado',
				],
				director: ['/dashboard', '/dashboard/director'],
				secretario: ['/dashboard', '/dashboard/secretario'],
				preceptor: ['/dashboard', '/dashboard/preceptor'],
				docente: ['/dashboard', '/dashboard/docente'],
				alumno: ['/dashboard', '/dashboard/alumno'],
				// Agrega todos los roles y sus rutas permitidas
			};

			const userRole = session.rol?.name;
			const currentPath = router.pathname;

			// Comprobaciones de existencia antes de acceder a las propiedades
			if (userRole && allowedRoutes[userRole] && currentPath) {
				if (!allowedRoutes[userRole].includes(currentPath)) {
					router.replace('/dashboard');
				}
			}
		}
	}, [session, router]);

	return (
		<>
			<Suspense fallback={<Loading />}>
				<Navigation />
				{children}
			</Suspense>
		</>
	);
}
