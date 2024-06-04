'use client'
import { useState, useEffect } from 'react';
import { BsChevronDown } from 'react-icons/bs';
import { Form, Button, Modal, Container, Row, Col } from 'react-bootstrap';
import { Roles, User, UserFormData } from '../../../../model/types';
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

const RegAlumno = () => {
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
    /// Obtener las provincias de la base de datos para mostrarlos en los select
    useEffect(() => {
        fetch(`${Environment.getEndPoint(Environment.endPoint.provincias)}`)
            .then(response => response.json())
            .then((data: Provincia[]) => {
                setProvincias(data);
            })
            .catch(error => console.error('Error fetching provinces:', error));
    }, []);


    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Obtener los roles de la base de datos para mostrarlos en los checkbox
    useEffect(() => {
        fetch(`${Environment.getEndPoint(Environment.endPoint.roles)}`)
            .then(response => response.json())
            .then((data: Roles[]) => {
                const rolesObj = data.reduce((obj, rol) => {
                    obj[rol.name] = { checked: false, id: rol.id };
                    return obj;
                }, {});

                setRoles(rolesObj);
            })
            .catch(error => console.error('Error fetching provinces:', error));
    }, [rol]);

    ///////////////////////////////////////////////////////////////////////////////////////////////////////
    ///Obtengo los datos del formulario y los envio al backend
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (formValid) {
            // setShowModal(true);

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
                    create_for: session.user.nombre+' '+session.user.apellido, // Puedes ajustar esto según tus necesidades
                    update_for:  session.user.nombre+' '+session.user.apellido, // Puedes ajustar esto según tus necesidades
                    password: dni, // Puedes ajustar esto según tus necesidades
                    institucionId: institucionSelected.id, // Poked
                    // Puedes ajustar esto según tus necesidades
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
                } else {
                    setShowErrorModal(true);
                    setErrorMessage('Hubo un problema al registrar al empleado. Por favor, inténtalo nuevamente.');
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
        if (nombre && apellido && dni && provinciaSeleccionada && telefono && matriculaProfesional && legajo && cuil && fechaNacimiento && email) {
            setFormValid(true);
        } else {
            setFormValid(false);
        }
    }, [nombre, apellido, dni, provinciaSeleccionada, telefono, matriculaProfesional, legajo, cuil, fechaNacimiento, email]);

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
        setRoles({
            admin: false,
            director: false,
            secretario: false,
            preseptor: false,
            profesor: false,
        });
        setSelectedRoleIds([]);
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
                            />
                        </Form.Group>
                        <Form.Group controlId="apellido">
                            <Form.Label>Apellido *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Apellido"
                                value={apellido}
                                onChange={(e) => setApellido(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="dni">
                            <Form.Label>DNI *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="DNI"
                                value={dni}
                                onChange={(e) => setDni(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="cuil">
                            <Form.Label>CUIL *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="CUIL"
                                value={cuil}
                                onChange={(e) => setCuil(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="fechaNacimiento">
                            <Form.Label>Fecha de Nacimiento *</Form.Label>
                            <Form.Control
                                type="date"
                                value={fechaNacimiento}
                                onChange={(e) => setFechaNacimiento(e.target.value)}
                            />
                        </Form.Group>
                        <hr />
                        <Form.Group >
                            <h1>Datos del Domicilio</h1>
                        </Form.Group>
                        <Form.Group controlId="calle">
                            <Form.Label>Nombre de la Calle *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Av. Ejemplo de Calle"
                                value={calle}
                                onChange={(e) => setCalle(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="numero">
                            <Form.Label>Numero o Altura del Domicilio *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="123"
                                value={numero}
                                onChange={(e) => setNumero(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="barrio">
                            <Form.Label>Barrio *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ejemplo: V° Krausen"
                                value={barrio}
                                onChange={(e) => setBarrio(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="localidad">
                            <Form.Label>Localidad *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Ejemplo de Localidad: Rawson"
                                value={localidad}
                                onChange={(e) => setLocalidad(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="provincias">
                            <Form.Label>Provincia *</Form.Label>
                            <div className="input-group">
                                <Form.Control
                                    as="select"
                                    value={provinciaSeleccionada}
                                    onChange={(e) => setProvinciaSeleccionada(e.target.value)}
                                >
                                    <option value="">Selecciona una provincia</option>
                                    {provincias.map((provincia) => (
                                        <option key={provincia.id} value={provincia.id}>
                                            {provincia.provincia}
                                        </option>
                                    ))}
                                </Form.Control>
                                <div className="input-group-append">
                                    <span className="input-group-text">
                                        <BsChevronDown />
                                    </span>
                                </div>
                            </div>
                        </Form.Group>
                        <hr />
                        <Form.Group >
                            <h1>Datos de Contacto *</h1>
                        </Form.Group>
                        <Form.Group controlId="telefono">
                            <Form.Label>Teléfono *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="2645111111"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="email">
                            <Form.Label>Email *</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Ejemplo@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>
                        <hr />
                        <Form.Group >
                            <h1>Datos Institucional *</h1>
                        </Form.Group>
                        <Form.Group controlId="matriculaProfesional">
                            <Form.Label>Matrícula Profesional ( Solo en caso de ser Profesional ).</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Matrícula Profesional"
                                value={matriculaProfesional}
                                onChange={(e) => setMatriculaProfesional(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="legajo">
                            <Form.Label>Legajo *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Legajo"
                                value={legajo}
                                onChange={(e) => setLegajo(e.target.value)}
                            />
                        </Form.Group>
                        <hr />
                        <Form.Group >
                            <h1>Nivel de acceso segun el Rol *</h1>
                        </Form.Group>
                        <Form.Group controlId='roles'>
                            <Form.Label>Roles *</Form.Label>
                            {Object.keys(roles).filter(rol => {
                                   // Determinar el rol de mayor jerarquía en la sesión del usuario
                                const highestUserRole = session.user.Roles.reduce((highest, current) => {
                                    return current.name === 'Admin' ? current.name :
                                        current.name === 'Director' && highest !== 'Admin' ? current.name :
                                        current.name === 'Secretario' && highest !== 'Admin' && highest !== 'Director' ? current.name :
                                        current.name === 'Preceptor' && highest === 'Alumno' ? current.name :
                                        current.name === 'Docente' && highest === 'Alumno' ? current.name :
                                        highest;
                                }, 'Alumno');

                                // Filtrar los roles que se muestran en el formulario
                                return (highestUserRole === 'Admin' || 
                                        (highestUserRole === 'Director' && rol !== 'Admin') ||
                                        (highestUserRole === 'Secretario' && rol !== 'Admin' && rol !== 'Director') ||
                                        (highestUserRole === 'Preceptor' && rol === 'Alumno') ||
                                        (highestUserRole === 'Docente' && rol === 'Alumno'));
                            }).map((rol, index) => (
                                <Form.Check
                                    key={index}
                                    type="checkbox"
                                    id={rol}
                                    label={rol}
                                    checked={roles[rol].checked}
                                    onChange={(e) => {
                                        const isChecked = e.target.checked;
                                        setRoles({ ...roles, [rol]: { ...roles[rol], checked: isChecked } });

                                        if (isChecked) {
                                            setSelectedRoleIds([...selectedRoleIds, roles[rol].id]);
                                        } else {
                                            setSelectedRoleIds(selectedRoleIds.filter(id => id !== roles[rol].id));
                                        }
                                    }}
                                />
                            ))}
                        </Form.Group>

                        <hr />
                        <Form.Group className="d-flex justify-content-center">
                            <div className='me-1'>
                                <Link href={`/dashboard/${autorizeRol(autorizeNivel(rol))}/consultaUsuario`}>
                                    <Button variant='secondary' style={{
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
                                    Registrar
                                </Button>
                            </div>
                        </Form.Group>
                    </Form>

                    {/* Modal para confirmar el registro */}
                    <Modal show={showModal} onHide={handleCloseModal}>
                        <Modal.Header closeButton>
                            <Modal.Title>Confirmar Registro</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            ¿Está seguro que desea registrar a: {nombre} {apellido} con permisos de: {Object.keys(roles).filter(rol => roles[rol]).join(', ')}?
                        </Modal.Body>
                        <Modal.Footer>
                            <Button variant='secondary' style={{
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
                                }}
                                onClick={handleCloseModal}>
                                Cancelar
                            </Button>
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
                                }}
                                onClick={handleCloseModal}>
                                Confirmar Registro
                            </Button>
                        </Modal.Footer>
                    </Modal>
                    <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Éxito</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>{successMessage}</Modal.Body>
                        <Modal.Footer>
                            <Button variant="purple" onClick={() => setShowSuccessModal(false)}>
                                Cerrar
                            </Button>
                        </Modal.Footer>
                    </Modal>

                    <Modal show={showErrorModal} onHide={() => setShowErrorModal(false)}>
                        <Modal.Header closeButton>
                            <Modal.Title>Error</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>{errorMessage}</Modal.Body>
                        <Modal.Footer>
                            <Button variant="danger" onClick={() => setShowErrorModal(false)}>
                                Cerrar
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Col>
            </Row>
            <br />
            <br />
        </Container>
    );
};

export default RegAlumno;
