// layout.js (RootLayout)
'use client'
import React, { Suspense, useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import Loading from './components/Loading'; // Importa el componente de carga
import DataLoading from './components/DataLoading'; // Importa el componente de carga de datos
import SessionAuthProvider from '../context/SessionAuthProvider';
import { UserProvider } from '../context/userContext';
import { CicloLectivoProvider } from '../context/CicloLectivoContext';
import Footer from './components/Footer';

export default function RootLayout({ children }) {
    const [loading, setLoading] = useState(true);

    // Simula la carga de datos desde el servidor
    useEffect(() => {
        // Aquí podrías agregar tu lógica para cargar los datos necesarios
        const fetchData = async () => {
            // Simulación de una llamada a la API
            await new Promise(resolve => setTimeout(resolve, 2000));
            setLoading(false);
        };

        fetchData();
    }, []);

    return (
        <html lang='es'>
            <head>
                <title>KAMAPA</title>
                {/* Enlace a Bootstrap */}
                <meta charSet='UTF-8' />
                <meta
                    name='viewport'
                    content='width=device-width, initial-scale=1.0'
                />
                <meta
                    httpEquiv='X-UA-Compatible'
                    content='ie=edge'
                />
                <meta
                    name='description'
                    content='Sistemas de gestión de escuelas'
                />
                <meta
                    name='keywords'
                    content='KAMAPA, educación, gestor de Escuelas'
                />
                <meta
                    name='author'
                    content='KAMAPA'
                />
                {/* Asegúrate de tener una imagen cuadrada de alta resolución para compartir en redes sociales */}
                <meta
                    property='og:title'
                    content='KAMAPA'
                />
                <meta
                    property='og:description'
                    content='Sistema de Gestión de escuelas'
                />
                <meta
                    property='og:url'
                    content='KAMAPA'
                />
                <meta
                    property='og:type'
                    content='webapp'
                />
                <link
                    href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css'
                    rel='stylesheet'
                    integrity='sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN'
                    crossOrigin='anonymous'
                />
                <style>{`
                    html, body, #__next {
                        height: 100%;
                        margin: 0;
                    }
                    body {
                        display: flex;
                        flex-direction: column;
                    }
                    .container-fluid {
                        display: flex;
                        flex-direction: column;
                        flex: 1;
                    }
                    main {
                        display: flex;
                        flex-direction: column;
                        flex: 1;
                    }
                    .content {
                        flex: 1;
                    }
                    footer {
                        position: relative;
                        bottom: 0;
                        width: 100%;
                        margin-top: auto;
                    }
                `}</style>
            </head>
            <body>
                <div className='container-fluid d-flex flex-column min-vh-100 mx-0'>
                    <SessionAuthProvider>
                        <UserProvider>
                            <CicloLectivoProvider>
                                {loading ? (
                                    <DataLoading loading={loading} />
                                ) : (
                                    <Suspense fallback={<Loading />}>
                                        <div >
                                            {children}
                                        </div>
                                    </Suspense>
                                )}
                            </CicloLectivoProvider>
                        </UserProvider>
                    </SessionAuthProvider>
                    <Footer />
                </div>
            </body>
        </html>
    );
}
