'use client';
// Importa useState y useEffect desde 'react'
import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Modal } from 'react-bootstrap';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

// Define la interfaz para el objeto de provincia
interface Provincia {
	id: string;
	provincia: string;
}

// Define la interfaz para el formulario
interface FormData {
	empleado: {
		matricula: string;
		isActive: null;
	};
	usuario: {
		legajo: string;
		fecha_ingreso: string;
		fecha_egreso: null;
		nombre: string;
		apellido: string;
		dni: string;
		cuil: string;
		fechaNacimiento: string;
		telefono: string;
		is_active: boolean;
		create_for: string;
		update_for: string;
		password: string;
		rolId: string;
	};
	domicilio: {
		calle: string;
		numero: string;
		barrio: string;
		localidad: string;
		provinciaId: string;
	};
	contacto: {
		contacto: string;
		email: string;
	};
}

const RegEmpleadoPage = () => {
	// Usa el hook useSession de next-auth/react para obtener la sesión actual
	const { data: session } = useSession();

	// Estado para almacenar las provincias
	const [provincias, setProvincias] = useState<Provincia[]>([]);

	// Estado para almacenar roles
	const [roles, setRoles] = useState([]);

	// Estado para almacenar el estado del formulario (éxito o error)
	const [statusMessage, setStatusMessage] = useState<string | null>(null);

	// Estado para almacenar los datos del formulario
	const [formData, setFormData] = useState<FormData>({
		empleado: {
			matricula: '',
			isActive: null,
		},
		usuario: {
			legajo: '',
			fecha_ingreso: '',
			fecha_egreso: null,
			nombre: '',
			apellido: '',
			dni: '',
			cuil: '',
			fechaNacimiento: '',
			telefono: '',
			is_active: true,
			create_for: `${session?.user?.nombre}`,
			update_for: '',
			password: '',
			rolId: '',
		},
		domicilio: {
			calle: '',
			numero: '',
			barrio: '',
			localidad: '',
			provinciaId: '',
		},
		contacto: {
			contacto: '',
			email: '',
		},
	});

	// Estado para mostrar/ocultar el modal
	const [showModal, setShowModal] = useState(false);

	// Función para actualizar el estado del formulario cuando se cambia un campo
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;

		// Divide el nombre en partes (por ejemplo, 'usuario.apellido' se divide en ['usuario', 'apellido'])
		const nameParts = name.split('.');

		// Si hay más de una parte en el nombre, actualiza el estado de manera anidada
		if (nameParts.length > 1) {
			setFormData((prevFormData) => ({
				...prevFormData,
				[nameParts[0]]: {
					...prevFormData[nameParts[0]],
					[nameParts[1]]: value,
				},
			}));
		} else {
			// Si solo hay una parte en el nombre, actualiza el estado directamente
			setFormData((prevFormData) => ({
				...prevFormData,
				[name]: value,
			}));
		}
	};

	// Función para enviar el formulario al servidor
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/empleado`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(formData),
				},
			);
			if (response.ok) {
				setStatusMessage('Usuario registrado con éxito.');
				setShowModal(true);
				// Limpiar los campos después de un registro exitoso
				setFormData({
					empleado: {
						matricula: '',
						isActive: null,
					},
					usuario: {
						legajo: '',
						fecha_ingreso: new Date().toISOString().slice(0, 10),
						fecha_egreso: null,
						nombre: '',
						apellido: '',
						dni: '',
						cuil: '',
						fechaNacimiento: '',
						telefono: '',
						is_active: true,
						create_for: `${session.nombre}`,
						update_for: '',
						password: '',
						rolId: '',
					},
					domicilio: {
						calle: '',
						numero: '',
						barrio: '',
						localidad: '',
						provinciaId: '',
					},
					contacto: {
						contacto: '',
						email: '',
					},
				});
			} else {
				setStatusMessage('Error al registrar el usuario. Puede que ya exista.');
				setShowModal(true);
				const data = await response.json();
				console.error('Error al registrar el usuario:', data);
			}
			console.log(formData);
		} catch (error) {
			console.error('Error al enviar el formulario:', error);
			setStatusMessage('Error al registrar el usuario.');
			setShowModal(true);
		}
	};

	// Función para cargar las provincias desde el servidor
	const fetchProvincias = async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/provincia`,
			);
			if (response.ok) {
				const data = await response.json();
				setProvincias(data);
			} else {
				console.error('Error al cargar las provincias:', response.statusText);
			}
		} catch (error) {
			console.error('Error al cargar las provincias:', error);
		}
	};

	// Cargar las provincias al montar el componente
	useEffect(() => {
		fetchProvincias();
	}, []);

	useEffect(() => {
		const fetchRoles = async () => {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/rols`,
				);
				if (response.ok) {
					const data = await response.json();
					setRoles(data);
				} else {
					console.error('Error al cargar los roles:', response.statusText);
				}
			} catch (error) {
				console.error('Error al cargar los roles:', error);
			}
		};

		fetchRoles();
	}, []);

	console.log(formData.usuario.rolId);

	useEffect(() => {
		const intervalo = setInterval(() => {
			setFormData((prevState) => ({
				...prevState,
				usuario: {
					...prevState.usuario,
					fecha_ingreso: new Date().toISOString().slice(0, 10),
				},
			}));
		}, 1000);

		return () => clearInterval(intervalo);
	}, []);

	return (
		<Container className='p-3'>
			<Form onSubmit={handleSubmit}>
				{/* Campos existentes */}
				<Row className='mb-3'>
					<Col>
						<Form.Group controlId='legajo'>
							<Form.Label>Legajo *</Form.Label>
							<Form.Control
								type='text'
								name='usuario.legajo'
								value={formData.usuario.legajo}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
					<Col>
						<Form.Group controlId='matricula'>
							<Form.Label>matricula</Form.Label>
							<Form.Control
								type='text'
								name='empleado.matricula'
								value={formData.empleado.matricula}
								onChange={handleChange}
							/>
						</Form.Group>
					</Col>
				</Row>
				<Row className='mb-3'>
					<Col>
						<Form.Group controlId='nombre'>
							<Form.Label>Nombre *</Form.Label>
							<Form.Control
								type='text'
								name='usuario.nombre'
								value={formData.usuario.nombre}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
					<Col>
						<Form.Group controlId='apellido'>
							<Form.Label>Apellido *</Form.Label>
							<Form.Control
								type='text'
								name='usuario.apellido'
								value={formData.usuario.apellido}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
				</Row>
				<Row className='mb-3'>
					<Col>
						<Form.Group controlId='dni'>
							<Form.Label>DNI *</Form.Label>
							<Form.Control
								type='text'
								name='usuario.dni'
								value={formData.usuario.dni}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
					<Col>
						<Form.Group controlId='cuil'>
							<Form.Label>CUIL *</Form.Label>
							<Form.Control
								type='text'
								name='usuario.cuil'
								value={formData.usuario.cuil}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
				</Row>
				<Row className='mb-3'>
					<Col>
						<Form.Group controlId='fechaNacimiento'>
							<Form.Label>Fecha de Nacimiento *</Form.Label>
							<Form.Control
								type='date'
								name='usuario.fechaNacimiento'
								value={formData.usuario.fechaNacimiento}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
					<Col>
						<Form.Group controlId='telefono'>
							<Form.Label>Teléfono *</Form.Label>
							<Form.Control
								type='text'
								name='usuario.telefono'
								value={formData.usuario.telefono}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
					<Col>
						<Form.Group controlId='email'>
							<Form.Label>Email *</Form.Label>
							<Form.Control
								type='email'
								name='contacto.email'
								value={formData.contacto.email}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
				</Row>
				<Row className='mb-3'>
					<Col>
						<Form.Group controlId='calle'>
							<Form.Label>Calle *</Form.Label>
							<Form.Control
								type='text'
								name='domicilio.calle'
								value={formData.domicilio.calle}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
					<Col>
						<Form.Group controlId='numero'>
							<Form.Label>Número *</Form.Label>
							<Form.Control
								type='text'
								name='domicilio.numero'
								value={formData.domicilio.numero}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
					<Col>
						<Form.Group controlId='barrio'>
							<Form.Label>Barrio *</Form.Label>
							<Form.Control
								type='text'
								name='domicilio.barrio'
								value={formData.domicilio.barrio}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
				</Row>
				<Row className='mb-3'>
					<Col>
						<Form.Group controlId='localidad'>
							<Form.Label>Localidad *</Form.Label>
							<Form.Control
								type='text'
								name='domicilio.localidad'
								value={formData.domicilio.localidad}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
					<Col>
						<Form.Group controlId='provinciaId'>
							<Form.Label>Provincia *</Form.Label>
							<Form.Control
								as='select'
								name='domicilio.provinciaId'
								value={formData?.domicilio?.provinciaId || ''}
								onChange={handleChange}
								required>
								<option
									value=''
									disabled>
									Selecciona una provincia
								</option>
								{provincias.map((provincia) => (
									<option
										key={provincia.id}
										value={provincia.id}>
										{provincia?.provincia}
									</option>
								))}
							</Form.Control>
						</Form.Group>
					</Col>
				</Row>
				<Row className='mb-3'>
					<Row className='mb-3'>
						<Col>
							<Form.Group controlId='fechaIngreso'>
								<Form.Label>Fecha de Ingreso *</Form.Label>
								<Form.Control
									type='date'
									name='usuario.fecha_ingreso'
									value={formData.usuario.fecha_ingreso}
									onChange={handleChange}
									required
								/>
							</Form.Group>
						</Col>
						<Col>
							<Form.Group controlId='rolId'>
								<Form.Label>Rol *</Form.Label>
								<Form.Control
									as='select'
									name='usuario.rolId'
									value={formData?.usuario.rolId || ''}
									onChange={handleChange}
									required>
									<option
										disabled
										value=''>
										Selecciona un Rol para el empleado
									</option>
									{roles.map((rol) => (
										<option
											key={rol.id}
											value={rol.id}>
											{rol.name}
										</option>
									))}
								</Form.Control>
							</Form.Group>
						</Col>
					</Row>
				</Row>

				{/* Botón para enviar el formulario */}
				<Row className='mb-3'>
					<Col>
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
							Registrar Empleado
						</Button>
					</Col>
					<Col>
						{/* Botón para volver */}
						<Link href={`/dashboard/${session.rol}/vistausuarios`}>
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
			</Form>

			<Modal
				show={showModal}
				onHide={() => setShowModal(false)}
				backdrop='static'
				keyboard={false}>
				<Modal.Header closeButton>
					<Modal.Title>Estado del Registro</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<p>{statusMessage}</p>
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant='flat'
						onClick={() => setShowModal(false)}>
						Cerrar
					</Button>
				</Modal.Footer>
			</Modal>
		</Container>
	);
};

export default RegEmpleadoPage;
