'use client'
import React, { useState, useEffect } from 'react';
import { BsChevronDown } from 'react-icons/bs';
import { Form, Button, Modal, Container, Row, Col, InputGroup } from 'react-bootstrap';
import { Institucion, Roles, User, UserFormData } from '../../../../model/types';
import { autorizeNivel, autorizeRol } from '../../../../utils/autorizacionPorRoles';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useInstitucionSelectedContext, useRolesContext, useUserContext } from 'context/userContext';
import { Environment } from 'utils/EnviromenManager';

// Define la interfaz Provincia
interface Provincia {
    id: string;
    provincia: string;
}

const RegAdminUsuario = () => {

    const [instituciones, setInstituciones] = useState([]);
    const [institucionSeleccionada, setInstitucionSeleccionada] = useState('');

    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [dni, setDni] = useState('');
    const [calle, setCalle] = useState('');
    const [numero, setNumero] = useState('');
    const [barrio, setBarrio] = useState('');
    const [localidad, setLocalidad] = useState('');
    const [provincias, setProvincias] = useState<Provincia[]>([]);
    const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string>('');
    const [telefono, setTelefono] = useState('');
    const [matriculaProfesional, setMatriculaProfesional] = useState('');
    const [legajo, setLegajo] = useState('');
    const [cuil, setCuil] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [email, setEmail] = useState('');
    const [genero, setGenero] = useState(''); // Nuevo campo de género
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [formValid, setFormValid] = useState(false);

    const { data: session, status: sessionStatus } = useSession();
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);
    const [roles, setRoles] = useState({});
    const [rol, setRol] = useRolesContext();
    const [user, setUser] = useUserContext();

    console.log(session);

    //////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Obtener las provincias de la base de datos para mostrarlas en el select
    useEffect(() => {
        fetch(`${Environment.getEndPoint(Environment.endPoint.provincias)}`)
            .then(response => response.json())
            .then((data: Provincia[]) => {
                setProvincias(data);
            })
            .catch(error => console.error('Error fetching provinces:', error));
    }, []);
    ///////////////////////////////////////////////////////////////////////////////////////////////////////

    // Obtener las instituciones de la base de datos
    useEffect(() => {
        fetch(`${Environment.getEndPoint(Environment.endPoint.institucion)}`)
            .then(response => response.json())
            .then((data) => {
                console.log(data);
                setInstituciones(data);
            })
            .catch(error => console.error('Error fetching institutions:', error));
    }, []);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Obtener los roles de la base de datos para mostrarlos en los checkbox
    useEffect(() => {
        fetch(`${Environment.getEndPoint(Environment.endPoint.roles)}`)
            .then(response => response.json())
            .then((data: Roles[]) => {
                console.log(data)
                const rolesObj = data.reduce((obj, rol) => {
                    obj[rol.name] = { checked: false, id: rol.id };
                    return obj;
                }, {});

                setRoles(rolesObj);
            })
            .catch(error => console.error('Error fetching provinces:', error));
    }, [rol]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Obtengo los datos del formulario y los envio al backend
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (formValid) {
            const formData: UserFormData = {
                usuario: {
                    legajo: legajo,
                    matricula: matriculaProfesional,
                    fechaIngreso: new Date().toISOString(), // Puedes ajustar esto según tus necesidades
                    fechaEgreso: null,
                    nombre: nombre,
                    apellido: apellido,
                    dni: dni,
                    cuil: cuil,
                    fechaNacimiento: fechaNacimiento,
                    telefono: telefono,
                    email: email,
                    is_active: true, // O ajusta esto según tus necesidades
                    create_for: session.user.nombre + ' ' + session.user.apellido, // Puedes ajustar esto según tus necesidades
                    update_for: session.user.nombre + ' ' + session.user.apellido, // Puedes ajustar esto según tus necesidades
                    password: dni, // Puedes ajustar esto según tus necesidades
                    institucionId: parseInt(institucionSeleccionada), // Cambiado para usar el id de la institución seleccionada
                    generoId: genero, // Añadido para enviar el género
                },
                rols: selectedRoleIds,
                domicilio: {
                    calle: calle,
                    numero: numero, // Puedes ajustar esto según tus necesidades
                    barrio: barrio, // Puedes ajustar esto según tus necesidades
                    localidad: localidad, // Puedes ajustar esto según tus necesidades
                    provinciaId: provinciaSeleccionada,
                },
            };

            console.log(formData);

            try {
                const response = await fetch(
                    `${Environment.getEndPoint(Environment.endPoint.usuario)}`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData),
                    }
                );
                console.log(await response.json())

                if (response.ok) {
                    setShowSuccessModal(true);
                    setSuccessMessage('El empleado se registró con éxito.');
                    limpiarCampos(); // Limpia los campos del formulario
                } else {
                    setShowErrorModal(true);
                    setErrorMessage('Hubo un problema al registrar al empleado. Por favor, En Consultar Usuario Verifica que no exista.');
                }
            } catch (error) {
                setShowErrorModal(true);
                setErrorMessage('Hubo un problema al registrar al empleado. Por favor, inténtalo nuevamente.');
            }
        }
    };

    // Función para manejar el cierre del modal
    const handleCloseModal = () => {
        setShowModal(false);
        limpiarCampos(); // Limpia los campos del formulario
    };

    // Función para validar el formulario
    useEffect(() => {
        if (nombre && apellido && dni && provinciaSeleccionada && telefono && legajo && cuil && fechaNacimiento && email && institucionSeleccionada && genero) {
            setFormValid(true);
        } else {
            setFormValid(false);
        }
    }, [nombre, apellido, dni, provinciaSeleccionada, telefono, matriculaProfesional, legajo, cuil, fechaNacimiento, email, calle, barrio, institucionSeleccionada, genero]);

    // Función para limpiar los campos del formulario
    const limpiarCampos = () => {
        setNombre('');
        setApellido('');
        setDni('');
        setCalle('');
        setNumero('');
        setBarrio('');
        setLocalidad('');
        setProvinciaSeleccionada('');
        setTelefono('');
        setMatriculaProfesional('');
        setLegajo('');
        setCuil('');
        setFechaNacimiento('');
        setEmail('');
        setInstitucionSeleccionada('');
        setGenero('');
        setRoles({});
        setSelectedRoleIds([]);
        setShowSuccessModal(false)
    };

    const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <h1>Registro de Usuarios</h1>
                    <h3>(Campos Obligatorios *)</h3>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group controlId="nombre">
                            <Form.Label>Nombre *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                pattern="[a-zA-Zñ-Ñ]{2,}"
                                title="Ingrese solo letras y mínimo 2 caracteres"
                                minLength={3}
                                maxLength={100}
                                autoComplete='off'

                            />
                        </Form.Group>
                        <Form.Group controlId="apellido">
                            <Form.Label>Apellido *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Apellido"
                                value={apellido}
                                onChange={(e) => setApellido(e.target.value)}
                                minLength={3}
                                maxLength={100}
                                autoComplete='off'
                                required
                                pattern="[a-zA-Zñ-Ñ]{2,}"
                                title="Ingrese solo letras y mínimo 2 caracteres"
                            />
                        </Form.Group>
                        <Form.Group controlId="dni">
                            <Form.Label>DNI *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="DNI"
                                value={dni}
                                onChange={(e) => setDni(e.target.value)}
                                autoComplete='off'
                            />
                        </Form.Group>
                        <Form.Group controlId="cuil">
                            <Form.Label>CUIL *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="CUIL"
                                value={cuil}
                                onChange={(e) => setCuil(e.target.value)}
                                autoComplete='off'
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="fechaNacimiento">
                            <Form.Label>Fecha de Nacimiento *</Form.Label>
                            <Form.Control
                                type="date"
                                value={fechaNacimiento}
                                onChange={(e) => setFechaNacimiento(e.target.value)}
                                autoComplete='off'
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="telefono">
                            <Form.Label>Teléfono *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Teléfono"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                autoComplete='off'
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="email">
                            <Form.Label>Email *</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete='off'
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="genero">
                            <Form.Label>Género *</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    as="select"
                                    value={genero}
                                    onChange={(e) => setGenero(e.target.value)}
                                    autoComplete='off'
                                    required
                                >
                                    <option value="">Selecciona una opción</option>
                                    <option value="1">Masculino</option>
                                    <option value="2">Femenino</option>
                                    <option value="3">Otro</option>
                                </Form.Control>
                                <InputGroup.Text>
                                    <BsChevronDown />
                                </InputGroup.Text>
                            </InputGroup>
                        </Form.Group>
                        <Form.Group controlId="institucion">
                            <Form.Label>Institución *</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    as="select"
                                    value={institucionSeleccionada}
                                    onChange={(e) => setInstitucionSeleccionada(e.target.value)}
                                    autoComplete='off'
                                    required
                                >
                                    <option value="">Selecciona una institución</option>
                                    {instituciones.map((institucion) => (
                                        <option key={institucion.id} value={institucion.id}>
                                            {institucion.nombre}
                                        </option>
                                    ))}
                                </Form.Control>
                                <InputGroup.Text>
                                    <BsChevronDown />
                                </InputGroup.Text>
                            </InputGroup>
                        </Form.Group>
                        <Form.Group controlId="provincia">
                            <Form.Label>Provincia *</Form.Label>
                            <InputGroup>
                                <Form.Control
                                    as="select"
                                    value={provinciaSeleccionada}
                                    onChange={(e) => setProvinciaSeleccionada(e.target.value)}
                                    autoComplete='off'
                                    required
                                >
                                    <option value="">Selecciona una provincia</option>
                                    {provincias.map((provincia) => (
                                        <option key={provincia.id} value={provincia.id}>
                                            {provincia.provincia}
                                        </option>
                                    ))}
                                </Form.Control>
                                <InputGroup.Text>
                                    <BsChevronDown />
                                </InputGroup.Text>
                            </InputGroup>
                        </Form.Group>
                        <Form.Group controlId="calle">
                            <Form.Label>Calle *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Calle"
                                value={calle}
                                onChange={(e) => setCalle(e.target.value)}
                                autoComplete='off'
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="numero">
                            <Form.Label>Número *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Número"
                                value={numero}
                                onChange={(e) => setNumero(e.target.value)}
                                autoComplete='off'
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="barrio">
                            <Form.Label>Barrio *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Barrio"
                                value={barrio}
                                onChange={(e) => setBarrio(e.target.value)}
                                autoComplete='off'
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="localidad">
                            <Form.Label>Localidad *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Localidad"
                                value={localidad}
                                onChange={(e) => setLocalidad(e.target.value)}
                                autoComplete='off'
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="legajo">
                            <Form.Label>Legajo *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Legajo"
                                value={legajo}
                                onChange={(e) => setLegajo(e.target.value)}
                                autoComplete='off'
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="matriculaProfesional">
                            <Form.Label>Matrícula Profesional</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Matrícula Profesional"
                                value={matriculaProfesional}
                                onChange={(e) => setMatriculaProfesional(e.target.value)}
                                autoComplete='off'
                                required
                            />
                        </Form.Group>
                        <Form.Group>
                            <Form.Label>Roles *</Form.Label>
                            {Object.keys(roles).map((rol) => (
                                <Form.Check
                                    key={rol}
                                    type="checkbox"
                                    label={rol}
                                    checked={roles[rol].checked}
                                    autoComplete='off'
                                    onChange={(e) => {
                                        const updatedRoles = {
                                            ...roles,
                                            [rol]: {
                                                ...roles[rol],
                                                checked: e.target.checked,
                                            },
                                        };
                                        setRoles(updatedRoles);
                                        setSelectedRoleIds(
                                            Object.keys(updatedRoles)
                                                .filter((roleName) => updatedRoles[roleName].checked)
                                                .map((roleName) => updatedRoles[roleName].id)
                                        );
                                    }}
                                />
                            ))}
                        </Form.Group>
                        <Button type="submit" variant='flat' style={{
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
                            disabled={!formValid}>
                            Registrar Usuario
                        </Button>
                    </Form>
                </Col>
            </Row>

            {/* Modal de éxito */}
            <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Registro Exitoso</Modal.Title>
                </Modal.Header>
                <Modal.Body>{successMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={handleCloseModal}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de error */}
            <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Error en el Registro</Modal.Title>
                </Modal.Header>
                <Modal.Body>{errorMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={() => setShowErrorModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default RegAdminUsuario;
