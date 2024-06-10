'use client';

import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table, Pagination, Modal } from 'react-bootstrap';
import { Asignatura, Curso, User } from 'model/types';  // Asegúrate de que 'User' esté definido en 'model/types'
import { Environment } from 'utils/EnviromenManager';

const AddAsignaturaCurso = ({ params }: { params: { id: string } }) => {
    const [curso, setCurso] = useState<string>('');
    const [asignatura, setAsignatura] = useState<string>('');
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
    const [cursoAsignado, setCursoAsignado] = useState<Curso | null>(null);
    const [asignaturaAsignada, setAsignaturaAsignada] = useState<Asignatura>(null);
    const [profesorAsignado, setProfesorAsignado] = useState<User>(null);
    const [cursosConAsignaturas, setCursosConAsignaturas] = useState<Curso[]>([]);
    const [profesores, setProfesores] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(3);
    const [filtroProfesor, setFiltroProfesor] = useState('');
    const [showModalModify, setShowModalModify] = useState(false);

    useEffect(() => {
        fetchCursos();
        fetchAsignaturas();
        fetchCursosConAsignaturas();
        fetchProfesores();
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

    const handleAddProfesor = (profesorId: number | string) => {
        const profesorSelecte = profesores.find(p => p.id.toString() === profesorId.toString());
        setProfesorAsignado(profesorSelecte);
    };

    const handleAsociar = async () => {
        if (cursoAsignado && asignaturaAsignada && profesorAsignado) {
            const cursoId = cursoAsignado.id;
            const asignaturaId = asignaturaAsignada.id;
            const profesorId = profesorAsignado.id;

            console.log('cursoId:', cursoId, 'asignaturaId:', asignaturaId, 'profesorId:', profesorId);

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
                console.log(data)
                throw new Error('Error al asociar asignaturas, curso y profesor');
            } else {
                const data = await response.json();
                console.log(data)
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
        setCursosConAsignaturas(Array.isArray(data) ? data : []);
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // Filtrado de profesores según el valor del filtro
    const filteredProfesores = profesores.filter(profesor => {
        const fullName = `${profesor.nombre} ${profesor.apellido}`.toLowerCase();
        return (
            fullName.includes(filtroProfesor.toLowerCase()) ||
            profesor.dni.toString().includes(filtroProfesor)
        );
    });

    // Logic for displaying current professors
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentProfessors = filteredProfesores.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredProfesores.length / itemsPerPage);

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
                                {/* <th>Acción</th> */}
                            </tr>
                        </thead>
                        <tbody>
                            {cursosConAsignaturas.map((c) => (
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
                                    {/* <td><Button onClick={() => {
                                        setShowModalModify(true);
                                        setCursoAsignado(c);
                                        setAsignaturaAsignada(c.asignaturas[0]);
                                        setProfesorAsignado(c.asignaturas[0].usuarioAsignatura[0]);
                                    }}>Modificar</Button></td> */}
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
            {/* <Modal show={showModalModify} onHide={() => setShowModalModify(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Modificar Asignatura</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <h2>{cursoAsignado == null ? '' : cursoAsignado.nombre}</h2>
                        <Form.Group className="mb-3" controlId="formNombreModal">
                            <Row>
                                <Col>
                                    <Form.Label>Asignatura</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Label>Profesor</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Label>Actions</Form.Label>
                                </Col>
                            </Row>
                            {cursoAsignado && cursoAsignado.asignaturas.map(a => (
                                <Row>
                                    <Col>
                                        <Form.Control
                                            as="select"
                                            value={a ? a.id : ''}
                                            onChange={(e) => setAsignaturaAsignada(() => asignaturas.find(a => a.id === parseInt(e.target.value)))}
                                        >
                                            <option value="">Seleccionar asignatura</option>
                                            {asignaturas && asignaturas.map((asignatura) => (
                                                <option key={asignatura.id} value={asignatura.id}>{asignatura.nombre}</option>
                                            ))}
                                        </Form.Control>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            as="select"
                                            value={a.usuarioAsignatura ? a.usuarioAsignatura[0].id : ''}
                                            onChange={(e) => setProfesorAsignado(() => currentProfessors.find(a => a.id === parseInt(e.target.value)))}
                                        >
                                            <option value="">Seleccionar Profesor</option>
                                            {currentProfessors && currentProfessors.map((profesor) => (
                                                <option key={profesor.id} value={profesor.id}>{profesor.nombre}</option>
                                            ))}
                                        </Form.Control>
                                    </Col>
                                    <Col>
                                        <Button variant="primary" onClick={() => handleModificarAsignaturas()}>
                                            Modificar
                                        </Button>
                                    </Col>
                                </Row>
                            ))}
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModalModify(false)}>
                        Cancelar
                    </Button>
                </Modal.Footer>
            </Modal> */}
        </Container>
    );
};

export default AddAsignaturaCurso;
