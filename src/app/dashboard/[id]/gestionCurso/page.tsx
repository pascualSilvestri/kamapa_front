'use client';

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table, Modal } from 'react-bootstrap';
import { Environment } from 'utils/EnviromenManager';
import { Curso } from 'model/types';

const GestionCursos = ({ params }: { params: { id: string } }) => {
    const [nombre, setNombre] = useState('');
    const [nominacion, setNominacion] = useState('');
    const [division, setDivision] = useState('');
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [filtroNombre, setFiltroNombre] = useState('');
    const [filtroNominacion, setFiltroNominacion] = useState('');
    const [filtroDivision, setFiltroDivision] = useState('');
    const [showModalModify, setShowModalModify] = useState(false);
    const [currentCursoId, setCurrentCursoId] = useState<number | null>(null);

    useEffect(() => {
        fecthCursos();
    }, []);

    const fecthCursos = async () => {
        const fecth = await fetch(`${Environment.getEndPoint(Environment.endPoint.getCursosByInstitucion)}${params.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const response = await fecth.json();
        setCursos(response);
    };

    const handleCrearCurso = async () => {
        const nuevoCurso: Curso = {
            id: cursos.length + 1,
            nombre,
            nominacion,
            division,
            institucionId: params.id,
        };
        const fecth = await fetch(`${Environment.getEndPoint(Environment.endPoint.createCurso)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: nuevoCurso.nombre,
                nominacion: nuevoCurso.nominacion,
                division: nuevoCurso.division,
                institucionId: nuevoCurso.institucionId
            })
        });

        if (fecth.status !== 200) {
            alert('Error al crear curso');
            return;
        } else {
            const response = await fecth.json();
            fecthCursos();
        }

        setNombre('');
        setNominacion('');
        setDivision('');
    };

    const handleModificarCurso = (id: number) => {
        const curso = cursos.find(curso => curso.id === id);
        if (curso) {
            setNombre(curso.nombre);
            setNominacion(curso.nominacion);
            setDivision(curso.division);
            setCurrentCursoId(id);
            setShowModalModify(true);
        }
    };

    const handleSubmitModificarCurso = async () => {
        if (currentCursoId !== null) {
            const res = await fetch(`${Environment.getEndPoint(Environment.endPoint.updateCursor)}${currentCursoId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre,
                    nominacion,
                    division,
                    institucionId: params.id
                })
            });

            if (res.status !== 200) {
                throw new Error('No se pudo modificar el curso');
            } else {
                fecthCursos();
                setShowModalModify(false);
                setNombre('');
                setNominacion('');
                setDivision('');
                setCurrentCursoId(null);
            }
        }
    };

    const handleEliminarCurso = async (id: number) => {
        const fecth = await fetch(`${Environment.getEndPoint(Environment.endPoint.deleteCurso)}${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (fecth.status !== 200) {
            alert('Error al eliminar curso');
            return;
        } else {
            const response = await fecth.json();
            console.log(response);
            fecthCursos();
        }
    };

    const filteredCursos = cursos.filter(curso => {
        return (
            (filtroNombre === '' || curso.nombre.toLowerCase().includes(filtroNombre.toLowerCase())) &&
            (filtroNominacion === '' || curso.nominacion.toLowerCase().includes(filtroNominacion.toLowerCase())) &&
            (filtroDivision === '' || curso.division.toLowerCase().includes(filtroDivision.toLowerCase()))
        );
    });

    return (
        <Container>
            <h1 className="my-4">Gestionar Cursos</h1>
            <Row className="mb-4">
                <Col md={6}>
                    <Form>
                        <Form.Group className="mb-3" controlId="formNombre">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nombre del curso"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formNominacion">
                            <Form.Label>Nominación</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nominación del curso"
                                value={nominacion}
                                onChange={(e) => setNominacion(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formDivision">
                            <Form.Label>División</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="División del curso"
                                value={division}
                                onChange={(e) => setDivision(e.target.value)}
                            />
                        </Form.Group>
                        <Button
                            variant="primary"
                            onClick={handleCrearCurso}
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
                            Crear Curso
                        </Button>
                    </Form>
                </Col>
            </Row>
            <Row className="mb-4">
                <Col md={4}>
                    <Form.Group controlId="filtroNombre">
                        <Form.Label>Filtrar por Nombre</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nombre del curso"
                            value={filtroNombre}
                            onChange={(e) => setFiltroNombre(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group controlId="filtroNominacion">
                        <Form.Label>Filtrar por Nominación</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nominación del curso"
                            value={filtroNominacion}
                            onChange={(e) => setFiltroNominacion(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col md={4}>
                    <Form.Group controlId="filtroDivision">
                        <Form.Label>Filtrar por División</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="División del curso"
                            value={filtroDivision}
                            onChange={(e) => setFiltroDivision(e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col>
                    <h3 className="mb-4">Lista de Cursos</h3>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Nominación</th>
                                <th>División</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCursos.map((curso) => (
                                <tr key={curso.id}>
                                    <td>{curso.nombre}</td>
                                    <td>{curso.nominacion}</td>
                                    <td>{curso.division}</td>
                                    <td>
                                        <Button
                                            variant="warning"
                                            className="me-2"
                                            onClick={() => handleModificarCurso(curso.id)}
                                        >
                                            Modificar
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleEliminarCurso(curso.id)}
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

            <Modal show={showModalModify} onHide={() => setShowModalModify(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Modificar Curso</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="formNombreModificar">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nombre del curso"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formNominacionModificar">
                            <Form.Label>Nominación</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nominación del curso"
                                value={nominacion}
                                onChange={(e) => setNominacion(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formDivisionModificar">
                            <Form.Label>División</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="División del curso"
                                value={division}
                                onChange={(e) => setDivision(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModalModify(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSubmitModificarCurso}>
                        Guardar Cambios
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default GestionCursos;
