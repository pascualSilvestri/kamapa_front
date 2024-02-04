'use client';
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

	return (
		<div className='p-3'>
			<Link href='/dashboard/admin/vistainstitucion/reginstitucion'>
				<Button
					variant='flat'
					style={{
						backgroundColor: 'purple',
						color: 'white',
						padding: '0.4rem 1rem',
						fontSize: '1rem',
						marginBottom: '1rem',
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
					Registrar Institucion
				</Button>
			</Link>

			<Table
				striped
				bordered
				hover>
				<thead>
					<tr>
						<th>Logo</th>
						<th>CUE</th>
						<th>Nombre</th>
					</tr>
				</thead>
				<tbody>
					{Array.isArray(instituciones) && instituciones.length > 0 ? (
						instituciones.map((institucion) => (
							<tr key={institucion.id}>
								{/* Accede a las propiedades del objeto institucion de acuerdo a la estructura */}
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
									<Button
										variant='link'
										onClick={() => handleConsultar(institucion.id)}
										title='Consultar Institucion'>
										<BsEye />
									</Button>
									<Button
										variant='link'
										onClick={() => handleModificar(institucion.id)}
										title='Modificar Institucion'>
										<BsPencil />
									</Button>
									<Button
										variant='link'
										onClick={() => handleEliminar(institucion.id)}
										title='Eliminar Institucion'>
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
