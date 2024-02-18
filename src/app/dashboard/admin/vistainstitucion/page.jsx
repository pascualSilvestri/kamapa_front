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

	const handleEliminar = async (id) => {
		// Lógica para manejar la acción de eliminar
		setId(id);
		setActivo(true);
		setType(ModalType.Delete);
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
                        <Button variant='secondary'>Volver</Button>
                    </Link>
                </div>
                <div>
                    <Link href='/dashboard/admin/vistainstitucion/reginstitucion'>
                        <Button variant='flat' style={{ backgroundColor: 'purple', color: 'white' }}>
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

            {/* Tus modales aquí */}
        </div>
    );
};

export default VistaInstitucionPage;
