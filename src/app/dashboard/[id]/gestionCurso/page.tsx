'use client';

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table, Modal, Pagination, Alert } from 'react-bootstrap';
import { Environment } from 'utils/EnviromenManager';
import { Curso } from 'model/types';

const GestionCursos = ({ params }: { params: { id: string } }) => {
    const [nominacion, setNominacion] = useState('');
    const [division, setDivision] = useState('');
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [filtroNombre, setFiltroNombre] = useState('');
    const [filtroNominacion, setFiltroNominacion] = useState('');
    const [filtroDivision, setFiltroDivision] = useState('');
    const [showModalModify, setShowModalModify] = useState(false);
    const [currentCursoId, setCurrentCursoId] = useState<number | null>(null);
    const [showModalDelete, setShowModalDelete] = useState(false);
    const [showModalConfirmDelete, setShowModalConfirmDelete] = useState(false);
    const [showModalConfirmModify, setShowModalConfirmModify] = useState(false);
    const [cursoToDelete, setCursoToDelete] = useState<number | null>(null);
    const [cursoToDeleteName, setCursoToDeleteName] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Número de elementos por página

    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showModifySuccessMessage, setShowModifySuccessMessage] = useState(false);
    const [currentCursoName, setCurrentCursoName] = useState<string>('');

    useEffect(() => {
        fetchCursos();
    }, []);

    const fetchCursos = async () => {
        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getCursosByInstitucion)}${params.id}`);
            if (!response.ok) {
                throw new Error('Error al obtener los cursos');
            }
            const data = await response.json();
            setCursos(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleCrearCurso = async () => {
        try {
            const nombre = `${nominacion} ${division}`;
            const nuevoCurso: Curso = {
                id: cursos.length + 1,
                nombre,
                nominacion,
                division,
                institucionId: params.id,
            };

            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.createCurso)}`, {
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

            if (!response.ok) {
                throw new Error('Error al crear curso');
            }

            await response.json();
            fetchCursos();
            setShowSuccessMessage(true);
            setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000); // Ocultar mensaje después de 3 segundos

            setNominacion('');
            setDivision('');

        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleModificarCurso = (id: number) => {
        const curso = cursos.find(curso => curso.id === id);
        if (curso) {
            setNominacion(curso.nominacion);
            setDivision(curso.division);
            setCurrentCursoId(id);
            setCurrentCursoName(curso.nombre);
            setShowModalModify(true);
        }
    };

    const handleSubmitModificarCurso = async () => {
        setShowModalConfirmModify(true);
    };

    const confirmSubmitModificarCurso = async () => {
        try {
            if (currentCursoId !== null) {
                const nombre = `${nominacion} ${division}`;
                const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.updateCurso)}${currentCursoId}`, {
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

                if (!response.ok) {
                    throw new Error('Error al modificar curso');
                }

                fetchCursos();
                setShowModalModify(false);
                setShowModalConfirmModify(false);
                setShowModifySuccessMessage(true);
                setTimeout(() => {
                    setShowModifySuccessMessage(false);
                }, 3000); // Ocultar mensaje después de 3 segundos

                setNominacion('');
                setDivision('');
                setCurrentCursoId(null);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleEliminarCurso = (id: number) => {
        const curso = cursos.find(curso => curso.id === id);
        if (curso) {
            setCursoToDelete(id);
            setCursoToDeleteName(curso.nombre);
            setShowModalDelete(true);
        }
    };

    const confirmDeleteCurso = () => {
        setShowModalDelete(false);
        setShowModalConfirmDelete(true);
    };

    const submitDeleteCurso = async () => {
        try {
            if (cursoToDelete !== null) {
                const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.deleteCurso)}${cursoToDelete}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Error al eliminar curso');
                }

                await response.json();
                fetchCursos();
                setShowModalConfirmDelete(false);
                setCursoToDelete(null);
                setCursoToDeleteName('');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const filteredCursos = cursos.filter(curso => {
        return (
            (filtroNombre === '' || curso.nombre.toLowerCase().includes(filtroNombre.toLowerCase())) &&
            (filtroNominacion === '' || curso.nominacion.toLowerCase().includes(filtroNominacion.toLowerCase())) &&
            (filtroDivision === '' || curso.division.toLowerCase().includes(filtroDivision.toLowerCase()))
        );
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentCursos = filteredCursos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCursos.length / itemsPerPage);

    return (
        <Container>
            <h1 className="my-4">Gestionar Cursos</h1>
            {showSuccessMessage && (
                <Alert variant="success" className="text-center">
                    Curso creado con éxito
                </Alert>
            )}
            {showModifySuccessMessage && (
                <Alert variant="success" className="text-center">
                    Curso modificado con éxito
                </Alert>
            )}
            <Row className="mb-4">
                <Col md={6}>
                    <Form>
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
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Nominación</th>
                                <th>División</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentCursos.map((curso) => (
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
                    <Pagination>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => handlePageChange(i + 1)}>
                                {i + 1}
                            </Pagination.Item>
                        ))}
                    </Pagination>
                </Col>
            </Row>

            <Modal show={showModalModify} onHide={() => setShowModalModify(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Modificar Curso</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
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

            <Modal show={showModalConfirmModify} onHide={() => setShowModalConfirmModify(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Modificación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro de que deseas modificar el curso {currentCursoName}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModalConfirmModify(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={confirmSubmitModificarCurso}>
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showModalDelete} onHide={() => setShowModalDelete(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás seguro de que deseas eliminar el curso {cursoToDeleteName}? Esta acción no se puede deshacer.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModalDelete(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={confirmDeleteCurso}>
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showModalConfirmDelete} onHide={() => setShowModalConfirmDelete(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Eliminar Curso</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    ¿Estás absolutamente seguro de que deseas eliminar el curso {cursoToDeleteName}? Esta acción no se puede deshacer.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModalConfirmDelete(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={submitDeleteCurso}>
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default GestionCursos;
