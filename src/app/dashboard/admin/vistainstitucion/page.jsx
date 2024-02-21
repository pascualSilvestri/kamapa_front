'use client';
import { useSession, signOut } from 'next-auth/react';

import { useState, useEffect } from 'react';
import { Button, Table, Image } from 'react-bootstrap';
import { BsEye, BsPencil, BsTrash } from 'react-icons/bs';
import Link from 'next/link';
import Modal2 from '../../../components/Modal';
import { ModalType } from '../../../../utils/const';
import ModalViewInstitucion from '../../../components/ModalViewInstitucion';
import ModalUpdateInstitucion from '../../../components/ModalUpdateInstitucion';

const VistaInstitucionPage = () => {
	const [instituciones, setInstituciones] = useState([]);
	const [institucion, setInstitucion] = useState({});
	const [activo, setActivo] = useState(false);
	const [confirmar, setConfirmar] = useState(false);
	const [id, setId] = useState();
	const [type, setType] = useState('');
	const [showModal, setShowModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);

	useEffect(() => {
		fetchData();
	}, [institucion, id]);

	
	const fetchData = async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/institucion`,
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

	//Esto hermano te vas a tener que fijar, el confirmar y el eliminar, porque no anda cono corresponde
	useEffect(() => {
		if (confirmar) {
			const response = fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/institucion/${id}`,
				{
					method: 'DELETE',
				},
			);
			setConfirmar(false);
			setActivo(false);
			fetchData();
		}
	}, [confirmar, id]);


	const handleEliminar = async (id) => {
		try {
			// Envía la solicitud al backend para eliminar el elemento con el ID especificado
			const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/institucion/${id}`, {
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
				setId(id);
				setActivo(true);
				setType(ModalType.Delete);
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
		<div className='p-3'>
            <div className='mb-3 d-flex justify-content-center'>
                <div className='me-1'>
                    <Link href={`/dashboard/${session.user.rol.name}`}>
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
                    <Link href={`/dashboard/${session.user.rol.name}/reginstitucion`}>
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
                                        quality={100}
                                        priority={true}
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
                            <td colSpan='4'>No hay instituciones disponibles</td>
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
				setInstitucion={setInstitucion}
			/>
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
