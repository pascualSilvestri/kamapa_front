'use client';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect, use } from 'react';
import { Button, Table, Image } from 'react-bootstrap';
import { BsEye, BsPencil, BsTrash } from 'react-icons/bs';
import Link from 'next/link';
import Modal2 from 'app/components/Modal'
import { useRouter } from 'next/navigation';
import { Institucion, Roles, User } from 'model/types';
import { ModalType } from 'utils/const';
import { autorizeNivel, autorizeRol } from 'utils/autorizacionPorRoles';
import ModalViewInstitucion from 'app/components/ModalViewInstitucion';
import ModalUpdateInstitucion from 'app/components/ModalUpdateInstitucion';
import { Environment } from 'utils/apiHelpers';




const VistaInstitucionPage = () => {
	const [instituciones, setInstituciones] = useState([]);
	const [institucion, setInstitucion] = useState<Institucion>({
		id: 0,
		cue: '',
		nombre: '',
		logo: '',
	});
	const [activo, setActivo] = useState(false);
	const [confirmar, setConfirmar] = useState(false);
	const [id, setId] = useState();
	const [type, setType] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const { data: session, status } = useSession();
	const [rol, setRol] = useState<Roles[]>([]);
	const [user, setUser] = useState<User>({
		nombre: '',
		apellido: '',
		legajo: '',
		telefono: '',
		Roles: rol
	});
	const router = useRouter();


	useEffect(() => {

		if (session) {
			setUser({
				nombre: session.user.nombre,
				apellido: session.user.apellido,
				legajo: session.user.legajo,
				telefono: session.user.telefono,
				Roles:session.user.Roles
			});
			setRol(session.user.Roles);
			
		}
		if (!session) {
			router.push('/login');
		}
	}
	, [session]);



	useEffect(() => {
		fetchData();
	}, [institucion, id]);

	//Esto hermano te vas a tener que fijar, el confirmar y el eliminar, porque no anda cono corresponde y no me sale
	useEffect(() => {
		if (confirmar) {
			const response = fetch(
				`${Environment.getEndPoint(Environment.endPoint.institucion)}${id}`,
				{
					method: 'DELETE',
				},
			);
			setConfirmar(false);
			setActivo(false);
			fetchData();
		}
	}, [confirmar, id]);


	const fetchData = async () => {
		try {
			const response = await fetch(
				`${Environment.getEndPoint(Environment.endPoint.institucion)}`,
			);

			if (!response.ok) {
				throw new Error(`Error ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			setInstituciones(data);
		} catch (error) {
			console.error('Error al obtener institucion:', error.message);
		}
	};

	const handleConsultar = (id) => {
		setShowModal(true);
		const instituto = instituciones.find(
			(institucion) => institucion.id === id,
		);
		setInstitucion(instituto);
		console.log(institucion);
	};

	const handleModificar = (id) => {
		const instituto = instituciones.find(
			(institucion) => institucion.id === id,
		);
		setInstitucion(instituto);
		setShowEditModal(true);
		setType(ModalType.Edit);
	};


	const handleEliminar = async (id) => {
		try {
			// Envía la solicitud al backend para eliminar el elemento con el ID especificado
			const response = await fetch(
				`${Environment.getEndPoint(Environment.endPoint.institucion)}${id}`,
				{
					method: 'DELETE', // Utiliza el método DELETE para la eliminación
					headers: {
						'Content-Type': 'application/json', // Especifica el tipo de contenido
						// Otras cabeceras si es necesario
					},
					// Otros parámetros de configuración de la solicitud si es necesario
				});

			// Verifica si la solicitud fue exitosa
			if (response.ok) {
				// Actualiza el estado local o realiza otras acciones si es necesario
				setType(ModalType.Delete);
				setId(id);
				setActivo(true);
				// Puedes realizar otras acciones después de la eliminación si es necesario
			} else {
				// Maneja errores si la solicitud no fue exitosa
				console.error('Error al eliminar el elemento');
				// Puedes mostrar mensajes de error o realizar otras acciones si es necesario
			}
		} catch (error) {
			// Maneja errores si ocurren durante la solicitud
			console.error('Error al realizar la solicitud de eliminación:', error);
			// Puedes mostrar mensajes de error o realizar otras acciones si es necesario
		}
	};


	return (
		<div className='p-3'>
			<div className='mb-3 d-flex justify-content-center'>
				<div className='me-1'>
					<Link href={`/dashboard/${autorizeRol(autorizeNivel(rol))}`}>
						<Button variant='secondary' style={{
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
							}}>Volver</Button>
					</Link>
				</div>

				<div>
					<Link href={`/dashboard/${autorizeRol(autorizeNivel(rol))}/reginstitucion`}>
						<Button variant='flat' style={{
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
							Registrar Institución
						</Button>
					</Link>
				</div>
			</div>

			<Table striped bordered hover responsive>
				<thead>
					<tr>
						<th>Logo</th>
						<th>CUE</th>
						<th>Nombre</th>
						<th>Acciones</th>
					</tr>
				</thead>
				<tbody>
					{Array.isArray(instituciones) && instituciones.length > 0 ? (
						instituciones.map((institucion) => (
							<tr key={institucion.id}>
								<td>
									<Image
										src={institucion.logo}
										alt=''
										width={50}
										height={50}
									/>
								</td>
								<td>{institucion && `${institucion.cue}`}</td>
								<td>{institucion && institucion.nombre}</td>
								<td>
									<Button variant='link' onClick={() => handleConsultar(institucion.id)} title='Consultar Institucion'>
										<BsEye />
									</Button>
									<Button variant='link' onClick={() => handleModificar(institucion.id)} title='Modificar Institucion'>
										<BsPencil />
									</Button>
									<Button variant='link' onClick={() => handleEliminar(institucion.id)} title='Eliminar Institucion'>
										<BsTrash />
									</Button>
								</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan={4}>No hay instituciones disponibles</td>
						</tr>
					)}
				</tbody>
			</Table>

			<ModalViewInstitucion
				showModal={showModal}
				institucion={institucion}
				setShowModal={setShowModal}
			/>
			<ModalUpdateInstitucion
				showEditModal={showEditModal}
				setShowEditModal={setShowEditModal}
				institucion={institucion}
				id={institucion?.id}
				setInstitucion={setInstitucion} handleSave={undefined}			/>
			{type && (
				<Modal2
					type={type}
					isActive={activo}
					setActivo={setActivo}
					setConfirmar={setConfirmar}
				/>
			)}
		</div>

	);
};

export default VistaInstitucionPage;
