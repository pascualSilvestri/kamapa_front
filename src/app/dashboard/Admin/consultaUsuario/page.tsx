'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Environment } from '../../../../utils/EnviromenManager';
import { useInstitucionSelectedContext } from 'context/userContext';
import Modal from '../../../components/ModalConsultaUser'; // Asegúrate de importar tu componente Modal
import { Form } from 'react-bootstrap';
import { BsChevronDown } from 'react-icons/bs';
import { Institucion, Roles } from 'model/types';

const ConsultaUsuarioPage = () => {
    const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();
    const [showModal, setShowModal] = useState(false); // Estado para manejar la visibilidad del modal
    const [selectedInstitution, setSelectedInstitution] = useState(''); // Estado para la institución seleccionada
    const [selectedRoles, setSelectedRoles] = useState([]); // Estado para los roles seleccionados
    const [instituciones, setInstituciones] = useState<Institucion[]>([]);
    const [roles, setRoles] = useState<Roles[]>([]);

    const router = useRouter();
    const [dni, setDNI] = useState('');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getInstituciones();
        getRoles();
    }, []);

    async function getRoles() {
        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.roles)}`);
            if (!response.ok) {
                throw new Error('Instituciones no encontradas');
            }

            const roles = await response.json();
            console.log(roles)
            setRoles(roles);
        } catch (error) {
            console.error('Error al buscar instituciones:', error);
            setRoles([]);
        }
    }

    async function getInstituciones() {
        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.institucion)}`);
            if (!response.ok) {
                throw new Error('Instituciones no encontradas');
            }

            const instituciones = await response.json();
            console.log(instituciones)
            setInstituciones(instituciones);
        } catch (error) {
            console.error('Error al buscar instituciones:', error);
            setInstituciones([]);
        }
    }

    const searchUserByDNI = async (dni) => {
        try {
            setLoading(true); // Activamos el estado de carga

            // Llamada a la API para buscar el usuario por DNI
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getUsuarioByDni)}${dni}`);
            if (!response.ok) {
                throw new Error('Usuario no encontrado');
            }
            const user = await response.json();
            console.log(user);
            setUserData(user.usuarios[0]);
        } catch (error) {
            console.error('Error al buscar usuario:', error);
            setUserData(null);
        } finally {
            setLoading(false); // Desactivamos el estado de carga, independientemente del resultado
        }
    };

    const handleSearch = async () => {
        if (!dni) {
            console.error('Debe ingresar un DNI');
            return;
        }
        await searchUserByDNI(dni);
    };

    const handleRegisterNewUser = () => {
        if (!userData) {
            router.push(`/dashboard/Admin/regAdminUsuario`); // Redirecciona a la página de registro de usuario
        } else {
            setShowModal(true); // Muestra el modal
        }
    };

    const handleModalClose = () => {
        setShowModal(false); // Cierra el modal
    };


    const handleRoleChange = (event) => {
        const roleId = event.target.value;
        if (event.target.checked) {
            // Si el checkbox está marcado, añade el rol al estado
            setSelectedRoles(prevRoles => [...prevRoles, roleId]);
        } else {
            // Si el checkbox no está marcado, quita el rol del estado
            setSelectedRoles(prevRoles => prevRoles.filter(role => role !== roleId));
        }
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();

        try {
            const userId = userData.id;
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.addInstitucion)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    "usuarioId": userId,
                    "institucionId": selectedInstitution,
                    "roles": [1, 3, 4]
                }),
            });
            if (!response.ok) {
                throw new Error('Usuario no encontrado');
            }
            if(response.status === 200){
                alert('Usuario registrado exitosamente');
            }
            const data = await response.json();
            console.log(data);

        } catch (e) {

        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '1rem',
        }}>
            <h1>Consulta de Usuario</h1>
            <input type="text" value={dni} onChange={(e) => setDNI(e.target.value)} style={{ marginBottom: '1rem' }} />
            <button onClick={handleSearch} disabled={loading} style={{ marginBottom: '1rem', backgroundColor: 'purple', color: 'white', padding: '0.4rem 1rem', fontSize: '1rem', transition: 'all 0.3s ease' }}>
                Buscar
            </button>
            {loading ? (
                <p>Buscando usuario...</p>
            ) : (
                <>
                    {userData ? (
                        <div>
                            <h2>Datos del Usuario</h2>
                            <p>Nombre: {userData.nombre}</p>
                            <p>Apellido: {userData.apellido}</p>
                            <p>D.N.I: {userData.dni}</p>
                            <p>Telefono: {userData.telefono}</p>
                            {/* Otros datos del usuario */}
                            <button onClick={handleRegisterNewUser} style={{ backgroundColor: 'purple', color: 'white', padding: '0.4rem 1rem', fontSize: '1rem', marginBottom: '1rem', transition: 'all 0.3s ease' }}>
                                Registrar en esta Institución
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p>Usuario no encontrado.</p>
                            {/* Este botón se mostrará solo si no se encontró un usuario */}
                            <button onClick={handleRegisterNewUser} style={{ backgroundColor: 'purple', color: 'white', padding: '0.4rem 1rem', fontSize: '1rem', marginBottom: '1rem', transition: 'all 0.3s ease' }}>
                                Registrar un nuevo usuario
                            </button>
                        </div>
                    )}
                </>
            )}

            {showModal && (
                <Modal onClose={handleModalClose}>
                    <h2>Datos del Usuario</h2>
                    <p>Nombre: {userData.nombre}</p>
                    <p>Apellido: {userData.apellido}</p>
                    <p>D.N.I: {userData.dni}</p>
                    <p>CUIL: {userData.cuil}</p>
                    <p>Telefono: {userData.telefono}</p>
                    {instituciones && instituciones.length > 0 && (
                        <Form.Group>
                            <div className="input-group">
                                <Form.Control
                                    as="select"
                                    value={selectedInstitution}
                                    onChange={(e) => setSelectedInstitution(e.target.value)}
                                >
                                    <option value="">Selecciona una institución</option>
                                    {instituciones.map((institution) => (
                                        <option key={institution.id} value={institution.id}>
                                            {institution.nombre}
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
                    )}


                    {roles && roles.length > 0 && roles.map((role, index) => {
                        return (
                            <label key={index}>
                                <input type="checkbox" value={role.id} onChange={handleRoleChange} />
                                {role.name}
                            </label>
                        );
                    })}
                    <button onClick={handleModalSubmit}>
                        Registrar en esta Institución
                    </button>
                </Modal>
            )}
        </div>
    );
};

export default ConsultaUsuarioPage;
