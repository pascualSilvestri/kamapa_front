'use client';
import { useSession, signOut } from 'next-auth/react';
import { Card, Button } from 'react-bootstrap';
import Link from 'next/link';
import Loading from '../components/Loading';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Roles, User } from '../../model/types';


const Dashboard = () => {
	const { data: session, status } = useSession();
	const router = useRouter();
	const [rol, setRol] = useState<Roles[]>([]);
	const [user, setUser] = useState<User>({
		nombre: '',
		apellido: '',
		legajo: '',
		telefono: '',
		Roles: rol
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
			});
			setRol(session.user.Roles);
			console.log(rol)


		}
	}, [router, session]);

	// Si el estado de la página está cargando, muestra el componente Loading
	if (status === 'loading') {
		return <Loading />;
	}


	return (
		<div className='d-flex justify-content-center align-items-center mt-5'>
			<Card className='text-center'>
				<Card.Header>	Roles<br/>
					{
						rol.map(role => {
							return (
								<>
								 {' ' + role.name + ' '}	
								</>
							)
						})
					}
				</Card.Header>
				<Card.Header>Panel { }</Card.Header>
				<Card.Body>
					<Card.Title>
						Bienvenido, {user.nombre} {user.apellido}
					</Card.Title>
					<Card.Text>
						<strong>Legajo:</strong> {user.legajo} <br />
						<strong>Teléfono:</strong> {user.telefono}
					</Card.Text>

					{/* Enlace a la ruta específica según el rol */}
					{/* <Link href={`/dashboard/${user.Roles}`}>
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
					</Link> */}

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
