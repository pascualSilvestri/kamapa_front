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


const Dashboard = () => {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [rol, setRol] = useState<Roles[]>([]);
	const [user, setUser] = useState<User>({
		nombre: '',
		apellido: '',
		legajo: '',
		telefono: '',
		Roles: rol,
		Instituciones:[]
	});


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
		{user.Instituciones.map((institucion, index) => (
		  <Col key={index} xs={12} sm={6} md={4}>
			<Card className='text-center'>
			  <Card.Header>{' ' + institucion.nombre + ' '}</Card.Header>
			  <Image src={institucion.logo} alt={institucion.nombre} />
			  <Card.Body>
				{/* Enlace a la ruta específica según el rol */}
				<Link href={`/dashboard/${user.Instituciones[0].id}/newciclolectivo`}>
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
			  <Card.Footer className='text-muted'>
				{session ? 'Sesión activa' : 'No hay sesión activa'}
			  </Card.Footer>
			</Card>
		  </Col>
		))}
	  </Row>
	);
};

export default Dashboard;
