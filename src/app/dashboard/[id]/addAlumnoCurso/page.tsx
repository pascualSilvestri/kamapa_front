'use client';

import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table, Pagination, Modal } from 'react-bootstrap';
import { Curso, User } from 'model/types';  // Asegúrate de que 'User' y 'Curso' estén definidos en 'model/types'
import { Environment } from 'utils/EnviromenManager';
import { useCicloLectivo } from 'context/CicloLectivoContext';

const AddAlumnoCurso = ({ params }: { params: { id: string } }) => {
    const [curso, setCurso] = useState<string>('');
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [alumnosDisponibles, setAlumnosDisponibles] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(3);
    const [filtroAlumno, setFiltroAlumno] = useState('');
    const [alumnosAgregados, setAlumnosAgregados] = useState<User[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const [cicloLectivo, setCicloLectivo] = useCicloLectivo();
    

    useEffect(() => {
        fetchCursos();
        fetchAlumnos();
    }, []);

    const fetchCursos = async () => {
        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getCursosByInstitucion)}${params.id}`);
        const data = await response.json();
        setCursos(Array.isArray(data) ? data : []);
    };

    const fetchAlumnos = async () => {
        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getUsuarioWhereRolIsAlumnoByInstitucionAndCurso)}${params.id}`);
        const data = await response.json();
        setAlumnosDisponibles(data.alumnos);
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleAddAlumno = (alumnoId: number | string) => {
        const alumnoSeleccionado = alumnosDisponibles.find(p => p.id.toString() === alumnoId.toString());
        if (alumnoSeleccionado && !alumnosAgregados.some(a => a.id === alumnoId)) {
            setAlumnosAgregados([...alumnosAgregados, alumnoSeleccionado]);
        }
    };

    const handleRemoveAlumno = (alumnoId: number | string) => {
        setAlumnosAgregados(alumnosAgregados.filter(a => a.id !== alumnoId));
    };

    const handleShowIds = async () => {
        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.addAlumnoToCurso)}`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify({
                    cursoId: curso,
                    alumnoIds: alumnosAgregados.map(a => a.id),
                    institucionId: params.id
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Error al agregar alumnos al curso');
            }

            const data = await response.json();
            fetchAlumnos();
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

    // Filtrado de alumnos según el valor del filtro
    const filteredAlumnos = alumnosDisponibles.filter(alumno => {
        const fullName = `${alumno.nombre} ${alumno.apellido}`.toLowerCase();
        return (
            fullName.includes(filtroAlumno.toLowerCase()) ||
            alumno.dni.toString().includes(filtroAlumno)
        );
    });

    // Logic for displaying current alumnos
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentAlumnos = filteredAlumnos.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredAlumnos.length / itemsPerPage);

    return (
        <Container>
            <Row>
                <Col md={6}>
                    <h1>Agregar Alumno a Curso</h1>
                    <Row>
                        <Col>
                            <Form.Group>
                                <Form.Label>Nombre del Curso</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={curso}
                                    onChange={(e) => setCurso(e.target.value)}
                                >
                                    <option value="">Seleccionar curso</option>
                                    {cursos.map((curso) => (
                                        <option key={curso.id} value={curso.id}>{curso.nombre}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <h2>Alumnos Disponibles</h2>
                            <Form.Group controlId="filtroAlumno">
                                <Form.Label>Filtrar Alumnos</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Filtrar por nombre, apellido o DNI"
                                    value={filtroAlumno}
                                    onChange={(e) => setFiltroAlumno(e.target.value)}
                                />
                            </Form.Group>
                            <Table striped bordered hover>
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Apellido</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentAlumnos.map(alumno => (
                                        <tr key={alumno.id}>
                                            <td>{alumno.nombre}</td>
                                            <td>{alumno.apellido}</td>
                                            <td>
                                                <Button
                                                    onClick={() => handleAddAlumno(alumno.id)}
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
                                                    }}
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
                    </Row>
                </Col>
                <Col md={6}>
                    <h2>Curso Seleccionado y Alumnos Agregados</h2>
                    {curso && (
                        <>
                            <h3>{cursos.find(c => c.id.toString() === curso)?.nombre}</h3>
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
                                                    onClick={() => handleRemoveAlumno(alumno.id)}
                                                    style={{
                                                        backgroundColor: 'red',
                                                        color: 'white',
                                                        padding: '0.4rem 1rem',
                                                        fontSize: '1rem',
                                                        transition: 'all 0.3s ease',
                                                        marginBottom: '10px',
                                                        border: '2px solid red',
                                                        cursor: 'pointer',
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'white';
                                                        e.currentTarget.style.color = 'black';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'red';
                                                        e.currentTarget.style.color = 'white';
                                                    }}
                                                >
                                                    Eliminar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                            <Button
                                onClick={handleShowIds}
                                style={{
                                    backgroundColor: 'blue',
                                    color: 'white',
                                    padding: '0.4rem 1rem',
                                    fontSize: '1rem',
                                    transition: 'all 0.3s ease',
                                    marginTop: '10px',
                                    border: '2px solid blue',
                                    cursor: 'pointer',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.color = 'black';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'blue';
                                    e.currentTarget.style.color = 'white';
                                }}
                            >
                                Asignar Cursos
                            </Button>
                        </>
                    )}
                </Col>
            </Row>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Mesaje</Modal.Title>
                </Modal.Header>
                <Modal.Body>{modalMessage}</Modal.Body>
            </Modal>
        </Container>
    );
};

export default AddAlumnoCurso;
