'use client'
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Environment } from '../../../../utils/apiHelpers';
import { useInstitucionSelectedContext } from 'context/userContext';

const ConsultaUsuarioPage = () => {
    const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();

    const router = useRouter();
    const [dni, setDNI] = useState('');
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);

    const searchUserByDNI = async (dni) => {
        try {
            setLoading(true); // Activamos el estado de carga

            // Llamada a la API para buscar el usuario por DNI
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getUsuarioByDni)}${dni}`);
            if (!response.ok) {
                throw new Error('Usuario no encontrado');
            }
            const userData = await response.json();
            console.log(userData);
            setUserData(userData.usuarios[0]);
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
            router.push(`/dashboard/${institucionSelected.id}/regUsuario`); // Redirecciona a la página de registro de usuario
        } else {
            // Lógica para registrar el usuario en la institución
            console.log('Registrando usuario en esta institución:', userData);
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
        </div>
    );
};

export default ConsultaUsuarioPage;
