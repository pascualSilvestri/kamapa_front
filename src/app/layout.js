'use client';
import React, { Suspense } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Loading from './components/Loading'; // Importa el componente de carga
import SessionAuthProvider from '../../contexts/SessionAuthProvider';

export default function RootLayout({ children }) {
	return (
		<html lang='es'>
			<head>
				<title>KAMAPA</title>
				{/* Enlace a Bootstrap */}
				<meta charSet='UTF-8' />
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1.0'
				/>
				<meta
					httpEquiv='X-UA-Compatible'
					content='ie=edge'
				/>
				<meta
					name='description'
					content='Sistemas de gestión de escuelas'
				/>
				<meta
					name='keywords'
					content='KAMAPA, educación, gestor de Escuelas'
				/>
				<meta
					name='author'
					content='KAMAPA'
				/>
				{/* Asegúrate de tener una imagen cuadrada de alta resolución para compartir en redes sociales */}
				<meta
					property='og:title'
					content='KAMAPA'
				/>
				<meta
					property='og:description'
					content='Sistema de Gestión de escuelas'
				/>
				<meta
					property='og:url'
					content='KAMAPA'
				/>
				<meta
					property='og:type'
					content='webapp'
				/>
				<link
					href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css'
					rel='stylesheet'
					integrity='sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN'
					crossOrigin='anonymous'
				/>
			</head>
			<body>
				<main className='container-fluid p-0'>
					<SessionAuthProvider>
						<Suspense fallback={<Loading />} />
						{children}
					</SessionAuthProvider>
				</main>
			</body>
		</html>
	);
}
