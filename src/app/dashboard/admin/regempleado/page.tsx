'use client'
import { useState, useEffect } from 'react';
import { Form, Button, Modal, Container, Row, Col } from 'react-bootstrap';
import { Rol, User } from '../../../../model/types';
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
    const [provincias, setProvincias] = useState<Provincia[]>([]); // Arreglo de provincias
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

    const { data: session, status: sessionStatus } = useSession();
    const [rol, setRol] = useState<Rol>({name: '', id: 0});

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
        setRol(session.user.rol);
        }
    }
    , [session]);

 

     // Lógica para obtener provincias
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/provincia`)
            .then(response => response.json())
            .then((data: Provincia[]) => {
                setProvincias(data);
            })
            .catch(error => console.error('Error fetching provinces:', error));
    }, []);

    // Lógica para obtener roles
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/rols`)
            .then(response => response.json())
            .then(data => {
                // Maneja los datos de los roles
            })
            .catch(error => console.error('Error fetching roles:', error));
    }, []);


       // Función para manejar el envío del formulario
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setShowModal(true);
    };

    // Función para manejar el cierre del modal
    
    const handleCloseModal = () => {
        setShowModal(false);
        limpiarCampos(); // Limpia los campos del formulario
    };


    return (
        <Container>
        <Row className="justify-content-md-center">
            <Col md={6}>
                <h1>Registro de Empleado</h1>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="nombre">
                        <Form.Label>Nombre</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Nombre"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        /> 
                    </Form.Group>
                    <Form.Group controlId="apellido">
                        <Form.Label>Apellido</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Apellido"
                            value={apellido}
                            onChange={(e) => setApellido(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="dni">
                        <Form.Label>DNI</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="DNI"
                            value={dni}
                            onChange={(e) => setDni(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="domicilio">
                        <Form.Label>Domicilio</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Domicilio"
                            value={domicilio}
                            onChange={(e) => setDomicilio(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="provincias">
                        <Form.Label>Provincia *</Form.Label>
                        <Form.Control 
                            as="select"
                            value={provinciaSeleccionada} // Asegúrate de tener un estado para la provincia seleccionada
                            onChange={(e) => setProvinciaSeleccionada(e.target.value)}
                        >
                            <option value="">Selecciona una provincia</option>
                            {provincias.map((provincia) => (
                                <option key={provincia.id} value={provincia.id}>
                                    {provincia.provincia}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <Form.Group controlId="telefono">
                        <Form.Label>Teléfono</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Teléfono"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="matriculaProfesional">
                        <Form.Label>Matrícula Profesional</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Matrícula Profesional"
                            value={matriculaProfesional}
                            onChange={(e) => setMatriculaProfesional(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="legajo">
                        <Form.Label>Legajo</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Legajo"
                            value={legajo}
                            onChange={(e) => setLegajo(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="cuil">
                        <Form.Label>CUIL</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="CUIL"
                            value={cuil}
                            onChange={(e) => setCuil(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="fechaNacimiento">
                        <Form.Label>Fecha de Nacimiento</Form.Label>
                        <Form.Control 
                            type="date" 
                            value={fechaNacimiento}
                            onChange={(e) => setFechaNacimiento(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control 
                            type="email" 
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="roles">
                        <Form.Label>Roles</Form.Label>
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
                    <Form onSubmit={handleSubmit} className="d-flex justify-content-center">
                        <div className='mb-3 me-1'>
                            <Link href={`/dashboard/${rol.name}`}>
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
                                }}>
                                Registrar Empleado
                            </Button>
                        </div>
                    </Form>
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
                            <Button variant="secondary" onClick={handleCloseModal}>
                                Cancelar
                            </Button>
                            <Button variant="primary" onClick={handleCloseModal}>
                                Confirmar Registro
                            </Button>
                        </Modal.Footer>
                    </Modal>
                </Col>
        </Row>
    </Container>
    );
};

export default RegEmpleado;
