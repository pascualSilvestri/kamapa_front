'use client';
import React, { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import { BsEye, BsPencil, BsTrash } from 'react-icons/bs';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Roles, User } from '../../../../model/types';
import { autorizeNivel, autorizeRol } from '../../../../utils/autorizacionPorRoles';
import { Environment } from 'utils/EnviromenManager';
import { useInstitucionSelectedContext, useRolesContext, useUserContext } from 'context/userContext';

const EditarAlumnoPage = ({ params }: { params: { id: string } }) => {
    const [empleados, setEmpleados] = useState([]);
    const [selectedEmpleado, setSelectedEmpleado] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
    const [rol, setRol] = useRolesContext();
    const [roles, setRoles] = useState([]);
    const [user, setUser] = useUserContext();
    const { data: session, status } = useSession();
    const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');


    // Estado local para el formulario de edición
    const [editedEmpleado, setEditedEmpleado] = useState({
        legajo: '',
        nombre: '',
        apellido: '',
        dni: '',
        cuil: '',
        fechaNacimiento: '',
        telefono: '',
        email: '',
        domicilioUsuario: {
            localidad: '',
            barrio: '',
            calle: '',
            numero: '',
        },
        roles: [],
    });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // FUNCIONES PARA EL Search
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    useEffect(() => {
        
        fetchData();
    }, [session]);

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await fetch(
                    `${Environment.getEndPoint(Environment.endPoint.roles)}${roles}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.accessToken}`,
                    },
                }
                );
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }


                const data = await response.json();

                setRoles(data);
            } catch (error) {
                console.error('Error al obtener empleados:', error.message);
            }
        };

        fetchRoles();
    }, [session]);



    const fetchData = async () => {
        try {
            const response = await fetch(
                `${Environment.getEndPoint(Environment.endPoint.getUsuarioWhereRolIsAlumnoByInstitucion)}${params.id}`,
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.accessToken}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log(data);
            setEmpleados(data.usuarios);
        } catch (error) {
            console.error('Error al obtener empleados:', error.message);
        }
    };


    const filteredEmpleados = empleados.filter(empleado =>
        empleado.dni.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empleado.apellido.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };



    const handleConsultar = (empleado) => {

        setSelectedRoles(empleado.Roles.map(role => role.id));
        setSelectedEmpleado(empleado);
        setShowModal(true);
    };

    const handleEliminar = (empleado) => {
        setSelectedEmpleado(empleado);
        setShowConfirmModal(true);
    };


    // Función para manejar el cambio en los checkboxes
    const handleRoleChange = (roleId, isChecked) => {
        if (isChecked) {
            setSelectedRoles(prevRoles => [...prevRoles, roleId]);
        } else {
            setSelectedRoles(prevRoles => prevRoles.filter(id => id !== roleId));
        }
    };

    const handleConfirmDelete = async () => {
        try {
            if (!selectedEmpleado?.id) {
                console.error('ID de empleado no válido:', selectedEmpleado);
                return;
            }

            const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}api/usuario/${selectedEmpleado.id}`;
            console.log('URL de eliminación:', url);

            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.accessToken}`,
                },
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                console.error('Error en la eliminación:', errorMessage);
                throw new Error(errorMessage || 'Error en la eliminación');
            }

            setEmpleados(empleados.filter((emp) => emp.id !== selectedEmpleado.id));
            setShowConfirmModal(false);
        } catch (error) {
            console.error('Error al eliminar el empleado:', error);
        }
    };



    const handleModificar = (empleado) => {
        setSelectedRoles(empleado.Roles?.map(role => role.id) || []);
        setSelectedEmpleado({
            ...empleado,
            Roles: empleado.Roles || [],  // Asegúrate de que Roles sea un array vacío si no está definido
        });
        setEditedEmpleado({
            legajo: empleado.legajo,
            nombre: empleado.nombre,
            apellido: empleado.apellido,
            dni: empleado.dni,
            cuil: empleado.cuil,
            fechaNacimiento: empleado.fechaNacimiento,
            telefono: empleado.telefono,
            email: empleado.email,
            domicilioUsuario: {
                localidad: empleado.domicilioUsuario?.localidad || '',
                barrio: empleado.domicilioUsuario?.barrio || '',
                calle: empleado.domicilioUsuario?.calle || '',
                numero: empleado.domicilioUsuario?.numero || '',
            },
            roles: empleado.Roles?.map(role => role.id) || [],
        });
        setShowEditModal(true);
    };


    const handleSave = () => {
        setShowSaveConfirmModal(true);
    };

    const handleConfirmSave = async (e) => {
        try {
            // Envíar los datos del formulario de edición al servidor
            // e.preventDefault();

            const response = await fetch(
                `${Environment.getEndPoint(Environment.endPoint.updateUsuarioById)}${selectedEmpleado.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        legajo: editedEmpleado.legajo,
                        nombre: editedEmpleado.nombre,
                        apellido: editedEmpleado.apellido,
                        dni: editedEmpleado.dni,
                        cuil: editedEmpleado.cuil,
                        fechaNacimiento: editedEmpleado.fechaNacimiento,
                        telefono: editedEmpleado.telefono,
                        email: editedEmpleado.email,
                        domicilio: {
                            localidad: editedEmpleado.domicilioUsuario.localidad,
                            barrio: editedEmpleado.domicilioUsuario.barrio,
                            calle: editedEmpleado.domicilioUsuario.calle,
                            numero: editedEmpleado.domicilioUsuario.numero,
                        },
                        institucionId: institucionSelected.id,
                        roles: selectedRoles,
                    }),
                },
            );
            const data = await response.json();
            console.log(data);

            if (!response.ok) {
                ;
                console.log(data)
                throw new Error(data);
            }

            const updatedResponse = await fetch(
                `${Environment.getEndPoint(Environment.endPoint.getUsuariosAllByIntitucion)}${institucionSelected.id}`,
            );
            const updatedData = await updatedResponse.json();

            setEmpleados(updatedData.usuarios);

            setShowEditModal(false);
            setShowSaveConfirmModal(false);
        } catch (error) {
            console.error('Error al actualizar empleado:', error);
        }
    };
    console.log(empleados)

    return (
        <div className='p-3'>
            <Row className='mb-3  justify-content-center'>
                <Col>
                    <Link href={`/dashboard/${institucionSelected.id}/bienvenido`}>
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
                <Col>
                    <Link href={`/dashboard/${autorizeRol(autorizeNivel(rol))}/curso_alumno`}>
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
            </Row>

            {/* //buscador */}
            <Form.Group controlId='formBuscar'>
                <Form.Control
                    type='text'
                    placeholder='Buscar por DNI, nombre o apellido...'
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </Form.Group>


            <Table
                striped
                bordered
                hover>
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
                    {Array.isArray(filteredEmpleados) && filteredEmpleados.length > 0 ? (
                        filteredEmpleados.map((empleado) => (
                            <tr key={empleado.id}>
                                <td>{empleado?.legajo}</td>
                                <td>
                                    {empleado?.nombre} {empleado?.apellido}
                                </td>
                                <td>
                                    {empleado?.dni}
                                </td>
                                <td>
                                    {empleado?.telefono}
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
                                        onClick={() => handleEliminar(empleado)}
                                        title='Eliminar Empleado'>
                                        <BsTrash />
                                    </Button>

                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4}>No hay empleados disponibles</td>
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
                        <p>
                            <p>Legajo: {selectedEmpleado?.legajo}</p>
                            <p>
                                Fecha de ingreso:{' '}
                                {new Date(
                                    selectedEmpleado?.fecha_ingreso,
                                ).toLocaleDateString()}
                            </p>
                            <p>
                                Fecha de egreso:{' '}
                                {selectedEmpleado?.fecha_egreso
                                    ? new Date(
                                        selectedEmpleado?.fecha_egreso,
                                    ).toLocaleDateString()
                                    : 'N/A'}
                            </p>
                            <p>Nombre: {selectedEmpleado?.nombre}</p>
                            <p>Apellido: {selectedEmpleado?.apellido}</p>
                            <p>DNI: {selectedEmpleado?.dni}</p>
                            <p>CUIL: {selectedEmpleado?.cuil}</p>
                            <p>
                                Fecha de nacimiento:{' '}
                                {new Date(
                                    selectedEmpleado?.fechaNacimiento,
                                ).toLocaleDateString()}
                            </p>
                            <p>Teléfono: {selectedEmpleado?.telefono}</p>
                            <p>Teléfono: {selectedEmpleado?.telefono ?? 'No disponible'}</p>
                            <p>Provincia: {selectedEmpleado?.domocilioUsuario?.provincia ?? 'No disponible'}</p>
                            <p>Domicilio: {selectedEmpleado?.domocilioUsuario?.domicilio ?? 'No disponible'}</p>
                            <p>Localidad: {selectedEmpleado?.domocilioUsuario?.localidad ?? 'No disponible'}</p>
                            <p>Barrio: {selectedEmpleado?.domocilioUsuario?.barrio ?? 'No disponible'}</p>
                            <p>Calle: {selectedEmpleado?.domocilioUsuario?.calle ?? 'No disponible'}</p>
                            <p>Número: {selectedEmpleado?.domocilioUsuario?.numero ?? 'No disponible'}</p>
                            <p>
                                Estado:{' '}
                                {selectedEmpleado?.is_active
                                    ? 'Activo'
                                    : 'Inactivo'}
                            </p>
                        </p>
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
                                    defaultValue={selectedEmpleado?.legajo}
                                    onChange={(e) => { editedEmpleado.legajo = e.target.value }}
                                />
                            </Form.Group>

                            <Form.Group controlId='formNombre'>
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control
                                    type='text'
                                    defaultValue={selectedEmpleado?.nombre}
                                    onChange={(e) => { editedEmpleado.nombre = e.target.value }}
                                />
                            </Form.Group>

                            <Form.Group controlId='formApellido'>
                                <Form.Label>Apellido</Form.Label>
                                <Form.Control
                                    type='text'
                                    defaultValue={selectedEmpleado?.apellido}
                                    onChange={(e) => { editedEmpleado.apellido = e.target.value }}
                                />
                            </Form.Group>

                            <Form.Group controlId='formDni'>
                                <Form.Label>D.N.I:</Form.Label>
                                <Form.Control
                                    type='text'
                                    defaultValue={selectedEmpleado?.dni}
                                    onChange={(e) => { editedEmpleado.dni = e.target.value }}
                                />
                            </Form.Group>

                            <Form.Group controlId='formCuil'>
                                <Form.Label>C.U.I.L:</Form.Label>
                                <Form.Control
                                    type='text'
                                    defaultValue={selectedEmpleado?.cuil}
                                    onChange={(e) => { editedEmpleado.cuil = e.target.value }}
                                />
                            </Form.Group>

                            <Form.Group controlId='formFechaNacimiento'>
                                <Form.Label>Fecha de Nacimiento</Form.Label>
                                <Form.Control
                                    type='date'
                                    defaultValue={selectedEmpleado?.fechaNacimiento}
                                    onChange={(e) => { editedEmpleado.fechaNacimiento = e.target.value }}
                                />
                            </Form.Group>

                            <Form.Group controlId='formTelefono'>
                                <Form.Label>Telefono</Form.Label>
                                <Form.Control
                                    type='telefono'
                                    defaultValue={selectedEmpleado?.telefono}
                                    onChange={(e) => { editedEmpleado.telefono = e.target.value }}
                                />
                            </Form.Group>

                            <Form.Group controlId='formEmail'>
                                <Form.Label>Email</Form.Label>
                                <Form.Control
                                    type='email'
                                    defaultValue={selectedEmpleado?.email}
                                    onChange={(e) => { editedEmpleado.email = e.target.value }}
                                />
                            </Form.Group>

                            <Form.Group controlId='formLocalidad'>
                                <Form.Label>Localidad</Form.Label>
                                <Form.Control
                                    type='text'
                                    defaultValue={selectedEmpleado?.domicilioUsuario?.localidad || ''}
                                    onChange={(e) => {
                                        setEditedEmpleado((prevState) => ({
                                            ...prevState,
                                            domicilioUsuario: {
                                                ...prevState.domicilioUsuario,
                                                localidad: e.target.value,
                                            },
                                        }));
                                    }}
                                />
                            </Form.Group>


                            <Form.Group controlId='formBarrio'>
                                <Form.Label>Barrio</Form.Label>
                                <Form.Control
                                    type='text'
                                    defaultValue={selectedEmpleado?.domicilioUsuario?.barrio || ''}
                                    onChange={(e) => {
                                        setEditedEmpleado((prevState) => ({
                                            ...prevState,
                                            domicilioUsuario: {
                                                ...prevState.domicilioUsuario,
                                                barrio: e.target.value,
                                            },
                                        }));
                                    }}
                                />
                            </Form.Group>

                            <Form.Group controlId='formCalle'>
                                <Form.Label>Calle</Form.Label>
                                <Form.Control
                                    type='text'
                                    defaultValue={selectedEmpleado?.domicilioUsuario?.calle || ''}
                                    onChange={(e) => {
                                        setEditedEmpleado((prevState) => ({
                                            ...prevState,
                                            domicilioUsuario: {
                                                ...prevState.domicilioUsuario,
                                                calle: e.target.value,
                                            },
                                        }));
                                    }}
                                />
                            </Form.Group>

                            <Form.Group controlId='formNumero'>
                                <Form.Label>Numeracion de la calle</Form.Label>
                                <Form.Control
                                    type='text'
                                    defaultValue={selectedEmpleado?.domicilioUsuario?.numero || ''}
                                    onChange={(e) => {
                                        setEditedEmpleado((prevState) => ({
                                            ...prevState,
                                            domicilioUsuario: {
                                                ...prevState.domicilioUsuario,
                                                numero: e.target.value,
                                            },
                                        }));
                                    }}
                                />
                            </Form.Group>

                            <Form.Group controlId='formRoles'>
                                <Form.Label>Roles</Form.Label>
                                {roles.map((rol) => {
                                    const isChecked = selectedEmpleado?.Roles?.some((r) => r.id === rol.id);
                                    return (
                                        <Form.Check
                                            key={rol.id}
                                            type="checkbox"
                                            id={rol.id}
                                            label={rol.name}
                                            defaultChecked={isChecked}
                                            onChange={(e) => handleRoleChange(rol.id, e.target.checked)}
                                        />
                                    )
                                })}
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
                        variant='purple'
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
                        variant='purple'
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

export default EditarAlumnoPage;

