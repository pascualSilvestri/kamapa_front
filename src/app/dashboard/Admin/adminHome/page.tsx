'use client';

import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import { Environment } from '../../../../utils/EnviromenManager'; // Asegúrate de que esta ruta es correcta

function Page() {
    const [userCount, setUserCount] = useState(0);
    const [institutionCount, setInstitutionCount] = useState(0);

    useEffect(() => {
        fetchUserCount();
        fetchInstitutionCount();
    }, []);

    async function fetchUserCount() {
        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.usuario)}`);
            if (!response.ok) {
                throw new Error('Error al obtener la cantidad de usuarios');
            }
            const data = await response.json();
            setUserCount(data.usuarios.length);
        } catch (error) {
            console.error('Error al obtener la cantidad de usuarios:', error);
        }
    }

    async function fetchInstitutionCount() {
        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.institucion)}`);
            if (!response.ok) {
                throw new Error('Error al obtener la cantidad de instituciones');
            }
            const data = await response.json();
            setInstitutionCount(data.length);
        } catch (error) {
            console.error('Error al obtener la cantidad de instituciones:', error);
        }
    }

    return (
        <div className="container mt-4">
            <h1 className="mb-4 text-center">Admin Dashboard</h1>
            <div className="row">
                <div className="col-md-6">
                    <div className="card text-center shadow-sm border-0 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                        <div className="card-body">
                            <h5 className="card-title text-uppercase text-muted mb-2">Usuarios Registrados</h5>
                            <h2 className="card-text display-4 font-weight-bold" style={{ color: '#007bff' }}>{userCount}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card text-center shadow-sm border-0 mb-4" style={{ backgroundColor: '#f8f9fa' }}>
                        <div className="card-body">
                            <h5 className="card-title text-uppercase text-muted mb-2">Instituciones Registradas</h5>
                            <h2 className="card-text display-4 font-weight-bold" style={{ color: '#28a745' }}>{institutionCount}</h2>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;
