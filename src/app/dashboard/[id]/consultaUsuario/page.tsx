'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Environment } from '../../../../utils/EnviromenManager';
import { useInstitucionSelectedContext } from 'context/userContext';
import { Roles, User } from 'model/types';
import { useRolesContext } from 'context/userContext';
import Link from 'next/link';

const Modal = ({ show, onClose, user, roles, handleRoleChange, handleSubmit }) => {
    if (!show) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '8px',
                width: '400px',
                textAlign: 'center',
            }}>
                <h2>Registrar en esta Institución</h2>
                <p>Nombre de la Institución: {user.institucion}</p>
                <p>DNI: {user.dni}</p>
                <p>Nombre: {user.nombre}</p>
                <p>Apellido: {user.apellido}</p>
                <div>
                    <h3>Seleccionar Roles</h3>
                    {Object.keys(roles).map(role => (
                        <div key={roles[role].id}>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={roles[role].checked}
                                    onChange={() => handleRoleChange(role)}
                                />
                                {role}
                            </label>
                        </div>
                    ))}
                </div>
                <button onClick={handleSubmit} style={{ marginTop: '1rem', backgroundColor: 'purple', color: 'white', padding: '0.4rem 1rem', fontSize: '1rem' }}>
                    Registrar
                </button>
                <button onClick={onClose} style={{ marginTop: '1rem', marginLeft: '1rem', backgroundColor: 'grey', color: 'white', padding: '0.4rem 1rem', fontSize: '1rem' }}>
                    Cancelar
                </button>
            </div>
        </div>
    );
};

const ConsultaUsuarioPage = () => {
    const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();

    const router = useRouter();
    const [dni, setDNI] = useState('');
    const [userData, setUserData] = useState<User>(null);
    const [loading, setLoading] = useState(false);
    const [userIsNotExists, setUserIsNotExists] = useState(false);
    const [roles, setRoles] = useState({});
    const [rol, setRol] = useRolesContext();
    const [userIsPreseptor, setUserIsPreseptor] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (rol.some(e => e.name === 'Director' || e.name === 'Secretario')) {
            setUserIsPreseptor(true);
        }
    }, [rol]);

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
            .catch(error => console.error('Error fetching roles:', error));
    }, [rol]);

    const searchUserByDNI = async (dni) => {
        try {
            setLoading(true); // Activamos el estado de carga

            // Llamada a la API para buscar el usuario por DNI
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getUsuarioByDni)}${dni}`);
            if (!response.ok) {
                throw new Error('Usuario no encontrado');
            }
            const data = await response.json();
            if (!data.usuarios || data.usuarios.length === 0) {
                setUserData(null);
            } else {
                setUserData(data.usuarios[0]);
            }
            if (data.usuarios.length === 0) {
                setUserIsNotExists(true);
            }

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

    const handleRoleChange = (roleName) => {
        setRoles(prevRoles => ({
            ...prevRoles,
            [roleName]: {
                ...prevRoles[roleName],
                checked: !prevRoles[roleName].checked,
            }
        }));
    };

    const handleRegisterNewUser = () => {
        if (!userData) {
            // No se encontró usuario, redirigir a registro de nuevo usuario
            router.push(`/dashboard/${institucionSelected.id}/regUsuario`);
            return;
        }

        setShowModal(true);
    };

    const handleSubmit = async () => {
        const selectedRoles = Object.keys(roles).filter(role => roles[role].checked).map(role => roles[role].id);
        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.addInstitucion)}`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                institucionId: institucionSelected.id,
                usuarioId: userData.id,
                roles: selectedRoles,
            }),
        });

        if (!response.ok) {
            throw new Error('Error al registrar usuario');
        }
        alert('Usuario registrado exitosamente');

        console.log('ID de la Institución:', institucionSelected.id);
        console.log('ID del Usuario:', userData.id);
        console.log('IDs de los Roles seleccionados:', selectedRoles);

        setShowModal(false);
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
                    {userData && (
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
                    )}
                    {userIsNotExists && (
                        <div>
                            <p>Usuario no encontrado.</p>
                            {/* Este botón se mostrará solo si no se encontró un usuario */}
                            {userIsPreseptor && <button onClick={handleRegisterNewUser} style={{ backgroundColor: 'purple', color: 'white', padding: '0.4rem 1rem', fontSize: '1rem', marginBottom: '1rem', transition: 'all 0.3s ease' }}>
                                Registrar un nuevo usuario
                            </button>}
                            <br />
                            <Link href={`/dashboard/${institucionSelected.id}/regAlumno`} >
                                <button style={{ backgroundColor: 'purple', color: 'white', padding: '0.4rem 1rem', fontSize: '1rem', marginBottom: '1rem', transition: 'all 0.3s ease' }}>
                                    Registrar Nuevo Alumno
                                </button>
                            </Link>
                        </div>
                    )}
                </>
            )}
            <Modal
                show={showModal}
                onClose={() => setShowModal(false)}
                user={userData}
                roles={roles}
                handleRoleChange={handleRoleChange}
                handleSubmit={handleSubmit}
            />
        </div>
    );
};

export default ConsultaUsuarioPage;
