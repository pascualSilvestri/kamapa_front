'use client'
import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
    Container,
    Card,
    Button,
    CardBody,
    CardTitle,
    CardSubtitle,
    Row,
    Col,
} from 'react-bootstrap';
import Link from 'next/link';
import { autorizeNivel, autorizeRol } from 'utils/autorizacionPorRoles';
import { Roles, User } from 'model/types';
import { useRolesContext, useUserContext } from 'context/userContext';
import Loading from 'app/components/Loading';

export default function Page() {
    const { data: session, status } = useSession();
    const [rol, setRol] = useRolesContext();
    const [, setUser] = useUserContext();
    const router = useRouter();
    const [rolAdmin, setRolAdmin] = useState<Roles[]>([]);

    useEffect(() => {
        if (status === 'loading') return; // Espera a que se complete la carga de sesión
        if (!session) {
            router.push('/login');
        } else if (session.user?.first_session === false) {
            router.push('/changePassword');
        } else if (session.user) { // Verifica si session.user existe
            setUser({
                id: session.user.id,
                nombre: session.user.nombre,
                apellido: session.user.apellido,
                legajo: session.user.legajo,
                telefono: session.user.telefono,
                Roles: session.user.Roles,
                Instituciones: session.user.Instituciones
            });
            setRolAdmin(session.user.Roles);
        }
    }, [router, session, setUser, setRol]);

    if (status === 'loading') {
        return <Loading />;
    }

    return (
        <Container>
            <Row className='mb-3 justify-content-center'>
                <Col>
                    <Link href='/dashboard'>
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
            </Row>

            <h1 style={{ margin: '2rem 0 1rem 0', textAlign: 'center' }}>
                Panel Admin
            </h1>

            <div className='row'>
                <div className='col-md-3'>
                    <Card style={{ backgroundColor: '#b96a8c' }}>
                        <CardBody>
                            <CardTitle style={{ textAlign: 'center' }}>Usuarios</CardTitle>
                            <CardSubtitle>Gestiona a los usuarios de tu aplicación</CardSubtitle>
                            <Link href={`/dashboard/${autorizeRol(autorizeNivel(rol))}/vistausuarios`}>
                                <Button variant='primary' style={{ width: '100%' }}>Ir</Button>
                            </Link>
                        </CardBody>
                    </Card>
                </div>
                <div className='col-md-3'>
                    <Card style={{ backgroundColor: '#a99aff' }}>
                        <CardBody>
                            <CardTitle style={{ textAlign: 'center' }}>Institución</CardTitle>
                            <CardSubtitle>Administra las Instituciones Registradas</CardSubtitle>
                            <Link href={`/dashboard/${autorizeRol(autorizeNivel(rol))}/vistainstitucion`}>
                                <Button variant='primary' style={{ width: '100%' }}>Ir</Button>
                            </Link>
                        </CardBody>
                    </Card>
                </div>
                <div className='col-md-3'>
                    <Card style={{ backgroundColor: '#9f8cf6' }}>
                        <CardBody>
                            <CardTitle style={{ textAlign: 'center' }}>Roles</CardTitle>
                            <CardSubtitle>Asignacion de vistas Segun el Rol</CardSubtitle>
                            <Link href={`/dashboard/${autorizeRol(autorizeNivel(rol))}`}>
                                <Button variant='primary' style={{ width: '100%' }}>Ir</Button>
                            </Link>
                        </CardBody>
                    </Card>
                </div>
                <div className='col-md-3'>
                    <Card style={{ backgroundColor: '#8f7cf3' }}>
                        <CardBody>
                            <CardTitle style={{ textAlign: 'center' }}>Reportes</CardTitle>
                            <CardSubtitle>Estadísticas de Usuarios & Instituciones Registrados</CardSubtitle>
                            <Link href={`/dashboard/${autorizeRol(autorizeNivel(rol))}`}>
                                <Button variant='primary' style={{ width: '100%' }}>Ir</Button>
                            </Link>
                        </CardBody>
                    </Card>
                </div>
            </div>
        </Container>
    );
}
