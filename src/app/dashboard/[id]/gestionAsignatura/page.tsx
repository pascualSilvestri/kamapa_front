"use client";

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
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [asignaturaToDelete, setAsignaturaToDelete] = useState<Asignatura | null>(null);
    const [showFinalDeleteConfirm, setShowFinalDeleteConfirm] = useState(false);

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
            setSuccessMessage(`La asignatura &quot;${nombre}&quot; se creó con éxito.`);
            setShowSuccessAlert(true);
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

    const handleEliminarAsignatura = async () => {
        if (!asignaturaToDelete) return;

        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.deleteAsignatura)}${asignaturaToDelete.id}`, {
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
            setShowFinalDeleteConfirm(false);
            setShowDeleteConfirm(false);
            setSuccessMessage(`La asignatura &quot;${asignaturaToDelete.nombre}&quot; se eliminó con éxito.`);
            setShowSuccessAlert(true);
            setAsignaturaToDelete(null);
        } catch (error) {
            console.error('Error deleting asignatura:', error);
        }
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const filteredAsignaturas = asignaturas.filter(asignatura => {
        return (
            (filtroNombre === '' || asignatura.nombre.toLowerCase().includes(filtroNombre.toLowerCase())) &&
            (filtroCurso === '' || (asignatura.curso && asignatura.curso.nombre.toLowerCase().includes(filtroCurso.toLowerCase())))
        );
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAsignaturas = filteredAsignaturas.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAsignaturas.length / itemsPerPage);

    return (
        <Container>
            <h1 className="my-4">Gestionar Asignaturas</h1>
            {showSuccessAlert && (
                <Alert variant="success" onClose={() => setShowSuccessAlert(false)} dismissible>
                    {successMessage}
                </Alert>
            )}
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
                                autoComplete="off"
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
                            autoComplete="off"
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
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentAsignaturas.map((asignatura) => (
                                <tr key={asignatura.id}>
                                    <td>{asignatura.nombre}</td>
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
                                            onClick={() => {
                                                setAsignaturaToDelete(asignatura);
                                                setShowDeleteConfirm(true);
                                            }}
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

            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {asignaturaToDelete && (
                        <p>¿Estás seguro de que deseas eliminar la asignatura &quot;{asignaturaToDelete.nombre}&quot;?</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => {
                            setShowDeleteConfirm(false);
                            setShowFinalDeleteConfirm(true);
                        }}
                    >
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showFinalDeleteConfirm} onHide={() => setShowFinalDeleteConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirmar Eliminación Definitiva</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {asignaturaToDelete && (
                        <p>Vas a eliminar la asignatura &quot;{asignaturaToDelete.nombre}&quot;. ¿Estás seguro? No habrá vuelta atrás.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowFinalDeleteConfirm(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleEliminarAsignatura}
                    >
                        Eliminar
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default GestionAsignaturas;
