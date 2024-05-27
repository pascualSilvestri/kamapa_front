'use client'
import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { Environment } from 'utils/EnviromenManager';

const AddAsignaturaCurso = ({ params }: { params: { id: string } }) => {
    const [curso, setCurso] = useState<string>('');
    const [asignatura, setAsignatura] = useState<string>('');
    const [cursos, setCursos] = useState<string[]>([]);
    const [asignaturas, setAsignaturas] = useState<{ [curso: string]: string[] }>({});



    // useEffect(() => {
    //     fecthCursos();
    // }, []);

    // const fecthCursos = async () => {
    //     const fecth = await fetch(`${Environment.getEndPoint(Environment.endPoint.getCursosByInstitucion)}${params.id}`, {
    //         method: 'GET',
    //         headers: {
    //             'Content-Type': 'application/json'
    //         }
    //     })

    //     const response = await fecth.json();
    //     setCursos(response);
    // }

    const handleAddCurso = () => {
        setCursos([...cursos, curso]);
        setAsignaturas({ ...asignaturas, [curso]: [] });
        setCurso('');
    };

    const handleAddAsignatura = (cursoKey: string) => {
        setAsignaturas({
            ...asignaturas,
            [cursoKey]: [...asignaturas[cursoKey], asignatura],
        });
        setAsignatura('');
    };

    return (
        <Container>
            <h1>Gestionar Cursos y Asignaturas</h1>
            <Row>
                <Col>
                    <Form.Group>
                        <Form.Label>Nombre del Curso</Form.Label>
                        <Form.Control
                            type="text"
                            value={curso}
                            onChange={(e) => setCurso(e.target.value)}
                        />
                    </Form.Group>
                    <Button onClick={handleAddCurso} style={{
                        backgroundColor: 'purple',
                        color: 'white',
                        padding: '0.4rem 1rem',
                        fontSize: '1rem',
                        transition: 'all 0.3s ease',
                        marginBottom: '10px',
                        border: '2px solid purple',
                        cursor: 'pointer',
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'white';
                            e.currentTarget.style.color = 'black';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'purple';
                            e.currentTarget.style.color = 'white';
                        }}>Agregar Curso</Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Curso</th>
                                <th>Asignaturas</th>
                                <th>Agregar Asignatura</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cursos.map((cursoKey) => (
                                <tr key={cursoKey}>
                                    <td>{cursoKey}</td>
                                    <td>
                                        <ul>
                                            {asignaturas[cursoKey].map((asignatura, index) => (
                                                <li key={index}>{asignatura}</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td>
                                        <Form.Control
                                            type="text"
                                            value={asignatura}
                                            onChange={(e) => setAsignatura(e.target.value)}
                                        />
                                        <Button onClick={() => handleAddAsignatura(cursoKey)}
                                            style={{
                                                backgroundColor: 'purple',
                                                color: 'white',
                                                padding: '0.4rem 1rem',
                                                fontSize: '1rem',
                                                transition: 'all 0.3s ease',
                                                marginBottom: '10px',
                                                border: '2px solid purple',
                                                cursor: 'pointer',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'white';
                                                e.currentTarget.style.color = 'black';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'purple';
                                                e.currentTarget.style.color = 'white';
                                            }}>
                                            Agregar Asignatura
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
};

export default AddAsignaturaCurso;
