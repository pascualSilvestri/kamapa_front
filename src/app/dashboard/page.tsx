'use client';
import { useSession, signOut } from 'next-auth/react';
import { Card, Button, Row, Image, Col, Container } from 'react-bootstrap';
import Link from 'next/link';
import Loading from '../components/Loading';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CicloLectivo, Roles, User } from '../../model/types';
import { useInstitucionSelectedContext, useRolesContext, useUserContext } from 'context/userContext';
import { Environment } from 'utils/EnviromenManager';
import ButtonAuth from '../components/ButtonAuth';


const Dashboard = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [rolAdmin, setRolAdmin] = useState<Roles[]>([]);
    const [user, setUser] = useUserContext();
    const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();
    const [rol, setRol] = useRolesContext();


    useEffect(() => {
        if (!session) {
            router.push('/login');
        } else if (session?.user?.first_session === false) {
            router.push('/changePassword');
        } else if (session?.user) {
            setUser({
                id: session.user.id,
                nombre: session.user.nombre,
                apellido: session.user.apellido,
                dni: session.user.dni,
                legajo: session.user.legajo,
                telefono: session.user.telefono,
                Roles: session.user.Roles,
                Instituciones: session.user.Instituciones
            });
            setRolAdmin(session.user.Roles);
        }
    }, [router, session]);

    if (status === 'loading') {
        return <Loading />;
    }

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };


    return (
        <Container>
            <Row className='justify-content-center text-center align-items-center mt-5'>
                <Col xs={12} md={6} lg={4}>
                    <ButtonAuth />
                </Col>
            </Row>
            <Row className='justify-content-center mt-5'>
                {user.Instituciones && user.Instituciones.length > 0 && user.Instituciones.map((institucion, index) => (
                    <Col key={index} xs={12} sm={6} md={4} lg={3} className='d-flex align-items-stretch mb-4'>
                        <Card className='text-center w-100'>
                            <Card.Header>{institucion.nombre}</Card.Header>
                            <div className="d-flex justify-content-center align-items-center" style={{ height: '150px' }}>
                                <Image src={institucion.logo || '/Logo.png' } alt={institucion.nombre} style={{ width: '100px', height: '100px' }} />
                            </div>
                            <Card.Body>
                                <Link href={`/dashboard/${institucion.id}/bienvenido`}>
                                    <Button
                                        variant='flat'
                                        style={{
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
                                        onClick={async (e) => {
                                            const inst = await fetch(`${Environment.getEndPoint(Environment.endPoint.getInstitucionForRolsForUser)}${institucion.id}`, {
                                                method: 'POST',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Accept': 'application/json',
                                                    'Authorization': `Bearer ${session.accessToken}`
                                                },
                                                body: JSON.stringify({
                                                    usuarioId: user.id,
                                                })
                                            });
                                            const institucionSelected = await inst.json();
                                            setInstitucionSelected({
                                                id: institucionSelected.institucion.id,
                                                nombre: institucionSelected.institucion.nombre,
                                                logo: institucionSelected.institucion.logo,
                                                cue: institucionSelected.institucion.cue,
                                                email: institucionSelected.institucion.email,
                                                contacto: institucionSelected.institucion.contacto,
                                            });
                                            setRol(institucionSelected.Roles);
                                        }}>
                                        Ingresar
                                    </Button>
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
                {rolAdmin.find((e) => e.name === 'Admin') && (
                    <Col xs={12} sm={6} md={4} lg={3} className='d-flex align-items-stretch mb-4'>
                        <Card className='text-center w-100'>
                            <Card.Header>Administrador</Card.Header>
                            <div className="d-flex justify-content-center align-items-center" style={{ height: '150px' }}>
                                <Image src='Logo.png' alt='Logo.png' style={{ width: '100px', height: '100px' }} />
                            </div>
                            <Card.Body>
                                <Link href={`/dashboard/Admin/adminHome`}>
                                    <Button
                                        variant='flat'
                                        style={{
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
                                        }}>
                                        Ingresar
                                    </Button>
                                </Link>
                            </Card.Body>
                        </Card>
                    </Col>
                )}
            </Row>
        </Container>
    );
};

export default Dashboard;
