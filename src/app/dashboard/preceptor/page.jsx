'use client';
import { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import { BsEye, BsPencil, BsTrash } from 'react-icons/bs';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const VistaAlumnosPage = () => {
	const [alumnos, setAlumnos] = useState([]);
	const [selectedAlumno, setSelectedAlumno] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);

	const { data: session } = useSession();

	

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alumno`,
				);

				if (!response.ok) {
					throw new Error(`Error ${response.status}: ${response.statusText}`);
				}

				const data = await response.json();
				setAlumnos(data.alumnos);
				console.log(data);
			} catch (error) {
				console.error('Error al obtener alumnos:', error.message);
			}
		};

		fetchData();
	}, []);

	const handleConsultar = (alumno) => {
		setSelectedAlumno(alumno);
		setShowModal(true);
	};

	const handleEliminar = (alumno) => {
		setSelectedAlumno(alumno);
		setShowConfirmModal(true);
	};

	const handleConfirmDelete = async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alumno/fisico/${selectedAlumno}`,
				{
					method: 'DELETE',
				},
			);
			console.log(selectedAlumno);

			if (!response.ok) {
				const errorData = await response.json();
				console.log('Error status:', response.status);
				console.log('Error data:', errorData);
				throw new Error('Error en la eliminación');
			}

			setAlumnos(alumnos.filter((emp) => emp.id !== selectedAlumno));
			setShowConfirmModal(false);
		} catch (error) {
			console.log(error);
		}
	};

	const handleModificar = (alumno) => {
		setSelectedAlumno(alumno);
		setShowEditModal(true);
	};

	const handleSave = () => {
		setShowSaveConfirmModal(true);
	};

	const handleConfirmSave = async () => {
		try {
			const legajo = document.getElementById('formLegajo')?.value;
			const nombre = document.getElementById('formNombre')?.value;
			const apellido = document.getElementById('formApellido')?.value;
			const dni = document.getElementById('formDNI')?.value;

			const updatedAlumno = {
				...selectedAlumno,
				usuario: {
					usuarioId: selectedAlumno.usuarioId,
					legajo: legajo,
					nombre: nombre,
					apellido: apellido,
					dni: dni,
				},
			};

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alumno/${selectedAlumno.id}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(updatedAlumno),
				},
			);

			if (!response.ok) {
				const errorData = await response.json();
				console.error('Error status:', response.status);
				console.error('Error data:', errorData);
				throw new Error(`Error en la modificación: ${errorData.message}`);
			}

			// Después de confirmar los cambios, realiza una nueva solicitud para obtener la lista actualizada de alumnos
			const updatedResponse = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/alumno`,
			);
			const updatedData = await updatedResponse.json();

			// Actualiza el estado de alumnos con la nueva lista
			setAlumnos(updatedData.alumnos);

			setShowEditModal(false);
			setShowSaveConfirmModal(false);
		} catch (error) {
			console.error('Error al actualizar alumno:', error);
		}
	};

	return (
		<div className='p-3'>
			<Row className='mb-3  justify-content-center'>
				<Col>
					<Link
						href={`/dashboard/${session?.user?.rol?.name}/regalumnos`}>
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
							Registrar Alumno
						</Button>
					</Link>
				</Col>
				<Col>
					{/* Botón para volver */}
					<Link href={`/dashboard/${session?.user?.rol?.name}`}>
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

			<Table
				striped
				bordered
				hover>
				<thead>
					<tr>
						<th>Legajo</th>
						<th>Nombre</th>
						<th>Telefono</th>
						<th>Acciones</th>
					</tr>
				</thead>

				<tbody>
					{Array.isArray(alumnos) && alumnos.length > 0 ? (
						alumnos.map((alumno) => (
							<tr key={alumno.id}>
								<td>{alumno?.UsuarioAlumno?.legajo}</td>
								<td>
									{alumno.UsuarioAlumno &&
										`${alumno?.UsuarioAlumno?.nombre}, ${alumno?.UsuarioAlumno?.apellido}`}
								</td>
								<td>
									{alumno.UsuarioAlumno &&
										alumno?.UsuarioAlumno?.telefono}
								</td>
								<td>
									<Button
										variant='link'
										onClick={() => handleConsultar(alumno)}
										title='Consultar Alumno'>
										<BsEye />
									</Button>

									<Button
										variant='link'
										onClick={() => handleModificar(alumno)}
										title='Modificar Alumno'>
										<BsPencil />
									</Button>

									<Button
										variant='link'
										onClick={() => handleEliminar(alumno.id)}
										title='Eliminar Alumno'>
										<BsTrash />
									</Button>
								</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan='4'>No hay alumnos disponibles</td>
						</tr>
					)}
				</tbody>
			</Table>

			<Modal
				show={showModal}
				onHide={() => setShowModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Detalles del Alumno</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					{selectedAlumno && (
						<>
							<p>Legajo: {selectedAlumno?.UsuarioAlumno?.legajo}</p>
							<p>
								Fecha de ingreso:{' '}
								{new Date(
									selectedAlumno?.UsuarioAlumno?.fecha_ingreso,
								).toLocaleDateString()}
							</p>
							<p>
								Fecha de egreso:{' '}
								{selectedAlumno?.UsuarioAlumno?.fecha_egreso
									? new Date(
											selectedAlumno?.UsuarioAlumno?.fecha_egreso,
									  ).toLocaleDateString()
									: 'N/A'}
							</p>
							<p>Nombre: {selectedAlumno?.UsuarioAlumno?.nombre}</p>
							<p>Apellido: {selectedAlumno?.UsuarioAlumno?.apellido}</p>
							<p>DNI: {selectedAlumno?.UsuarioAlumno?.dni}</p>
							<p>CUIL: {selectedAlumno?.UsuarioAlumno?.cuil}</p>
							<p>
								Fecha de nacimiento:{' '}
								{new Date(
									selectedAlumno?.UsuarioAlumno?.fechaNacimiento,
								).toLocaleDateString()}
							</p>
							<p>Teléfono: {selectedAlumno?.UsuarioAlumno?.telefono}</p>
							<p>
								Estado:{' '}
								{selectedAlumno?.UsuarioAlumno?.is_active
									? 'Activo'
									: 'Inactivo'}
							</p>
						</>
					)}
				</Modal.Body>

				<Modal.Footer>
					<Button
						variant='secondary'
						onClick={() => setShowModal(false)}>
						Cerrar
					</Button>
				</Modal.Footer>
			</Modal>

			<Modal
				show={showEditModal}
				onHide={() => setShowEditModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Editar Alumno</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					{selectedAlumno && (
						<Form>
							<Form.Group controlId='formLegajo'>
								<Form.Label>Legajo</Form.Label>
								<Form.Control
									type='text'
									defaultValue={selectedAlumno?.UsuarioAlumno?.legajo}
								/>
							</Form.Group>

							<Form.Group controlId='formNombre'>
								<Form.Label>Nombre</Form.Label>
								<Form.Control
									type='text'
									defaultValue={selectedAlumno?.UsuarioAlumno?.nombre}
								/>
							</Form.Group>

							<Form.Group controlId='formApellido'>
								<Form.Label>Apellido</Form.Label>
								<Form.Control
									type='text'
									defaultValue={selectedAlumno?.UsuarioAlumno?.apellido}
								/>
							</Form.Group>
							<Form.Group controlId='formDNI'>
								<Form.Label>DNI</Form.Label>
								<Form.Control
									type='text'
									defaultValue={selectedAlumno?.UsuarioAlumno?.dni}
								/>
							</Form.Group>
						</Form>
					)}
				</Modal.Body>

				<Modal.Footer>
					<Button
						variant='secondary'
						onClick={() => setShowEditModal(false)}>
						Cancelar
					</Button>

					<Button
						variant='primary'
						onClick={handleSave}>
						Guardar
					</Button>
				</Modal.Footer>
			</Modal>

			<Modal
				show={showSaveConfirmModal}
				onHide={() => setShowSaveConfirmModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Confirmar cambios</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					¿Estás seguro de que quieres guardar los cambios?
				</Modal.Body>

				<Modal.Footer>
					<Button
						variant='secondary'
						onClick={() => setShowSaveConfirmModal(false)}>
						Cancelar
					</Button>

					<Button
						variant='primary'
						onClick={handleConfirmSave}>
						Confirmar
					</Button>
				</Modal.Footer>
			</Modal>

			<Modal
				show={showConfirmModal}
				onHide={() => setShowConfirmModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Confirmar eliminación</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					¿Estás seguro de que quieres eliminar a este alumno?
				</Modal.Body>

				<Modal.Footer>
					<Button
						variant='secondary'
						onClick={() => setShowConfirmModal(false)}>
						No
					</Button>

					<Button
						variant='danger'
						onClick={handleConfirmDelete}>
						Sí, eliminar
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default VistaAlumnosPage;
