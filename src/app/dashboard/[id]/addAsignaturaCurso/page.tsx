'use client';

import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table, Pagination } from 'react-bootstrap';
import { Asignatura, Curso, User } from 'model/types';
import { Environment } from 'utils/EnviromenManager';

const AddAsignaturaCurso = ({ params }) => {
    const [curso, setCurso] = useState('');
    const [asignatura, setAsignatura] = useState('');
    const [cursos, setCursos] = useState([]);
    const [asignaturas, setAsignaturas] = useState([]);
    const [cursoAsignado, setCursoAsignado] = useState(null);
    const [asignaturaAsignada, setAsignaturaAsignada] = useState(null);
    const [profesorAsignado, setProfesorAsignado] = useState(null);
    const [cursosConAsignaturas, setCursosConAsignaturas] = useState([]);
    const [profesores, setProfesores] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(3);
    const [filtroProfesor, setFiltroProfesor] = useState('');
    const [showModalModify, setShowModalModify] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            await fetchCursos();
            await fetchAsignaturas();
            await fetchCursosConAsignaturas();
            await fetchProfesores();
        };

        fetchData();
    }, []);

    const fetchCursos = async () => {
        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getCursosByInstitucion)}${params.id}`);
        const data = await response.json();
        setCursos(Array.isArray(data) ? data : []);
    };

    const fetchAsignaturas = async () => {
        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getAsignaturaByInstitucion)}${params.id}`);
        const data = await response.json();
        setAsignaturas(Array.isArray(data) ? data : []);
    };

    const fetchProfesores = async () => {
        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getProfesoresByInstitucion)}${params.id}`);
        const data = await response.json();
        setProfesores(data.usuarios);
    };

    const handleAddCurso = () => {
        if (curso) {
            const cursoSelecte = cursos.find(c => c.id.toString() === curso);
            setCursoAsignado(cursoSelecte || null);
            setCurso('');
        }
    };

    const handleAddAsignatura = () => {
        if (asignatura) {
            const asignaturaSelecte = asignaturas.find(a => a.id.toString() === asignatura);
            if (asignaturaSelecte) {
                setAsignaturaAsignada(asignaturaSelecte);
            }
            setAsignatura('');
        }
    };

    const handleAddProfesor = (profesorId) => {
        const profesorSelecte = profesores.find(p => p.id.toString() === profesorId.toString());
        setProfesorAsignado(profesorSelecte);
    };

    const handleAsociar = async () => {
        if (cursoAsignado && asignaturaAsignada && profesorAsignado) {
            const cursoId = cursoAsignado.id;
            const asignaturaId = asignaturaAsignada.id;
            const profesorId = profesorAsignado.id;
            console.log(cursoId, asignaturaId, profesorId);

            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.asociarAsignaturaCurso)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    asignaturaId: asignaturaId,
                    cursoId: cursoId,
                    profesorId: profesorId,
                }),
            });

            if (response.status !== 200) {
                const data = await response.json();
                console.log(data);
                throw new Error('Error al asociar asignaturas, curso y profesor');
            } else {
                const data = await response.json();
                console.log(data);
                cleandata();
                fetchCursosConAsignaturas();
            }
        }
    };

    function cleandata() {
        setCursoAsignado(null);
        setAsignaturaAsignada(null);
        setProfesorAsignado(null);
    }

    const fetchCursosConAsignaturas = async () => {
        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getCursosAndAsignaturasByInstitucion)}${params.id}`);
        const data = await response.json();
        console.log(data);
        setCursosConAsignaturas(Array.isArray(data) ? data : []);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const filteredProfesores = profesores && profesores.filter(profesor => {
        const fullName = `${profesor.nombre} ${profesor.apellido}`.toLowerCase();
        return (
            fullName.includes(filtroProfesor.toLowerCase()) ||
            profesor.dni.toString().includes(filtroProfesor)
        );
    }) || [];

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProfessors = filteredProfesores.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProfesores.length / itemsPerPage);

    // Transformar los datos de la nueva estructura a la estructura antigua
    const cursosTransformados = cursosConAsignaturas.map(curso => ({
        ...curso,
        asignaturas: curso.cursoAsignaturaProfesorCicloLectivo.map(cursoAsigProf => ({
            ...cursoAsigProf.asignatura,
            usuarioAsignatura: [cursoAsigProf.usuario]
        }))
    }));

    return (
        <Container>
            <h1>Agregar Asignaturas a Cursos</h1>
            <Row>
                <Col>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Curso</th>
                                <th>Asignaturas</th>
                                <th>Profesor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cursoAsignado && (
                                <tr>
                                    <td>{cursoAsignado.nombre}</td>
                                    <td>
                                        {asignaturaAsignada
                                            ? asignaturaAsignada.nombre
                                            : 'No asignada'}
                                    </td>
                                    <td>
                                        {profesorAsignado && profesorAsignado.nombre + ' ' + profesorAsignado.apellido}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button onClick={handleAsociar} style={{
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
                        }}>Asociar</Button>
                    <Button onClick={cleandata} style={{
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
                        }}>Borrar</Button>
                </Col>
            </Row>
            <Row>
                <Col md={6}>
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
                            <Form.Group>
                                <Form.Label>Nombre de la Asignatura</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={asignatura}
                                    onChange={(e) => setAsignatura(e.target.value)}
                                >
                                    <option value="">Seleccionar asignatura</option>
                                    {asignaturas && asignaturas.map((asignatura) => (
                                        <option key={asignatura.id} value={asignatura.id}>{asignatura.nombre}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                            <Button onClick={handleAddAsignatura} style={{
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
                                }}>Agregar Asignatura</Button>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <h2>Profesores Disponibles</h2>
                            <Form.Group controlId="filtroProfesor">
                                <Form.Label>Filtrar Profesores</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Filtrar por nombre, apellido o DNI"
                                    value={filtroProfesor}
                                    onChange={(e) => setFiltroProfesor(e.target.value)}
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
                                    {currentProfessors.map(profesor => (
                                        <tr key={profesor.id}>
                                            <td>{profesor.nombre}</td>
                                            <td>{profesor.apellido}</td>
                                            <td>
                                                <Button onClick={() => handleAddProfesor(profesor.id)} style={{
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
                                                    }}>Agregar</Button>
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
                    <h2>Cursos con Asignaturas y Profesores Asociados</h2>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Curso</th>
                                <th>Asignaturas</th>
                                <th>Profesor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cursosTransformados.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.nombre}</td>
                                    <td>{c.asignaturas.map(a => (
                                        <li key={a.id}>
                                            {a.nombre}
                                        </li>
                                    ))}</td>
                                    <td>{c.asignaturas.map(a => (
                                        <li key={a.id}>
                                            {a.usuarioAsignatura ? `${a.usuarioAsignatura[0].nombre} ${a.usuarioAsignatura[0].apellido}` : 'No asignado'}
                                        </li>
                                    ))}</td>
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
