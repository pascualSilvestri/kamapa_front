'use client'

// RegAlumnoCurso.tsx

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table, Pagination, Modal } from 'react-bootstrap';
import { Curso, User } from '../../../../model/types';  // Asegúrate de ajustar la ruta según tu estructura de archivos
import { Environment } from '../../../../utils/EnviromenManager';

const RegAlumnoCurso: React.FC<{ params: { id: string } }> = ({ params }) => {
    const [cursoId, setCursoId] = useState<number | undefined>();
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
        fetchAlumnosDisponibles();
    }, []);

    const fetchCursos = async () => {
        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getCursosByInstitucion)}${params.id}`);
            if (!response.ok) {
                throw new Error('No se pudieron cargar los cursos');
            }
            const data = await response.json();
            setCursos(data);
        } catch (error) {
            console.error('Error al cargar cursos:', error);
        }
    };

    const fetchAlumnosDisponibles = async () => {
        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getUsuarioWhereRolIsAlumnoByInstitucion)}${params.id}`);
            if (!response.ok) {
                throw new Error('No se pudieron cargar los alumnos');
            }
            const data = await response.json();
            const alumnosConCurso = data.alumnos.map((alumno: User) => ({
                ...alumno,
                curso: cursos.find(curso => curso.id === alumno.cursoId) || { id: 0, nombre: 'Sin asignar' },
            }));
            setAlumnosDisponibles(alumnosConCurso);
        } catch (error) {
            console.error('Error al cargar alumnos disponibles:', error);
        }
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleAddAlumno = (alumnoId: number | string) => {
        const alumnoSeleccionado = alumnosDisponibles.find(a => a.id.toString() === alumnoId.toString());
        if (alumnoSeleccionado && !alumnosAgregados.some(a => a.id === alumnoId)) {
            setAlumnosAgregados([...alumnosAgregados, alumnoSeleccionado]);
            setAlumnosDisponibles(alumnosDisponibles.filter(a => a.id !== alumnoId));
        }
    };

    const handleRemoveAlumno = (alumnoId: number | string) => {
        const alumnoSeleccionado = alumnosAgregados.find(a => a.id === alumnoId);
        setAlumnosAgregados(alumnosAgregados.filter(a => a.id !== alumnoId));
        if (alumnoSeleccionado) {
            setAlumnosDisponibles([...alumnosDisponibles, alumnoSeleccionado]);
        }
    };

    const handleAsignarCursos = async () => {
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
                throw new Error(errorData.msg || 'Error al agregar alumnos al curso');
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

    const filteredAlumnos = alumnosDisponibles.filter(alumno => {
        const fullName = `${alumno.nombre} ${alumno.apellido}`.toLowerCase();
        return (
            fullName.includes(filtroAlumno.toLowerCase()) ||
            alumno.dni.toString().includes(filtroAlumno)
        );
    });

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAlumnos = filteredAlumnos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAlumnos.length / itemsPerPage);

    return (
        <Container>
            <Row>
                <Col md={6}>
                    <h1>Asignar Alumnos a Curso</h1>
                    <Form.Group>
                        <Form.Label>Seleccionar Curso</Form.Label>
                        <Form.Control as="select" value={cursoId || ''} onChange={(e) => setCursoId(parseInt(e.target.value))}>
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
                                <th>Curso Actual</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentAlumnos.map(alumno => (
                                <tr key={alumno.id}>
                                    <td>{alumno.nombre}</td>
                                    <td>{alumno.apellido}</td>
                                    <td>{alumno.curso.nombre}</td>
                                    <td>
                                        <Button
                                            variant="success"
                                            onClick={() => handleAddAlumno(alumno.id)}
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
                            <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => handlePageChange(i + 1)}>
                                {i + 1}
                            </Pagination.Item>
                        ))}
                    </Pagination>
                </Col>
                <Col md={6}>
                    <h2>Curso Seleccionado y Alumnos Agregados</h2>
                    {cursoId && (
                        <>
                            <h3>{cursos.find(c => c.id === cursoId)?.nombre}</h3>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Apellido</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alumnosAgregados.map(alumno => (
                                        <tr key={alumno.id}>
                                            <td>{alumno.nombre}</td>
                                            <td>{alumno.apellido}</td>
                                            <td>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => handleRemoveAlumno(alumno.id)}
                                                >
                                                    Eliminar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <Button
                                variant="primary"
                                onClick={handleAsignarCursos}
                                style={{ marginTop: '10px' }}
                            >
                                Asignar Cursos
                            </Button>
                        </>
                    )}
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
