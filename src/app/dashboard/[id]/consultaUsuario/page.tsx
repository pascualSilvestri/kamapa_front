'use client'
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Environment } from '../../../../utils/EnviromenManager';
import { useInstitucionSelectedContext } from 'context/userContext';
import { User } from 'model/types';
import { useRolesContext } from 'context/userContext';
import Link from 'next/link';


const ConsultaUsuarioPage = () => {
    const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();

    const router = useRouter();
    const [dni, setDNI] = useState('');
    const [userData, setUserData] = useState<User>(null);
    const [loading, setLoading] = useState(false);
    const [userIsNotExists, setUserIsNotExists] = useState(false);
    const [rol, setRol] = useRolesContext();
    const [userIsPreseptor, setUserIsPreseptor] = useState(false);


    useEffect(() => {
        if (rol.some(e => e.name === 'Director' || e.name === 'Secretario')) {
            setUserIsPreseptor(true);
        }
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
            console.log(data);
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

    const handleRegisterNewUser = () => {

        if (!userData) {
            // No se encontró usuario, redirigir a registro de nuevo usuario
            router.push(`/dashboard/${institucionSelected.id}/regUsuario`);
            return;
        }

        // const isAlumno = userData.Roles.some((role) => role.name === 'Alumno');

        // if (isAlumno) {
        //     router.push(`/dashboard/${institucionSelected.id}/regAlumno`);
        // } else {
        //     router.push(`/dashboard/${institucionSelected.id}/regUsuario`);
        // }
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
                    )}  {userIsNotExists && (
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
        </div>
    );
};

export default ConsultaUsuarioPage;
