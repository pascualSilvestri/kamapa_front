'use client';
import { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import { BsEye, BsPencil, BsTrash } from 'react-icons/bs';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const VistaEmpleadosPage = () => {
	const [empleados, setEmpleados] = useState([]);
	const [selectedEmpleado, setSelectedEmpleado] = useState(null);
	const [showModal, setShowModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showConfirmModal, setShowConfirmModal] = useState(false);
	const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);

	const { data: session } = useSession();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/empleado`,
				);

				if (!response.ok) {
					throw new Error(`Error ${response.status}: ${response.statusText}`);
				}

				const data = await response.json();
				setEmpleados(data.empleados);
				console.log(data);
			} catch (error) {
				console.error('Error al obtener empleados:', error.message);
			}
		};

		fetchData();
	}, []);

	const handleConsultar = (empleado) => {
		setSelectedEmpleado(empleado);
		setShowModal(true);
	};

	const handleEliminar = (empleado) => {
		setSelectedEmpleado(empleado);
		setShowConfirmModal(true);
	};

	const handleConfirmDelete = async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/empleado/${selectedEmpleado}`,
				{
					method: 'DELETE',
				},
			);
			console.log(selectedEmpleado);

			if (!response.ok) {
				const errorData = await response.json();
				console.log('Error status:', response.status);
				console.log('Error data:', errorData);
				throw new Error('Error en la eliminación');
			}

			setEmpleados(empleados.filter((emp) => emp.id !== selectedEmpleado));
			setShowConfirmModal(false);
		} catch (error) {
			console.log(error);
		}
	};

	const handleModificar = (empleado) => {
		setSelectedEmpleado(empleado);
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
			// const dni = document.getElementById('formDNI')?.value;

			const updatedEmpleado = {
				...selectedEmpleado,
				usuario: {
					usuarioId: selectedEmpleado.usuarioId,
					legajo: legajo,
					nombre: nombre,
					apellido: apellido,
					// dni: dni,
				},
			};

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/empleado/${selectedEmpleado.id}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(updatedEmpleado),
				},
			);

			if (!response.ok) {
				const errorData = await response.json();
				console.error('Error status:', response.status);
				console.error('Error data:', errorData);
				throw new Error(`Error en la modificación: ${errorData.message}`);
			}

			// Después de confirmar los cambios, realiza una nueva solicitud para obtener la lista actualizada de empleados
			const updatedResponse = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/empleado`,
			);
			const updatedData = await updatedResponse.json();

			// Actualiza el estado de empleados con la nueva lista
			setEmpleados(updatedData.empleados);

			setShowEditModal(false);
			setShowSaveConfirmModal(false);
		} catch (error) {
			console.error('Error al actualizar empleado:', error);
		}
	};

	return (
		<div className='p-3'>
			<Row className='mb-3  justify-content-center'>
				<Col>
					<Link href={`/dashboard/${session.rol}/vistausuarios/regempleado`}>
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
							Registrar Empleado
						</Button>
					</Link>
				</Col>
				<Col>
					{/* Botón para volver */}
					<Link href={`/dashboard/${session.rol}`}>
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
					{Array.isArray(empleados) && empleados.length > 0 ? (
						empleados.map((empleado) => (
							<tr key={empleado.id}>
								<td>{empleado?.UsuarioEmpleado?.legajo}</td>
								<td>
									{empleado.UsuarioEmpleado &&
										`${empleado?.UsuarioEmpleado?.nombre}, ${empleado?.UsuarioEmpleado?.apellido}`}
								</td>
								<td>
									{empleado.UsuarioEmpleado &&
										empleado?.UsuarioEmpleado?.telefono}
								</td>
								<td>
									<Button
										variant='link'
										onClick={() => handleConsultar(empleado)}
										title='Consultar Empleado'>
										<BsEye />
									</Button>

									<Button
										variant='link'
										onClick={() => handleModificar(empleado)}
										title='Modificar Empleado'>
										<BsPencil />
									</Button>

									<Button
										variant='link'
										onClick={() => handleEliminar(empleado.id)}
										title='Eliminar Empleado'>
										<BsTrash />
									</Button>
								</td>
							</tr>
						))
					) : (
						<tr>
							<td colSpan='4'>No hay empleados disponibles</td>
						</tr>
					)}
				</tbody>
			</Table>

			<Modal
				show={showModal}
				onHide={() => setShowModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>Detalles del Empleado</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					{selectedEmpleado && (
						<>
							<p>Legajo: {selectedEmpleado?.UsuarioEmpleado?.legajo}</p>
							<p>
								Fecha de ingreso:{' '}
								{new Date(
									selectedEmpleado?.UsuarioEmpleado?.fecha_ingreso,
								).toLocaleDateString()}
							</p>
							<p>
								Fecha de egreso:{' '}
								{selectedEmpleado?.UsuarioEmpleado?.fecha_egreso
									? new Date(
											selectedEmpleado?.UsuarioEmpleado?.fecha_egreso,
									  ).toLocaleDateString()
									: 'N/A'}
							</p>
							<p>Nombre: {selectedEmpleado?.UsuarioEmpleado?.nombre}</p>
							<p>Apellido: {selectedEmpleado?.UsuarioEmpleado?.apellido}</p>
							<p>DNI: {selectedEmpleado?.UsuarioEmpleado?.dni}</p>
							<p>CUIL: {selectedEmpleado?.UsuarioEmpleado?.cuil}</p>
							<p>
								Fecha de nacimiento:{' '}
								{new Date(
									selectedEmpleado?.UsuarioEmpleado?.fechaNacimiento,
								).toLocaleDateString()}
							</p>
							<p>Teléfono: {selectedEmpleado?.UsuarioEmpleado?.telefono}</p>
							<p>
								Estado:{' '}
								{selectedEmpleado?.UsuarioEmpleado?.is_active
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
					<Modal.Title>Editar Empleado</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					{selectedEmpleado && (
						<Form>
							<Form.Group controlId='formLegajo'>
								<Form.Label>Legajo</Form.Label>
								<Form.Control
									type='text'
									defaultValue={selectedEmpleado?.UsuarioEmpleado?.legajo}
								/>
							</Form.Group>

							<Form.Group controlId='formNombre'>
								<Form.Label>Nombre</Form.Label>
								<Form.Control
									type='text'
									defaultValue={selectedEmpleado?.UsuarioEmpleado?.nombre}
								/>
							</Form.Group>

							<Form.Group controlId='formApellido'>
								<Form.Label>Apellido</Form.Label>
								<Form.Control
									type='text'
									defaultValue={selectedEmpleado?.UsuarioEmpleado?.apellido}
								/>
							</Form.Group>
							{/* <Form.Group controlId='formDNI'>
								<Form.Label>DNI</Form.Label>
								<Form.Control
									type='text'
									defaultValue={selectedEmpleado?.UsuarioEmpleado?.dni}
								/>
							</Form.Group> */}
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
					¿Estás seguro de que quieres eliminar a este empleado?
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

export default VistaEmpleadosPage;
