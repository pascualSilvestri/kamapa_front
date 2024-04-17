'use client';
import { useSession, signOut } from 'next-auth/react';
import { Card, Button, Row, Col, Image } from 'react-bootstrap';
import Link from 'next/link';
import Loading from '../components/Loading';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Roles, User } from '../../model/types';
import { autorizeNivel , autorizeRol } from '../../utils/autorizacionPorRoles';
import path from 'path';
import { useInstitucionSelectedContext, useUserContext } from 'context/userContext';


const Dashboard = () => {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [rol, setRol] = useState<Roles[]>([]);
	const [user, setUser] = useUserContext();
	const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();


	useEffect(() => {

		if (!session) {
			router.push('/login');
		} else {
			
			setUser({
				nombre: session.user.nombre,
				apellido: session.user.apellido,
				legajo: session.user.legajo,
				telefono: session.user.telefono,
				Roles: session.user.Roles,
				Instituciones: session.user.Instituciones

			});
			setRol(session.user.Roles);
		

		}
	}, [router, session]);

	// Si el estado de la página está cargando, muestra el componente Loading
	if (status === 'loading') {
		return <Loading />;
	}

	const generateRoute = (roles) => {
		// Aquí debes implementar la lógica para determinar la ruta según los roles del usuario
		// Por ejemplo, podrías retornar una ruta basada en el primer rol del usuario
		// En esta implementación, supondremos que el primer rol es el más relevante
		const role = roles[0];
		switch (role) {
		  case 'Admin':
			return '/admin';
		  case 'Director':
			return '/director';
		  case 'Secretario':
			return '/secretario';
		  case 'Preceptor':
			return '/preceptor';
		  case 'Docente':
			return '/docente';
		  case 'Alumno':
			return '/alumno';
		  default:
			return '/login';
		}
	  };

	  console.log(user);
	  return (
			<Row className='justify-content-center mt-5'>
			{user.Instituciones && user.Instituciones.length > 0 && user.Instituciones.map((institucion, index) => (
				<Col key={index} xs={12} sm={6} md={4}>
				<Card className='text-center'>
					<Card.Header>{' ' + institucion.nombre + ' '}</Card.Header>
					<div className="d-flex justify-content-center align-items-center" style={{ height: '150px' }}>
					<Image src={institucion.logo} alt={institucion.nombre} />
					</div>
					<Card.Body>
					{/* Enlace a la ruta específica según el rol */}
					<Link href={`/dashboard/${user.Instituciones[0].id}/bienvenido`}>
						<Button
						variant='flat'
						type='submit'
						style={{
							backgroundColor: 'purple',
							color: 'white',
							padding: '0.4rem 1rem',
							fontSize: '1rem',
							transition: 'all 0.3s ease',
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = 'white';
							e.currentTarget.style.color = 'black';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = 'purple';
							e.currentTarget.style.color = 'white';
						}}
						onClick={(e) => {
							const institucionSelected = user.Instituciones.filter(
							(e) => e.id === institucion.id
							);
							setInstitucionSelected({
							id: institucionSelected[0].id,
							nombre: institucionSelected[0].nombre,
							logo: institucionSelected[0].logo,
							cue: institucionSelected[0].cue,
							email: institucionSelected[0].email,
							contacto: institucionSelected[0].contacto,
							});
						}}>
						Ingresar
						</Button>
					</Link>
					</Card.Body>
				</Card>
				</Col>
			))}
			{rol.find((e) => e.name === 'Admin') && (
				<Col xs={12} sm={6} md={4}>
				<Card className='text-center'>
					<Card.Header>{' Administrador '}</Card.Header>
					<div className="d-flex justify-content-center align-items-center" style={{ height: '150px' }}>
					<Image src='Logo.png' alt='Logo.png' style={{ width: '100px', height: '100px' }} />
					</div>
					<Card.Body>
					{/* Enlace a la ruta específica según el rol */}
					<Link href={`/dashboard/admin`}>
						<Button
						variant='flat'
						type='submit'
						style={{
							backgroundColor: 'purple',
							color: 'white',
							padding: '0.4rem 1rem',
							fontSize: '1rem',
							transition: 'all 0.3s ease',
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = 'white';
							e.currentTarget.style.color = 'black';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = 'purple';
							e.currentTarget.style.color = 'white';
						}}>
						Ingresar
						</Button>
					</Link>
					</Card.Body>
				</Card>
				</Col>
			)}
			</Row>
		);
	};  

export default Dashboard;
