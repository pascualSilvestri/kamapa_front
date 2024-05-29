'use client';

import { Asignatura, Curso } from 'model/types';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table, Modal } from 'react-bootstrap';
import { Environment } from 'utils/EnviromenManager';

const GestionAsignaturas = ({ params }: { params: { id: string } }) => {
    const [nombre, setNombre] = useState('');
    const [cursoAsociado, setCursoAsociado] = useState<Curso | undefined>();
    const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
    const [filtroNombre, setFiltroNombre] = useState('');
    const [filtroCurso, setFiltroCurso] = useState('');
    const [showModalModify, setShowModalModify] = useState(false);
    const [currentAsignaturaId, setCurrentAsignaturaId] = useState<number | null>(null);

    useEffect(() => {
        fetchAsignaturas();
    }, []);
    console.log(asignaturas);

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

    const handleCrearAsignatura = async () => {

        const res = await fetch(`${Environment.getEndPoint(Environment.endPoint.crearAsignatura)}`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nombre: nombre,
                institucionId: params.id
            })
        })

        if(res.status !== 200){
            throw new Error('No se pudo crear la asignatura');
        }else{
            const response = await res.json();
            fetchAsignaturas();
        }

        setNombre('');
        setCursoAsociado(undefined);
    };

    const handleModificarAsignatura = (id: number) => {
        const asignatura = asignaturas.find(asig => asig.id === id);
        if (asignatura) {
            setNombre(asignatura.nombre);
            // Asignar otros campos si los hay
            setCurrentAsignaturaId(id);
            setShowModalModify(true);
        }
    };

    const handleSubmitModificarAsignatura = async () => {
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

            if (res.status !== 200) {
                throw new Error('No se pudo modificar la asignatura');
            } else {
                fetchAsignaturas();
                setShowModalModify(false);
                setNombre('');
                setCurrentAsignaturaId(null);
            }
        }
    };

    const handleEliminarAsignatura = async (id: number) => {
        const fecth = await fetch(`${Environment.getEndPoint(Environment.endPoint.deleteAsignatura)}${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (fecth.status !== 200) {
            alert('Error al crear curso');
            return;
        } else {
            const response = await fecth.json();
            console.log(response);
            fetchAsignaturas();
        }
        console.log('Eliminar curso con ID:', id);
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
                            {filteredAsignaturas.map((asignatura) => (
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
