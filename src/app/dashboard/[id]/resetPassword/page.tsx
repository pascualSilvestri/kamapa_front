'use client';
import { useSession } from 'next-auth/react';
import { Card, Button, Row, Col, Form, Container } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useInstitucionSelectedContext, useRolesContext, useUserContext } from 'context/userContext';
import Loading from 'app/components/Loading';
import ButtonAuth from 'app/components/ButtonAuth';
import { Environment } from 'utils/EnviromenManager';

const Page = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [user, setUser] = useUserContext();
    const [institucionSelected, setInstitucionSelected] = useInstitucionSelectedContext();
    const [rol, setRol] = useRolesContext();
    const [dni, setDni] = useState('');

    if (status === 'loading') {
        return <Loading />;
    }


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.resetPassword)}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({dni}),
            });
            if (!response.ok) {
              throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            alert('Contraseña Reseteada');
          } catch (error) {
            console.error('Error al crear ciclo lectivo:', error.message);
          }
        
    };

    return (
        <Container>
            <Row className='justify-content-center mt-5'>
                <Col xs={12} md={6} lg={4}>
                    <Card>
                        <Card.Body>
                            <Card.Title>Resetear Contraseña de Usuario</Card.Title>
                            <Form onSubmit={handleSubmit}>
                                <Form.Group className='mb-3'>
                                    <Form.Label>Ingrese el DNI del Alumno</Form.Label>
                                    <Form.Control
                                        type='text'
                                        placeholder='DNI'
                                        value={dni}
                                        onChange={(e) => setDni(e.target.value)}
                                    />
                                </Form.Group>
                                <Button variant='primary' type='submit'style={{
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
                                    Enviar
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Page;
