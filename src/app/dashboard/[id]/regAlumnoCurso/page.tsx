'use client'
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Table, Pagination, Modal } from 'react-bootstrap';
import { Curso, User } from 'model/types';  // Asegúrate de que 'User' y 'Curso' estén definidos correctamente en 'model/types'
import { Environment } from 'utils/EnviromenManager';

const RegAlumnoCurso = ({ params }: { params: { id: string } }) => {
    const [cursoId, setCursoId] = useState<string>('');
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [alumnosDisponibles, setAlumnosDisponibles] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5);
    const [filtroAlumno, setFiltroAlumno] = useState('');
    const [alumnosAgregados, setAlumnosAgregados] = useState<User[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    useEffect(() => {
        fetchCursos();
        fetchAlumnos();
    }, []);

    const fetchCursos = async () => {
        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getCursosByInstitucion)}${params.id}`);
            if (!response.ok) {
                throw new Error('Error fetching courses');
            }
            const data = await response.json();
            setCursos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching courses:', error);
            // Handle error as needed
        }
    };

    const fetchAlumnos = async () => {
        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getUsuarioWhereRolIsAlumnoByInstitucion)}${params.id}`);
            if (!response.ok) {
                throw new Error('Error fetching students');
            }
            const data = await response.json();
            setAlumnosDisponibles(data.alumnos);
        } catch (error) {
            console.error('Error fetching students:', error);
            // Handle error as needed
        }
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleAddAlumno = (alumno: User) => {
        if (!alumnosAgregados.some(a => a.id === alumno.id)) {
            setAlumnosAgregados([...alumnosAgregados, alumno]);
        }
    };

    const handleRemoveAlumno = (alumno: User) => {
        setAlumnosAgregados(alumnosAgregados.filter(a => a.id !== alumno.id));
    };


    const handleAssignAlumnos = async () => {
        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.addAlumnoToCurso)}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify({
                    cursoId: cursoId,
                    alumnoIds: alumnosAgregados.map(a => a.id),
                    institucionId: params.id
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Error adding students to course');
            }

            const data = await response.json();
            setModalMessage(data.msg);
            setShowModal(true);
            setTimeout(() => {
                setShowModal(false);
            }, 3000);

        } catch (error) {
            setModalMessage(error.message);
            setShowModal(true);
            setTimeout(() => {
                setShowModal(false);
            }, 3000);
        }
    };

    // Filter students based on the filter value
    const filteredAlumnos = alumnosDisponibles.filter(alumno => {
        const fullName = `${alumno.nombre} ${alumno.apellido}`.toLowerCase();
        return (
            fullName.includes(filtroAlumno.toLowerCase()) ||
            alumno.dni.toString().includes(filtroAlumno)
        );
    });

    // Logic for displaying current students
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAlumnos = filteredAlumnos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAlumnos.length / itemsPerPage);

    return (
        <Container>
            <Row>
                <Col md={6}>
                    <h1>Registrar Alumnos en Curso</h1>
                    <Form.Group>
                        <Form.Label>Seleccionar Curso</Form.Label>
                        <Form.Control
                            as="select"
                            value={cursoId}
                            onChange={(e) => setCursoId(e.target.value)}
                        >
                            <option value="">Seleccionar curso</option>
                            {cursos.map(curso => (
                                <option key={curso.id} value={curso.id}>{curso.nombre}</option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <h2>Alumnos Disponibles</h2>
                    <Form.Group controlId="filtroAlumno">
                        <Form.Label>Filtrar Alumnos</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Buscar por nombre, apellido o DNI"
                            value={filtroAlumno}
                            onChange={(e) => setFiltroAlumno(e.target.value)}
                        />
                    </Form.Group>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>DNI</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentAlumnos.map(alumno => (
                                <tr key={alumno.id}>
                                    <td>{alumno.nombre}</td>
                                    <td>{alumno.apellido}</td>
                                    <td>{alumno.dni}</td>
                                    <td>
                                        <Button
                                            variant="success"
                                            onClick={() => handleAddAlumno(alumno)}
                                        >
                                            Agregar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Pagination>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <Pagination.Item
                                key={i + 1}
                                active={i + 1 === currentPage}
                                onClick={() => handlePageChange(i + 1)}
                            >
                                {i + 1}
                            </Pagination.Item>
                        ))}
                    </Pagination>
                </Col>
                <Col md={6}>
                    <h2>Curso Seleccionado y Alumnos Agregados</h2>
                    <h3>{cursos.find(curso => curso.id === Number(cursoId))?.nombre}</h3>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>DNI</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alumnosAgregados.map(alumno => (
                                <tr key={alumno.id}>
                                    <td>{alumno.nombre}</td>
                                    <td>{alumno.apellido}</td>
                                    <td>{alumno.dni}</td>
                                    <td>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleRemoveAlumno(alumno)}
                                        >
                                            Eliminar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Button variant="primary" onClick={handleAssignAlumnos}>
                        Asignar Alumnos
                    </Button>
                </Col>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Mensaje</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modalMessage}</Modal.Body>
            </Modal>
        </Container>
    );
};

export default RegAlumnoCurso;
