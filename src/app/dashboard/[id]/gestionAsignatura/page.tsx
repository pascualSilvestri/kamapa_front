'use client';

import { Asignatura, Curso } from 'model/types';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table, Modal, Pagination, Alert } from 'react-bootstrap';
import { Environment } from 'utils/EnviromenManager';

const GestionAsignaturas = ({ params }: { params: { id: string } }) => {
    const [nombre, setNombre] = useState('');
    const [cursoAsociado, setCursoAsociado] = useState<Curso | undefined>();
    const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
    const [filtroNombre, setFiltroNombre] = useState('');
    const [filtroCurso, setFiltroCurso] = useState('');
    const [showModalModify, setShowModalModify] = useState(false);
    const [currentAsignaturaId, setCurrentAsignaturaId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Ajustado a 5 elementos por página

    useEffect(() => {
        fetchAsignaturas();
    }, []);

    const fetchAsignaturas = async () => {
        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getAsignaturaByInstitucion)}${params.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener las asignaturas');
            }

            const asignaturasData = await response.json();
            setAsignaturas(asignaturasData);
        } catch (error) {
            console.error('Error fetching asignaturas:', error);
        }
    };

    const handleCrearAsignatura = async () => {
        try {
            const res = await fetch(`${Environment.getEndPoint(Environment.endPoint.crearAsignatura)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: nombre,
                    institucionId: params.id
                })
            });

            if (!res.ok) {
                throw new Error('No se pudo crear la asignatura');
            }

            await res.json();
            fetchAsignaturas();
        } catch (error) {
            console.error('Error creating asignatura:', error);
        }

        setNombre('');
        setCursoAsociado(undefined);
    };

    const handleModificarAsignatura = (id: number) => {
        const asignatura = asignaturas.find(asig => asig.id === id);
        if (asignatura) {
            setNombre(asignatura.nombre);
            setCurrentAsignaturaId(id);
            setShowModalModify(true);
        }
    };

    const handleSubmitModificarAsignatura = async () => {
        try {
            if (currentAsignaturaId !== null) {
                const res = await fetch(`${Environment.getEndPoint(Environment.endPoint.updateAsignatura)}${currentAsignaturaId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nombre,
                        institucionId: params.id
                    })
                });

                if (!res.ok) {
                    throw new Error('No se pudo modificar la asignatura');
                }

                fetchAsignaturas();
                setShowModalModify(false);
                setNombre('');
                setCurrentAsignaturaId(null);
            }
        } catch (error) {
            console.error('Error updating asignatura:', error);
        }
    };

    const handleEliminarAsignatura = async (id: number) => {
        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.deleteAsignatura)}${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al eliminar la asignatura');
            }

            await response.json();
            fetchAsignaturas();
        } catch (error) {
            console.error('Error deleting asignatura:', error);
        }
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Filtrar asignaturas según los criterios de filtro
    const filteredAsignaturas = asignaturas.filter(asignatura => {
        return (
            (filtroNombre === '' || asignatura.nombre.toLowerCase().includes(filtroNombre.toLowerCase())) &&
            (filtroCurso === '' || (asignatura.curso && asignatura.curso.nombre.toLowerCase().includes(filtroCurso.toLowerCase())))
        );
    });

    // Obtener las asignaturas a mostrar en la página actual
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAsignaturas = filteredAsignaturas.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAsignaturas.length / itemsPerPage);

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
                        <Button
                            variant="primary"
                            onClick={handleCrearAsignatura}
                            className="custom-button"
                        >
                            Crear Asignatura
                        </Button>
                    </Form>
                </Col>
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
                    {/*  <Form.Group className="mb-3" controlId="formFiltroCurso">
                        <Form.Label>Filtrar por Nombre de Curso</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Nombre del curso"
                            value={filtroCurso}
                            onChange={(e) => setFiltroCurso(e.target.value)}
                        /> 
                    </Form.Group>*/}
                </Col>
            </Row>
            <Row>
                <Col>
                    <h3 className="mb-4">Lista de Asignaturas</h3>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                {/* <th>Curso</th> */}
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentAsignaturas.map((asignatura) => (
                                <tr key={asignatura.id}>
                                    <td>{asignatura.nombre}</td>
                                    {/* <td>{asignatura.curso?.nombre}</td> */}
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
                    <Modal.Title>Modificar Asignatura</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="formNombreModal">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Nombre de la asignatura"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModalModify(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSubmitModificarAsignatura}>
                        Modificar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default GestionAsignaturas;
