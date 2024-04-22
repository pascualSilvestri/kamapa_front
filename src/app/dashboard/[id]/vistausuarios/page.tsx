'use client';
import { useState, useEffect } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import { BsEye, BsPencil, BsTrash } from 'react-icons/bs';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Roles, User } from '../../../../model/types';
import { autorizeNivel, autorizeRol } from '../../../../utils/autorizacionPorRoles';
import { Environment } from 'utils/apiHelpers';
import { useInstitucionSelectedContext, useUserContext } from 'context/userContext';

const VistaEmpleadosPage = () => {
    const [empleados, setEmpleados] = useState([]);
    const [selectedEmpleado, setSelectedEmpleado] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false);
    const [rol, setRol] = useState<Roles[]>([]);
    const [roles, setRoles] = useState([]);
    const [user, setUser] = useState<User>({
        nombre: '',
        apellido: '',
        legajo: '',
        telefono: '',
        Roles: rol
    });
    const { data: session, status } = useSession();
    const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();

    useEffect(() => {

        if (session) {
            setUser({
                nombre: session.user.nombre,
                apellido: session.user.apellido,
                legajo: session.user.legajo,
                telefono: session.user.telefono,
                Roles: session.user.Roles
            });
            setRol(session.user.Roles);
        }
    }, [session]);

     ///////////////////////////////////////////////////////////////////////////////////////////////////////
    /// Obtener los roles de la base de datos para mostrarlos en los checkbox
    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}api/rols`)
            .then(response => response.json())
            .then((data: Roles[]) => {
                setRoles(data);
            })
            .catch(error => console.error('Error fetching provinces:', error));
    }, [rol]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `${Environment.getEndPoint(Environment.endPoint.getUsuariosAllByIntitucion)}${institucionSelected.id}`, {
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

        fetchData();
    }, [session]);

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
                `${process.env.NEXT_PUBLIC_BACKEND_URL}api/usuario/${selectedEmpleado}`,
                {
                    method: 'DELETE',
                },
            );

            if (!response.ok) {
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

    const handleConfirmSave = async (e) => {
        e.preventDefault();
        console.log(selectedEmpleado)
        try {
            const legajo = (document.getElementById('formLegajo') as HTMLInputElement)?.value;
            const nombre = (document.getElementById('formNombre') as HTMLInputElement)?.value;
            const apellido = (document.getElementById('formApellido') as HTMLInputElement)?.value;
            const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')) as HTMLInputElement[];
            const roles = checkboxes.map(input => input.id);

            const updatedEmpleado = {
                
                usuario: {
                    usuarioId: selectedEmpleado.id,
                    legajo: legajo,
                    nombre: nombre,
                    apellido: apellido,
                    roles: roles,
                },
            };

            console.log(updatedEmpleado);

            const response = await fetch(
                `${Environment.getEndPoint(Environment.endPoint.updateUsuarioById)}${selectedEmpleado.id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedEmpleado),
                },
            );

            if (!response.ok) {
                throw new Error('Error en la modificación');
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
                    <Link href={`/dashboard/${autorizeRol(autorizeNivel(rol))}`}>
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
                    <Link href={`/dashboard/${autorizeRol(autorizeNivel(rol))}/regUsuario`}>
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
                                <td>{empleado?.legajo}</td>
                                <td>
                                    {empleado?.nombre} {empleado?.apellido}
                                </td>
                                <td>
                                       { empleado?.telefono}
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
                        <>
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
                            <p>
                                Estado:{' '}
                                {selectedEmpleado?.is_active
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
                                    defaultValue={selectedEmpleado?.legajo}
                                />
                            </Form.Group>

                            <Form.Group controlId='formNombre'>
                                <Form.Label>Nombre</Form.Label>
                                <Form.Control
                                    type='text'
                                    defaultValue={selectedEmpleado?.nombre}
                                />
                            </Form.Group>

                            <Form.Group controlId='formApellido'>
                                <Form.Label>Apellido</Form.Label>
                                <Form.Control
                                    type='text'
                                    defaultValue={selectedEmpleado?.apellido}
                                />
                            </Form.Group>

                            <Form.Group controlId='formRoles'>
                                <Form.Label>Roles</Form.Label>
                                {roles.map((rol) => {
                                    console.log(selectedEmpleado)
                                    const isChecked = selectedEmpleado.Roles.some((r) => r.id === rol.id);
                                    return (
                                        <Form.Check
                                            key={rol.id}
                                            type="checkbox"
                                            id={rol.id}
                                            label={rol.name}
                                            defaultChecked={isChecked}
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

