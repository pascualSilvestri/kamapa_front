'use client';
import { useSession, signOut } from 'next-auth/react';
import { Card, Button } from 'react-bootstrap';
import Link from 'next/link';
import Loading from '../components/Loading';

const Dashboard = () => {
	const { data: session, status } = useSession();

	// Si el estado de la página está cargando, muestra el componente Loading
	if (status === 'loading') {
		return <Loading />;
	}

	// Si no hay sesión, redirige a la página de inicio de sesión
	if (!session) {
		window.location.replace('/login');
		return null;
	}
	console.log(session);

	// // Función para cerrar sesión
	// const handleLogout = async () => {
	//   await signOut(); // Utiliza signOut directamente desde next-auth/react
	//   window.location.replace('/login'); // Redirige a la página de inicio de sesión
	// };

	return (
		<div className='d-flex justify-content-center align-items-center mt-5'>
			<Card className='text-center'>
				<Card.Header>Panel {session.rol.name}</Card.Header>
				<Card.Body>
					<Card.Title>
						Bienvenido, {session.user.nombre} {session.user.apellido}
					</Card.Title>
					<Card.Text>
						<strong>Legajo:</strong> {session.user.legajo} <br />
						<strong>Teléfono:</strong> {session.user.telefono}
					</Card.Text>

					{/* Enlace a la ruta específica según el rol */}
					<Link href={`/dashboard/${session.rol.name}`}>
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
							Comencemos
						</Button>
					</Link>

					{/* Botón para cerrar sesión */}
					{/* <Button
            variant='danger'
            onClick={handleLogout}
            style={{
              marginTop: '1rem',
              padding: '0.4rem 1rem',
              fontSize: '1rem',
              transition: 'all 0.3s ease',
            }}>
            Cerrar sesión
          </Button> */}
				</Card.Body>
				<Card.Footer className='text-muted'>
					{session ? 'Sesión activa' : 'No hay sesión activa'}
				</Card.Footer>
			</Card>
		</div>
	);
};

export default Dashboard;
