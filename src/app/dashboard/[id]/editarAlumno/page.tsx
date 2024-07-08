'use client';
import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Row, Col, Spinner, InputGroup } from 'react-bootstrap';
import { BsChevronDown, BsEye, BsPencil, BsTrash } from 'react-icons/bs';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Roles, User } from '../../../../model/types';
import { autorizeNivel, autorizeRol } from '../../../../utils/autorizacionPorRoles';
import { Environment } from 'utils/EnviromenManager';
import { useInstitucionSelectedContext, useRolesContext, useUserContext } from 'context/userContext';

interface Alumno {
    id: string;
    legajo: string;
    nombre: string;
    apellido: string;
    dni: string;
    cuil: string;
    fechaNacimiento: string;
    telefono: string;
    email: string;
    generoId: number;
    fecha_ingreso: string;
    fecha_egreso: string | null;
    domicilioUsuario: {
        localidad: string;
        barrio: string;
        calle: string;
        numero: string;
    };
    Roles: { id: number }[];
}

interface EditarAlumnoPageProps {
    params: { id: string };
}

const EditarAlumnoPage: React.FC<EditarAlumnoPageProps> = ({ params }) => {
    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
    const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
    const [rol, setRol] = useRolesContext();
    const [roles, setRoles] = useState([]);
    const [user, setUser] = useUserContext();
    const { data: session, status } = useSession();
    const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();
    const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [genero, setGenero] = useState('');

    const [editedAlumno, setEditedAlumno] = useState({
        legajo: '',
        nombre: '',
        apellido: '',
        dni: '',
        cuil: '',
        fechaNacimiento: '',
        telefono: '',
        email: '',
        generoId: '',
        domicilioUsuario: {
            localidad: '',
            barrio: '',
            calle: '',
            numero: '',
        },
        roles: [],
    });

    useEffect(() => {
        fetchData();
    }, [session]);

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch(
                    `${Environment.getEndPoint(Environment.endPoint.roles)}${roles}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.accessToken}`,
                    },
                }
                );
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                setRoles(data);
            } catch (error) {
                console.error('Error al obtener empleados:', error);
            }
        };

        fetchRoles();
    }, [session]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetch(
                `${Environment.getEndPoint(Environment.endPoint.getUsuarioWhereRolIsAlumnoByInstitucion)}${params.id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.accessToken}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(data);
            setAlumnos(data.alumnos);
        } catch (error) {
            console.error('Error al obtener empleados:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAlumnos = alumnos.filter(alumno =>
        alumno.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alumno.apellido.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleConsultar = (alumno: Alumno) => {
        setSelectedRoles(alumno.Roles.map(role => role.id));
        setSelectedAlumno(alumno);
        setShowModal(true);
    };

    const handleEliminar = (alumno: Alumno) => {
        setSelectedAlumno(alumno);
        setShowConfirmModal(true);
    };

    const handleRoleChange = (roleId: number, isChecked: boolean) => {
        if (isChecked) {
            setSelectedRoles(prevRoles => [...prevRoles, roleId]);
        } else {
            setSelectedRoles(prevRoles => prevRoles.filter(id => id !== roleId));
        }
    };

    const handleConfirmDelete = async () => {
        try {
            if (!selectedAlumno || !selectedAlumno.id) {
                console.error('ID de alumno no válido:', selectedAlumno);
                return;
            }

            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}api/usuario/${selectedAlumno.id}`;
            console.log('URL de eliminación:', url);

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.accessToken}`,
                },
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                console.error('Error en la eliminación:', errorMessage);
                throw new Error(errorMessage || 'Error en la eliminación');
            }

            setAlumnos(alumnos.filter((alumno) => alumno.id !== selectedAlumno.id));
            setShowConfirmModal(false);
        } catch (error) {
            console.error('Error al eliminar el alumno:', error);
        }
    };

    const handleModificar = (alumno: Alumno) => {
        setSelectedRoles(alumno.Roles?.map(role => role.id) || []);
        setSelectedAlumno({
            ...alumno,
            Roles: alumno.Roles || [],
        });
        setEditedAlumno({
            legajo: alumno.legajo,
            nombre: alumno.nombre,
            apellido: alumno.apellido,
            dni: alumno.dni,
            cuil: alumno.cuil,
            fechaNacimiento: alumno.fechaNacimiento,
            telefono: alumno.telefono,
            email: alumno.email,
            generoId: alumno.generoId.toString(),
            domicilioUsuario: {
                localidad: alumno.domicilioUsuario?.localidad || '',
                barrio: alumno.domicilioUsuario?.barrio || '',
                calle: alumno.domicilioUsuario?.calle || '',
                numero: alumno.domicilioUsuario?.numero || '',
            },
            roles: alumno.Roles?.map(role => role.id) || [],
        });
        setGenero(alumno.generoId.toString());
        setShowEditModal(true);
    };

    const handleSave = () => {
        setShowSaveConfirmModal(true);
    };

    const handleConfirmSave = async () => {
        try {
            const response = await fetch(
                `${Environment.getEndPoint(Environment.endPoint.updateUsuarioById)}${selectedAlumno?.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.accessToken}`,
                    },
                    body: JSON.stringify({
                        legajo: editedAlumno.legajo,
                        nombre: editedAlumno.nombre,
                        apellido: editedAlumno.apellido,
                        dni: editedAlumno.dni,
                        cuil: editedAlumno.cuil,
                        fechaNacimiento: editedAlumno.fechaNacimiento,
                        telefono: editedAlumno.telefono,
                        email: editedAlumno.email,
                        generoId: parseInt(genero),
                        domicilio: {
                            localidad: editedAlumno.domicilioUsuario.localidad,
                            barrio: editedAlumno.domicilioUsuario.barrio,
                            calle: editedAlumno.domicilioUsuario.calle,
                            numero: editedAlumno.domicilioUsuario.numero,
                        },
                        institucionId: institucionSelected.id,
                        roles: selectedRoles,
                    }),
                },
            );
            const data = await response.json();
            console.log(data);

            if (!response.ok) {
                console.log(data)
                throw new Error(data);
            }

            const updatedResponse = await fetch(
                `${Environment.getEndPoint(Environment.endPoint.getUsuariosAllByIntitucion)}${institucionSelected.id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${session?.accessToken}`,
                    },
                }
            );
            const updatedData = await updatedResponse.json();

            setAlumnos(updatedData.usuarios);

            setShowEditModal(false);
            setShowSaveConfirmModal(false);
        } catch (error) {
            console.error('Error al actualizar empleado:', error);
        }
    };

    console.log(alumnos);
    console.log(selectedAlumno);
    return (
        <div className="p-3">
            <Row className="mb-3 justify-content-between align-items-center">
                <Col xs="auto">
                    <Link href={`/dashboard/${institucionSelected.id}/bienvenido`}>
                        <Button
                            variant="secondary"
                            className="responsive-button"
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
                <Col xs="auto">
                    <Link href={`/dashboard/${institucionSelected.id}/consultaUsuario`}>
                        <Button
                            variant="flat"
                            className="responsive-button"
                            style={{ backgroundColor: 'purple', color: 'white' }}
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
            </Row>

            <Form.Group controlId="formBuscar" className="mb-3">
                <Form.Control
                    type="text"
                    placeholder="Buscar por DNI, nombre o apellido..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </Form.Group>

            {loading ? (
                <div className="d-flex justify-content-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : (
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Legajo</th>
                            <th>Nombre</th>
                            <th>D.N.I</th>
                            <th>Telefono</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(filteredAlumnos) && filteredAlumnos.length > 0 ? (
                            filteredAlumnos.map((alumno) => (
                                <tr key={alumno.id}>
                                    <td>{alumno.legajo}</td>
                                    <td>{alumno.nombre} {alumno.apellido}</td>
                                    <td>{alumno.dni}</td>
                                    <td>{alumno.telefono}</td>
                                    <td>
                                        <Button variant="link" onClick={() => handleConsultar(alumno)} title="Consultar Alumno">
                                            <BsEye />
                                        </Button>
                                        <Button variant="link" onClick={() => handleModificar(alumno)} title="Modificar Alumno">
                                            <BsPencil />
                                        </Button>
                                        <Button variant="link" onClick={() => handleEliminar(alumno)} title="Eliminar Alumno">
                                            <BsTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center">No hay alumnos disponibles</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            )}

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Detalles del Alumno</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedAlumno && (
                        <>
                            <p><strong>Legajo:</strong> {selectedAlumno.legajo}</p>
                            <p><strong>Fecha de ingreso:</strong> {new Date(selectedAlumno.fecha_ingreso).toLocaleDateString()}</p>
                            <p><strong>Fecha de egreso:</strong> {selectedAlumno.fecha_egreso ? new Date(selectedAlumno.fecha_egreso).toLocaleDateString() : 'N/A'}</p>
                            <p><strong>Nombre:</strong> {selectedAlumno.nombre}</p>
                            <p><strong>Apellido:</strong> {selectedAlumno.apellido}</p>
                            <p><strong>DNI:</strong> {selectedAlumno.dni}</p>
                            <p><strong>Genero:</strong> {selectedAlumno.generoId}</p>
                            <p><strong>CUIL:</strong> {selectedAlumno.cuil}</p>
                            <p><strong>Fecha de nacimiento:</strong> {new Date(selectedAlumno.fechaNacimiento).toLocaleDateString()}</p>
                            <p><strong>Teléfono:</strong> {selectedAlumno.telefono || 'No disponible'}</p>
                            <p><strong>Localidad:</strong> {selectedAlumno.domicilioUsuario ? selectedAlumno.domicilioUsuario.localidad : 'No disponible'}</p>
                            <p><strong>Barrio:</strong> {selectedAlumno.domicilioUsuario ? selectedAlumno.domicilioUsuario.barrio : 'No disponible'}</p>
                            <p><strong>Calle:</strong> {selectedAlumno.domicilioUsuario ? selectedAlumno.domicilioUsuario.calle : 'No disponible'}</p>
                            <p><strong>Número:</strong> {selectedAlumno.domicilioUsuario ? selectedAlumno.domicilioUsuario.numero : 'No disponible'}</p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Cerrar</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Editar Alumno</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedAlumno && (
                        <Form>
                            <Form.Group controlId="formLegajo" className="mb-3">
                                <Form.Label>Legajo</Form.Label>
                                <Form.Control
                                    type="text"
                                    defaultValue={selectedAlumno.legajo}
                                    onChange={(e) => setEditedAlumno({ ...editedAlumno, legajo: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="formNombre" className="mb-3">
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control
                                    type="text"
                                    defaultValue={selectedAlumno.nombre}
                                    onChange={(e) => setEditedAlumno({ ...editedAlumno, nombre: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="formApellido" className="mb-3">
                                <Form.Label>Apellido</Form.Label>
                                <Form.Control
                                    type="text"
                                    defaultValue={selectedAlumno.apellido}
                                    onChange={(e) => setEditedAlumno({ ...editedAlumno, apellido: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="formDni" className="mb-3">
                                <Form.Label>D.N.I:</Form.Label>
                                <Form.Control
                                    type="text"
                                    defaultValue={selectedAlumno.dni}
                                    onChange={(e) => setEditedAlumno({ ...editedAlumno, dni: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="formGenero" className="mb-3">
                                <Form.Label>Genero</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        as="select"
                                        value={genero}
                                        onChange={(e) => setGenero(e.target.value)}
                                        autoComplete='off'
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
                            <Form.Group controlId="formCuil" className="mb-3">
                                <Form.Label>C.U.I.L:</Form.Label>
                                <Form.Control
                                    type="text"
                                    defaultValue={selectedAlumno.cuil}
                                    onChange={(e) => setEditedAlumno({ ...editedAlumno, cuil: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="formFechaNacimiento" className="mb-3">
                                <Form.Label>Fecha de Nacimiento</Form.Label>
                                <Form.Control
                                    type="date"
                                    defaultValue={selectedAlumno.fechaNacimiento}
                                    onChange={(e) => setEditedAlumno({ ...editedAlumno, fechaNacimiento: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="formTelefono" className="mb-3">
                                <Form.Label>Teléfono</Form.Label>
                                <Form.Control
                                    type="text"
                                    defaultValue={selectedAlumno.telefono}
                                    onChange={(e) => setEditedAlumno({ ...editedAlumno, telefono: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="formEmail" className="mb-3">
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    defaultValue={selectedAlumno.email}
                                    onChange={(e) => setEditedAlumno({ ...editedAlumno, email: e.target.value })}
                                />
                            </Form.Group>
                            <Form.Group controlId="formLocalidad" className="mb-3">
                                <Form.Label>Localidad</Form.Label>
                                <Form.Control
                                    type="text"
                                    defaultValue={selectedAlumno.domicilioUsuario ? selectedAlumno.domicilioUsuario.localidad : ''}
                                    onChange={(e) => setEditedAlumno({
                                        ...editedAlumno,
                                        domicilioUsuario: {
                                            ...editedAlumno.domicilioUsuario,
                                            localidad: e.target.value,
                                        },
                                    })}
                                />
                            </Form.Group>
                            <Form.Group controlId="formBarrio" className="mb-3">
                                <Form.Label>Barrio</Form.Label>
                                <Form.Control
                                    type="text"
                                    defaultValue={selectedAlumno.domicilioUsuario ? selectedAlumno.domicilioUsuario.barrio : ''}
                                    onChange={(e) => setEditedAlumno({
                                        ...editedAlumno,
                                        domicilioUsuario: {
                                            ...editedAlumno.domicilioUsuario,
                                            barrio: e.target.value,
                                        },
                                    })}
                                />
                            </Form.Group>
                            <Form.Group controlId="formCalle" className="mb-3">
                                <Form.Label>Calle</Form.Label>
                                <Form.Control
                                    type="text"
                                    defaultValue={selectedAlumno.domicilioUsuario ? selectedAlumno.domicilioUsuario.calle : ''}
                                    onChange={(e) => setEditedAlumno({
                                        ...editedAlumno,
                                        domicilioUsuario: {
                                            ...editedAlumno.domicilioUsuario,
                                            calle: e.target.value,
                                        },
                                    })}
                                />
                            </Form.Group>
                            <Form.Group controlId="formNumero" className="mb-3">
                                <Form.Label>Numeración de la calle</Form.Label>
                                <Form.Control
                                    type="text"
                                    defaultValue={selectedAlumno.domicilioUsuario ? selectedAlumno.domicilioUsuario.numero : ''}
                                    onChange={(e) => setEditedAlumno({
                                        ...editedAlumno,
                                        domicilioUsuario: {
                                            ...editedAlumno.domicilioUsuario,
                                            numero: e.target.value,
                                        },
                                    })}
                                />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSave}>Guardar</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showSaveConfirmModal} onHide={() => setShowSaveConfirmModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar cambios</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro de que quieres guardar los cambios?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSaveConfirmModal(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={handleConfirmSave}>Confirmar</Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro de que quieres eliminar a este alumno?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>No</Button>
                    <Button variant="danger" onClick={handleConfirmDelete}>Sí, eliminar</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default EditarAlumnoPage;