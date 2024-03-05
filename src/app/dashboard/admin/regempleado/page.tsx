'use client'
import { useState, useEffect } from 'react';
import { BsChevronDown } from 'react-icons/bs';
import { Form, Button, Modal, Container, Row, Col } from 'react-bootstrap';
import { Rol, User, EmployeeFormData } from '../../../../model/types';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

// Define la interfaz Provincia
interface Provincia {
    id: string;
    provincia: string;
}

const RegEmpleado = () => {
    const [nombre, setNombre] = useState('');
    const [apellido, setApellido] = useState('');
    const [dni, setDni] = useState('');
    const [domicilio, setDomicilio] = useState('');
    const [provincias, setProvincias] = useState<Provincia[]>([]);
    const [provinciaSeleccionada, setProvinciaSeleccionada] = useState<string>('');
    const [telefono, setTelefono] = useState('');
    const [matriculaProfesional, setMatriculaProfesional] = useState('');
    const [legajo, setLegajo] = useState('');
    const [cuil, setCuil] = useState('');
    const [fechaNacimiento, setFechaNacimiento] = useState('');
    const [email, setEmail] = useState('');
    const [roles, setRoles] = useState({
        admin: false,
        director: false,
        secretario: false,
        preseptor: false,
        profesor: false
    });
    const [showModal, setShowModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [formValid, setFormValid] = useState(false);

    const { data: session, status: sessionStatus } = useSession();
    const [rol, setRol] = useState<Rol>({ name: '', id: 0 });

    const [user, setUser] = useState<User>({
        nombre: '',
        apellido: '',
        legajo: '',
        telefono: '',
    });

    useEffect(() => {
        if (session) {
            setUser({
                nombre: session.user.nombre,
                apellido: session.user.apellido,
                legajo: session.user.legajo,
                telefono: session.user.telefono,
            });
            setRol(session.rol);
        }
    }, [session]);

    // Lógica para obtener provincias
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/provincia`)
            .then(response => response.json())
            .then((data: Provincia[]) => {
                setProvincias(data);
            })
            .catch(error => console.error('Error fetching provinces:', error));
    }, []);

    // Función para manejar el envío del formulario
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (formValid) {
            setShowModal(true);
    
            const formData: EmployeeFormData = {
                empleado: {
                    matricula: matriculaProfesional,
                    isActive: null,
                },
                usuario: {
                    legajo: legajo,
                    fecha_ingreso: new Date().toISOString(), // Puedes ajustar esto según tus necesidades
                    fecha_egreso: null,
                    nombre: nombre,
                    apellido: apellido,
                    dni: dni,
                    cuil: cuil,
                    fechaNacimiento: fechaNacimiento,
                    telefono: telefono,
                    is_active: true, // O ajusta esto según tus necesidades
                    create_for: '', // Puedes ajustar esto según tus necesidades
                    update_for: '', // Puedes ajustar esto según tus necesidades
                    password: '', // Puedes ajustar esto según tus necesidades
                    rolId: '', // Puedes ajustar esto según tus necesidades
                },
                domicilio: {
                    calle: domicilio,
                    numero: '', // Puedes ajustar esto según tus necesidades
                    barrio: '', // Puedes ajustar esto según tus necesidades
                    localidad: '', // Puedes ajustar esto según tus necesidades
                    provinciaId: provinciaSeleccionada,
                },
                contacto: {
                    contacto: '', // Puedes ajustar esto según tus necesidades
                    email: email,
                },
            };
    
            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/empleado`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData),
                    }
                );
    
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
        if (nombre && apellido && dni && domicilio && provinciaSeleccionada && telefono && matriculaProfesional && legajo && cuil && fechaNacimiento && email) {
            setFormValid(true);
        } else {
            setFormValid(false);
        }
    }, [nombre, apellido, dni, domicilio, provinciaSeleccionada, telefono, matriculaProfesional, legajo, cuil, fechaNacimiento, email]);

    // Función para limpiar los campos del formulario
    const limpiarCampos = () => {
        setNombre('');
        setApellido('');
        setDni('');
        setDomicilio('');
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
            profesor: false
        });
    };

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <h1>Registro de Empleado</h1>
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
                        <Form.Group controlId="domicilio">
                            <Form.Label>Domicilio *</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Domicilio"
                                value={domicilio}
                                onChange={(e) => setDomicilio(e.target.value)}
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
                        <Form.Group controlId="telefono">
                            <Form.Label>Teléfono *</Form.Label>
                            <Form.Control 
                                type="text" 
                                placeholder="Teléfono"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="matriculaProfesional">
                            <Form.Label>Matrícula Profesional *</Form.Label>
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
                        <Form.Group controlId="email">
                            <Form.Label>Email *</Form.Label>
                            <Form.Control 
                                type="email" 
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="roles">
                            <Form.Label>Roles *</Form.Label>
                            {Object.keys(roles).map((rol, index) => (
                                <Form.Check 
                                    key={index}
                                    type="checkbox"
                                    id={rol}
                                    label={rol}
                                    checked={roles[rol]}
                                    onChange={(e) => setRoles({ ...roles, [rol]: e.target.checked })}
                                />
                            ))}
                        </Form.Group>
                        <Form.Group className="d-flex justify-content-center">
                            <div className='me-1'>
                                <Link href={`/dashboard/${rol.name}/vistausuarios`}>
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
                                <Button type="submit"  variant='flat' style={{
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
                                    Registrar Empleado
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
                            <Button  variant='secondary' style={{
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
        </Container>
    );
};

export default RegEmpleado;
