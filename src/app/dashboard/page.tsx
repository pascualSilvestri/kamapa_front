'use client';
import { useSession, signOut } from 'next-auth/react';
import { Card, Button } from 'react-bootstrap';
import Link from 'next/link';
import Loading from '../components/Loading';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Rol, User } from '../../model/types';
import { useUserContext } from "../../context/userContext";


const Dashboard = () => {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [rol, setRol] = useState<Rol>({name: '', id: 0});
	const { user, updateUser } = useUserContext();

	useEffect(() => {
		if (!session) {
			router.push('/login');
		} else {
			setRol(session.user.rol);
			updateUser(session.user);
		}
	}, [session]);

	console.log(user)
	console.log(rol)
	// Si el estado de la página está cargando, muestra el componente Loading
	if (status === 'loading') {
		return <Loading />;
	}


	return (
		<div className='d-flex justify-content-center align-items-center mt-5'>
			<Card className='text-center'>
				<Card.Header>Panel {rol.name}</Card.Header>
				<Card.Body>
					<Card.Title>
						Bienvenido, {user.user.nombre} {user.user.apellido}
					</Card.Title>
					<Card.Text>
						<strong>Legajo:</strong> {user.user.legajo} <br />
						<strong>Teléfono:</strong> {user.user.telefono}
					</Card.Text>

					{/* Enlace a la ruta específica según el rol */}
					<Link href={`/dashboard/${rol?.name}`}>
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
