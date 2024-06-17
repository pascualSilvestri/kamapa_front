'use client'
import { useState, useEffect } from 'react';
import { BsChevronDown } from 'react-icons/bs';
import { Form, Button, Modal, Container, Row, Col } from 'react-bootstrap';
import { User, UserFormData } from '../../../../model/types';
import { autorizeNivel, autorizeRol } from '../../../../utils/autorizacionPorRoles';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useInstitucionSelectedContext, useRolesContext, useUserContext } from 'context/userContext';
import { Environment } from 'utils/EnviromenManager';

interface Provincia {
    id: string;
    provincia: string;
}

interface Role {
    id: string;
    name: string;
    checked: boolean;
}

interface RolesMap {
    [key: string]: Role;
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
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
    const [roles, setRoles] = useState<RolesMap>({});
    const [rol, setRol] = useRolesContext();
    const [user, setUser] = useUserContext();
    const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();

    console.log(session);

    useEffect(() => {
        fetch(`${Environment.getEndPoint(Environment.endPoint.provincias)}`)
            .then(response => response.json())
            .then((data: Provincia[]) => {
                setProvincias(data);
            })
            .catch(error => console.error('Error fetching provinces:', error));
    }, []);

    useEffect(() => {
        fetch(`${Environment.getEndPoint(Environment.endPoint.roles)}`)
            .then(response => response.json())
            .then((data: Role[]) => {
                const rolesObj = data.reduce((obj, rol) => {
                    obj[rol.name] = { ...rol, checked: rol.name === 'Alumno' };
                    return obj;
                }, {} as RolesMap);

                setRoles(rolesObj);
                setSelectedRoleIds(data.filter(role => role.name === 'Alumno').map(role => role.id));
            })
            .catch(error => console.error('Error fetching roles:', error));
    }, [rol]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (formValid) {
            const formData: UserFormData = {
                usuario: {
                    legajo: legajo,
                    matricula: matriculaProfesional,
                    fechaIngreso: new Date().toISOString(),
                    fechaEgreso: null,
                    nombre: nombre,
                    apellido: apellido,
                    dni: dni,
                    cuil: cuil,
                    fechaNacimiento: fechaNacimiento,
                    telefono: telefono,
                    email: email,
                    is_active: true,
                    create_for: session.user.nombre + ' ' + session.user.apellido,
                    update_for: session.user.nombre + ' ' + session.user.apellido,
                    password: dni,
                    institucionId: institucionSelected.id,
                },
                rols: selectedRoleIds,
                domicilio: {
                    calle: calle,
                    numero: numero,
                    barrio: barrio,
                    localidad: localidad,
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
                console.log(await response.json());

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

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        limpiarCampos(); // Limpia los campos del formulario
    };

    const regexValidations = {
        nombre: /^[a-zA-ZñÑ\s]+$/,
        apellido: /^[a-zA-ZñÑ\s]+$/,
        dni: /^\d{8}$/,
        cuil: /^\d{2}-\d{8}-\d{1}$/,
        telefono: /^\d{10,11}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        legajo: /^\d+$/,
        calle: /^[a-zA-ZñÑ\s]+$/,
        numero: /^\d+$/,
        barrio: /^[a-zA-ZñÑ\s]+$/,
        localidad: /^[a-zA-ZñÑ\s]+$/,
    };

    useEffect(() => {
        const validNombre = regexValidations.nombre.test(nombre);
        const validApellido = regexValidations.apellido.test(apellido);
        const validDni = regexValidations.dni.test(dni);
        const validCuil = regexValidations.cuil.test(cuil);
        const validTelefono = regexValidations.telefono.test(telefono);
        const validEmail = regexValidations.email.test(email);
        const validLegajo = regexValidations.legajo.test(legajo);
        const validCalle = regexValidations.calle.test(calle);
        const validNumero = regexValidations.numero.test(numero);
        const validBarrio = regexValidations.barrio.test(barrio);
        const validLocalidad = regexValidations.localidad.test(localidad);
        const validRoles = roles.Alumno?.checked;

        if (
            validNombre &&
            validApellido &&
            validDni &&
            validCuil &&
            validTelefono &&
            validEmail &&
            validLegajo &&
            validCalle &&
            validNumero &&
            validBarrio &&
            validLocalidad &&
            provinciaSeleccionada &&
            validRoles
        ) {
            setFormValid(true);
        } else {
            setFormValid(false);
        }
    }, [
        nombre,
        apellido,
        dni,
        cuil,
        telefono,
        email,
        legajo,
        calle,
        numero,
        barrio,
        localidad,
        provinciaSeleccionada,
        roles,
        regexValidations.nombre,
        regexValidations.apellido,
        regexValidations.dni,
        regexValidations.cuil,
        regexValidations.telefono,
        regexValidations.email,
        regexValidations.legajo,
        regexValidations.calle,
        regexValidations.numero,
        regexValidations.barrio,
        regexValidations.localidad,
        roles.Alumno?.checked,
    ]);

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
            ...roles,
            Alumno: { ...roles.Alumno, checked: true },
        });
        setSelectedRoleIds([roles.Alumno.id]);
    };

    return (
        <Container>
            <Row className="justify-content-md-center">
                <Col md={6}>
                    <h1>Registro de Usuarios</h1>
                    <h3>(Campos Obligatorios *)</h3>
                    <hr />
                    <Form onSubmit={handleSubmit}>
                        <Form.Group>
                            <h3>Datos del Alumno</h3>
                        </Form.Group>
                        <hr />
                        <Form.Group controlId="nombre">
                            <Form.Label>Nombre *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                autoComplete='off'
                                isInvalid={!regexValidations.nombre.test(nombre)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Ingrese un nombre válido.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="apellido">
                            <Form.Label>Apellido *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Apellido"
                                value={apellido}
                                onChange={(e) => setApellido(e.target.value)}
                                autoComplete='off'
                                isInvalid={!regexValidations.apellido.test(apellido)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Ingrese un apellido válido.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="dni">
                            <Form.Label>DNI *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="DNI"
                                value={dni}
                                onChange={(e) => setDni(e.target.value)}
                                autoComplete='off'
                                isInvalid={!regexValidations.dni.test(dni)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Ingrese un DNI válido.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="cuil">
                            <Form.Label>CUIL *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="CUIL"
                                value={cuil}
                                onChange={(e) => setCuil(e.target.value)}
                                autoComplete='off'
                                isInvalid={!regexValidations.cuil.test(cuil)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Ingrese un CUIL válido Ejemplo( 20-00000000-0).
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="fechaNacimiento">
                            <Form.Label>Fecha de Nacimiento *</Form.Label>
                            <Form.Control
                                type="date"
                                value={fechaNacimiento}
                                onChange={(e) => setFechaNacimiento(e.target.value)}
                                autoComplete='off'
                            />
                        </Form.Group>
                        <hr />
                        <Form.Group>
                            <h3>Datos de Contacto del Alumno</h3>
                        </Form.Group>
                        <hr />
                        <Form.Group controlId="calle">
                            <Form.Label>Calle *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Calle"
                                value={calle}
                                onChange={(e) => setCalle(e.target.value)}
                                autoComplete='off'
                                isInvalid={!regexValidations.calle.test(calle)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Ingrese una calle válida.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="numero">
                            <Form.Label>Número *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Número"
                                value={numero}
                                onChange={(e) => setNumero(e.target.value)}
                                autoComplete='off'
                                isInvalid={!regexValidations.numero.test(numero)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Ingrese un número válido.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="barrio">
                            <Form.Label>Barrio *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Barrio"
                                value={barrio}
                                onChange={(e) => setBarrio(e.target.value)}
                                autoComplete='off'
                                isInvalid={!regexValidations.barrio.test(barrio)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Ingrese un barrio válido.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="localidad">
                            <Form.Label>Localidad *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Localidad"
                                value={localidad}
                                onChange={(e) => setLocalidad(e.target.value)}
                                autoComplete='off'
                                isInvalid={!regexValidations.localidad.test(localidad)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Ingrese una localidad válida.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="provincia">
                            <Form.Label>Provincia *</Form.Label>
                            <Form.Control
                                as="select"
                                value={provinciaSeleccionada}
                                onChange={(e) => setProvinciaSeleccionada(e.target.value)}
                                autoComplete='off'
                                isInvalid={!provinciaSeleccionada}
                            >
                                <option value="">Seleccionar provincia</option>
                                {provincias.map((provincia) => (
                                    <option key={provincia.id} value={provincia.id}>
                                        {provincia.provincia}
                                    </option>
                                ))}
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">
                                Seleccione una provincia.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="telefono">
                            <Form.Label>Teléfono *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Teléfono"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                autoComplete='off'
                                isInvalid={!regexValidations.telefono.test(telefono)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Ingrese un teléfono válido.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="email">
                            <Form.Label>Email *</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete='off'
                                isInvalid={!regexValidations.email.test(email)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Ingrese un email válido.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <hr />
                        <Form.Group>
                            <h3>Datos Institucionales del Alumno</h3>
                        </Form.Group>
                        <hr />
                        <Form.Group controlId="legajo">
                            <Form.Label>Legajo *</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Legajo"
                                value={legajo}
                                onChange={(e) => setLegajo(e.target.value)}
                                autoComplete='off'
                                isInvalid={!regexValidations.legajo.test(legajo)}
                            />
                            <Form.Control.Feedback type="invalid">
                                Ingrese un legajo válido.
                            </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="roles">
                            <Form.Label>Roles *</Form.Label>
                            <div>
                                {Object.keys(roles).filter((key) => roles[key].name === 'Alumno').map((key) => (
                                    <Form.Check
                                        key={roles[key].id}
                                        type="checkbox"
                                        id={`role-${roles[key].id}`}
                                        label={roles[key].name}
                                        checked={roles[key].checked}
                                        onChange={() => {
                                            const updatedRoles = {
                                                ...roles,
                                                [key]: { ...roles[key], checked: !roles[key].checked },
                                            };
                                            setRoles(updatedRoles);
                                            setSelectedRoleIds(
                                                Object.values(updatedRoles)
                                                    .filter((role) => role.checked)
                                                    .map((role) => role.id)
                                            );
                                        }}
                                    />
                                ))}
                            </div>
                        </Form.Group>
                        <hr />
                        <Form.Group className="d-flex justify-content-center">
                            <div className='me-1'>
                                <Link href={`/dashboard/${institucionSelected.id}/consultaUsuario`}>
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
                </Col>
            </Row>
            <Modal show={showSuccessModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Registro exitoso</Modal.Title>
                </Modal.Header>
                <Modal.Body>{successMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="success" onClick={handleCloseModal}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showErrorModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Error en el registro</Modal.Title>
                </Modal.Header>
                <Modal.Body>{errorMessage}</Modal.Body>
                <Modal.Footer>
                    <Button variant="danger" onClick={handleCloseModal}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default RegAlumno;
