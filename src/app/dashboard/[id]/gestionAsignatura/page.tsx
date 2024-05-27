'use client';

import { Curso } from 'model/types';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { Environment } from 'utils/EnviromenManager';

interface Asignatura {
    id: number;
    nombre: string;
    curso?: Curso;
}

const GestionAsignaturas = ({ params }: { params: { id: string } }) => {
    const [nombre, setNombre] = useState('');
    const [cursoAsociado, setCursoAsociado] = useState<Curso | undefined>();
    const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [filtroNombre, setFiltroNombre] = useState('');
    const [filtroCurso, setFiltroCurso] = useState('');

    useEffect(() => {
        fetchCursos();
        fetchAsignaturas();
    }, []);
    console.log(asignaturas)

    const fetchCursos = async () => {
        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getCursosByInstitucion)}${params.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const cursos = await response.json();
        setCursos(cursos);
    };

    const fetchAsignaturas = async () => {
        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getAsignaturaByInstitucion)}${params.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const asignaturas = await response.json();
        setAsignaturas(asignaturas);
    };

    const handleCrearAsignatura = () => {
        const nuevaAsignatura: Asignatura = {
            id: asignaturas.length + 1,
            nombre,
            curso: cursoAsociado || undefined,
        };
        setAsignaturas([...asignaturas, nuevaAsignatura]);
        console.log('Asignatura creada:', nuevaAsignatura);
        setNombre('');
        setCursoAsociado(undefined);
    };

    const handleModificarAsignatura = (id: number) => {
        console.log('Modificar asignatura con ID:', id);
    };

    const handleEliminarAsignatura = (id: number) => {
        setAsignaturas(asignaturas.filter(asignatura => asignatura.id !== id));
        console.log('Eliminar asignatura con ID:', id);
    };

    const filteredAsignaturas = asignaturas.filter(asignatura => {
        return (
            (filtroNombre === '' || asignatura.nombre.toLowerCase().includes(filtroNombre.toLowerCase())) &&
            (filtroCurso === '' || (asignatura.curso && asignatura.curso.nombre.toLowerCase().includes(filtroCurso.toLowerCase())))
        );
    });

    return (
        <Container>
            <h1 className="my-4">Gestionar Asignaturas</h1>
            <Row className="mb-4">
                <Col md={6}>
                    <Form>
                        <Form.Group className="mb-3" controlId="formNombre">
                            <Form.Label>Nombre de la Asignatura</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nombre de la asignatura"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formCursoAsociado">
                            <Form.Label>Curso Asociado (opcional)</Form.Label>
                            <Form.Control
                                as="select"
                                value={cursoAsociado ? cursoAsociado.id : ''}
                                onChange={(e) => {
                                    const selectedCurso = cursos.find(curso => curso.id === parseInt(e.target.value));
                                    setCursoAsociado(selectedCurso);
                                }}
                            >
                                <option value="">Seleccionar curso</option>
                                {cursos.map((curso) => (
                                    <option key={curso.id} value={curso.id}>
                                        {curso.nombre}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Button
                            variant="primary"
                            onClick={handleCrearAsignatura}
                            style={{
                                backgroundColor: 'purple',
                                color: 'white',
                                padding: '0.4rem 1rem',
                                fontSize: '1rem',
                                transition: 'all 0.3s ease',
                                border: '2px solid purple',
                                cursor: 'pointer',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.color = 'purple';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'purple';
                                e.currentTarget.style.color = 'white';
                            }}
                        >
                            Crear Asignatura
                        </Button>
                    </Form>
                </Col>
            </Row>
            <Row className="mb-4">
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="formFiltroNombre">
                        <Form.Label>Filtrar por Nombre de la Asignatura</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nombre de la asignatura"
                            value={filtroNombre}
                            onChange={(e) => setFiltroNombre(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group className="mb-3" controlId="formFiltroCurso">
                        <Form.Label>Filtrar por Curso Asociado</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nombre del curso"
                            value={filtroCurso}
                            onChange={(e) => setFiltroCurso(e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h3 className="mb-4">Lista de Asignaturas</h3>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Curso Asociado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAsignaturas.map((asignatura) => (
                                <tr key={asignatura.id}>
                                    <td>{asignatura.nombre}</td>
                                    <td>{asignatura.curso ? asignatura.curso.nombre : 'No asociado'}</td>
                                    <td>
                                        <Button
                                            variant="warning"
                                            className="me-2"
                                            onClick={() => handleModificarAsignatura(asignatura.id)}
                                        >
                                            Modificar
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleEliminarAsignatura(asignatura.id)}
                                        >
                                            Eliminar
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

export default GestionAsignaturas;
