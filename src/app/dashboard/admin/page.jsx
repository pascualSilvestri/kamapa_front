'use client';
import { useSession } from 'next-auth/react';

import React from 'react';
import {
	Container,
	Card,
	Button,
	CardBody,
	CardTitle,
	CardSubtitle,
	Row,
	Col,
} from 'react-bootstrap';
import Link from 'next/link';

export default function Page() {

	const { data: session, status } = useSession();

	// Si el estado de la página está cargando, muestra el componente Loading
	if (status === 'loading') {
		
	}

	// Si no hay sesión, redirige a la página de inicio de sesión
	if (!session) {
		window.location.replace('/login');
		return null;
	}

	console.log(session)

	
	return (
		<Container>
			<Row className='mb-3  justify-content-center'>
				<Col>
					{/* Botón para volver */}
					<Link href='/dashboard'>
						<Button
							variant='secondary'
							style={{
								marginRight: '10px',
								padding: '0.4rem 1rem',
								fontSize: '1rem',
								transition: 'all 0.3s ease',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = 'white';
								e.currentTarget.style.color = 'black';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = 'grey';
								e.currentTarget.style.color = 'white';
							}}>
							Volver
						</Button>
					</Link>
				</Col>
			</Row>

			<h1 style={{ margin: '2rem 0 1rem 0', textAlign: 'center' }}>
				Panel Admin
			</h1>

			<div className='row'>
				<div className='col-md-3'>
					<Card style={{ backgroundColor: '#b96a8c' }}>
						<CardBody>
							<CardTitle style={{ textAlign: 'center' }}>Usuarios</CardTitle>
							<CardSubtitle>
								Gestiona a los usuarios de tu aplicación
							</CardSubtitle>
							{/* Utiliza el componente Link para los enlaces */}
								<Link href={`/dashboard/${session.user.rol.name}/vistausuarios`}>
								<Button
									variant='primary'
									style={{ width: '100%' }}>
									Ir
								</Button>
							</Link>
						</CardBody>
					</Card>
				</div>
				<div className='col-md-3'>
					<Card style={{ backgroundColor: '#a99aff' }}>
						<CardBody>
							<CardTitle style={{ textAlign: 'center' }}>Institución</CardTitle>
							<CardSubtitle>
								Administra las Instituciones Registradas
							</CardSubtitle>
							{/* Utiliza el componente Link para los enlaces */}
							<Link href={`/dashboard/${session.user.rol.name}/vistainstitucion`}>
								<Button
									variant='primary'
									style={{ width: '100%' }}>
									Ir
								</Button>
							</Link>
						</CardBody>
					</Card>
				</div>
				<div className='col-md-3'>
					<Card style={{ backgroundColor: '#9f8cf6' }}>
						<CardBody>
							<CardTitle style={{ textAlign: 'center' }}>Roles</CardTitle>
							<CardSubtitle>Asignacion de vistas Segun el Rol</CardSubtitle>
							{/* Utiliza el componente Link para los enlaces */}
							<Link href={`/dashboard/${session.user.rol.name}`}>
								<Button
									variant='primary'
									style={{ width: '100%' }}>
									Ir
								</Button>
							</Link>
						</CardBody>
					</Card>
				</div>
				<div className='col-md-3'>
					<Card style={{ backgroundColor: '#8f7cf3' }}>
						<CardBody>
							<CardTitle style={{ textAlign: 'center' }}>Reportes</CardTitle>
							<CardSubtitle>
								Estadísticas de Usuarios & Instituciones Registrados
							</CardSubtitle>
							{/* Utiliza el componente Link para los enlaces */}
							<Link href={`/dashboard/${session.user.rol.name}`}>
								<Button
									variant='primary'
									style={{ width: '100%' }}>
									Ir
								</Button>
							</Link>
						</CardBody>
					</Card>
				</div>
			</div>
		</Container>
	);
}
