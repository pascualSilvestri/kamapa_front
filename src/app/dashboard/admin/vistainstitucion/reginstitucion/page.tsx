'use client';
import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Modal } from 'react-bootstrap';
import useFormStatus from './../../../../components/useFormStatus';

// Define la interfaz para el objeto de provincia
interface Provincia {
	provinciaId: string;
	provincia: string;
}

// Define la interfaz para los datos del formulario
interface FormData {
	institucion: {
		cue: string;
		logo: any;
		nombre: string;
		descripcion: string;
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

// Define el componente del formulario de registro de institución
const RegInstitucionPage = () => {
	// Estados para los datos del formulario, provincias, estado del modal y estado del formulario
	const [formState, setFormState] = useState<FormData>({
		institucion: {
			cue: '',
			logo: new File([], ''),
			nombre: '',
			descripcion: '',
		},
		domicilio: {
			calle: '',
			numero: '',
			barrio: '',
			localidad: '',
			provinciaId: '', // Asegúrate de que provinciaId se inicialice correctamente
		},
		contacto: {
			contacto: '',
			email: '',
		},
	});

	const [provincias, setProvincias] = useState<Provincia[]>([]);
	const { status, setStatus, resetStatus } = useFormStatus(); // Utiliza el hook para el estado del formulario
	const [showModal, setShowModal] = useState(false);
	const [modalMessage, setModalMessage] = useState('');

	// Función para manejar los cambios en los campos del formulario
	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) => {
		const { name, value } = e.target;

		// Divide el nombre del campo en partes para manejar campos anidados
		const fieldNames = name.split('.');

		// Actualiza el estado del formulario basándose en el campo que cambió
		setFormState((prevFormState) => {
			// Crea una copia profunda del estado del formulario
			const updatedFormState = { ...prevFormState };

			// Itera sobre las partes del nombre del campo y actualiza el estado anidado correspondiente
			let currentState = updatedFormState;
			for (let i = 0; i < fieldNames.length - 1; i++) {
				currentState = currentState[fieldNames[i]];
			}

			// Asigna el nuevo valor al campo correspondiente
			currentState[fieldNames[fieldNames.length - 1]] = value;

			// Retorna el nuevo estado del formulario
			return updatedFormState;
		});
	};

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//////////////////////////////////Codigo modificaco por pascual para subir imagen//////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	const handleFileInputChange = (e) => {
		const file = e.target.files[0];

		if (file) {
			setFormState((prevFormState) => ({
				...prevFormState,
				institucion: {
					...prevFormState.institucion,
					logo: file, // Almacena el archivo directamente en el estado
				},
			}));
		}
	};
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// Carga las provincias desde la API al cargar el componente
	useEffect(() => {
		const fetchProvincias = async () => {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/provincia`,
				);
				if (response.ok) {
					const data = await response.json();
					setProvincias(data);
				} else {
					console.error('Error al cargar las provincias');
				}
			} catch (error) {
				console.error('Error al cargar las provincias:', error);
			}
		};

		fetchProvincias();
	}, []);

	// Define una función para reiniciar el estado del formulario
	const resetForm = () => {
		return {
			institucion: {
				cue: '',
				logo: new File([], ''),
				nombre: '',
				descripcion: '',
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
		};
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		// Crea un objeto FormData para enviar los datos del formulario
		const formData = new FormData();

		// Agrega los datos del formulario al objeto FormData
		formData.append('cue', formState.institucion.cue);
		formData.append(
			'logo',
			formState.institucion.logo,
			formState.institucion.logo.name,
		); // Asegúrate de incluir el nombre del archivo
		formData.append('nombre', formState.institucion.nombre);
		formData.append('descripcion', formState.institucion.descripcion);
		formData.append('calle', formState.domicilio.calle);
		formData.append('numero', formState.domicilio.numero);
		formData.append('barrio', formState.domicilio.barrio);
		formData.append('localidad', formState.domicilio.localidad);
		formData.append('provinciaId', formState.domicilio.provinciaId);
		formData.append('contacto', formState.contacto.contacto);
		formData.append('email', formState.contacto.email);

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/institucion`,
				{
					method: 'POST',
					body: formData,
				},
			);

			const data = await response.json();

			console.log(data);

			if (response.ok) {
				// Si el registro fue exitoso, muestra un mensaje de éxito
				setStatus('success');
				setModalMessage('Institución registrada con éxito');
				setShowModal(true);
				// Limpia el estado del formulario llamando a la función resetForm
				setFormState(resetForm());
			} else {
				// Si el registro no fue exitoso, muestra un mensaje de error
				setStatus('error');
				setModalMessage('Error al registrar la institución');
				setShowModal(true);
				console.log('Error al registrar la institución', data);
			}
		} catch (error) {
			// Si hay un error en la solicitud, muestra un mensaje de error
			setStatus('error');
			setModalMessage('Error al registrar la institución');
			setShowModal(true);
			console.error('Error al registrar la institución', error);
		}
	};

	// Renderiza el formulario y el modal
	return (
		<Container className='p-3'>
			<Form onSubmit={handleSubmit}>
				{/* Campos del formulario */}
				<Row className='mb-3'>
					<Col sm={12}>
						<h3>Campos obligatorios (*)</h3>
					</Col>
				</Row>
				<Row className='mb-3'>
					<Col sm={6}>
						<Form.Group controlId='cue'>
							<Form.Label>CUE *</Form.Label>
							<Form.Control
								type='text'
								name='institucion.cue'
								value={formState.institucion.cue}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
					<Col sm={6}>
						<Form.Group controlId='logo'>
							<Form.Label>Logo</Form.Label>
							<Form.Control
								type='file'
								name='institucion.logo'
								accept='image/*'
								onChange={handleFileInputChange}
							/>
						</Form.Group>
					</Col>
				</Row>
				<Row className='mb-3'>
					<Col sm={6}>
						<Form.Group controlId='nombre'>
							<Form.Label>Nombre de la Institución *</Form.Label>
							<Form.Control
								type='text'
								name='institucion.nombre'
								value={formState.institucion.nombre}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
					<Col sm={6}>
						<Form.Group controlId='descripcion'>
							<Form.Label>Descripción</Form.Label>
							<Form.Control
								type='text'
								name='institucion.descripcion'
								value={formState.institucion.descripcion}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
				</Row>
				<Row className='mb-3'>
					<Col sm={6}>
						<Form.Group controlId='calle'>
							<Form.Label>Calle *</Form.Label>
							<Form.Control
								type='text'
								name='domicilio.calle'
								value={formState.domicilio.calle}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
					<Col sm={6}>
						<Form.Group controlId='numero'>
							<Form.Label>Número del domicilio *</Form.Label>
							<Form.Control
								type='text'
								name='domicilio.numero'
								value={formState.domicilio.numero}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
				</Row>
				<Row className='mb-3'>
					<Col sm={6}>
						<Form.Group controlId='barrio'>
							<Form.Label>Barrio *</Form.Label>
							<Form.Control
								type='text'
								name='domicilio.barrio'
								value={formState.domicilio.barrio}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
					<Col sm={6}>
						<Form.Group controlId='localidad'>
							<Form.Label>Localidad *</Form.Label>
							<Form.Control
								type='text'
								name='domicilio.localidad'
								value={formState.domicilio.localidad}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
				</Row>
				<Row className='mb-3'>
					<Col sm={6}>
						<Form.Group controlId='provinciaId'>
							<Form.Label>Provincia *</Form.Label>
							<Form.Control
								as='select'
								name='domicilio.provinciaId'
								value={formState.domicilio.provinciaId}
								onChange={handleChange}
								required>
								<option value=''>Selecciona una provincia</option>
								{/* Mapea las opciones de provincia desde el estado */}
								{Array.isArray(provincias) &&
									provincias.map((provincia) => (
										<option
											key={provincia.id}
											value={provincia.id}>
											{provincia.provincia}
										</option>
									))}
							</Form.Control>
						</Form.Group>
					</Col>
				</Row>
				<Row className='mb-3'>
					<Col sm={6}>
						<Form.Group controlId='contacto'>
							<Form.Label>Telefono de Contacto *</Form.Label>
							<Form.Control
								type='text'
								name='contacto.contacto'
								value={formState.contacto.contacto}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
					<Col sm={6}>
						<Form.Group controlId='email'>
							<Form.Label>Correo</Form.Label>
							<Form.Control
								type='email'
								name='contacto.email'
								value={formState.contacto.email}
								onChange={handleChange}
								required
							/>
						</Form.Group>
					</Col>
				</Row>
				{/* Botón para enviar el formulario */}
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
					Registrar Institución
				</Button>
			</Form>
			{/* Modal para mostrar el estado del formulario */}
			<Modal
				show={showModal}
				onHide={() => setShowModal(false)}>
				<Modal.Header closeButton>
					<Modal.Title>{modalMessage}</Modal.Title>
				</Modal.Header>
				<Modal.Footer>
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
						}}
						onClick={() => setShowModal(false)}>
						Aceptar
					</Button>
				</Modal.Footer>
			</Modal>
			{/* Muestra el estado del formulario */}
			{/* {status && <p>Estado del formulario: {status}</p>} */}
		</Container>
	);
};

export default RegInstitucionPage;
