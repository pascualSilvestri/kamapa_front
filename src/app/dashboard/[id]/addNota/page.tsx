'use client';
import { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { Curso, User, Nota, Periodo } from 'model/types';  // Asegúrate de que 'User', 'Curso' y 'Nota' estén definidos en 'model/types'
import { Environment } from 'utils/EnviromenManager';
import { useUserContext } from 'context/userContext';
import { useCicloLectivo } from 'context/CicloLectivoContext';

const AddNotasAlumno = ({ params }: { params: { id: string } }) => {
    const [cursoSeleccionado, setCursoSeleccionado] = useState<string>('');
    const [asignatura, setAsignatura] = useState<string>('');
    const [periodo, setPeriodo] = useState<string>('');
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [asignaturas, setAsignaturas] = useState<Curso[]>([]);
    const [alumnos, setAlumnos] = useState<User[]>([]);
    const [nota, setNota] = useState<{ [key: string]: string }>({});
    const [user, setUser] = useUserContext();
    const [cicloLectivo, setCicloLectivo] = useCicloLectivo();
    const [periodos, setPeriodos] = useState<Periodo[]>([]);

    useEffect(() => {
        fetchCursos();
        fetchPeriodos();
    }, []);

    useEffect(() => {
        if (asignatura && cursoSeleccionado) {
            fetchAlumnos();
        }
    }, [asignatura, cursoSeleccionado]);

    useEffect(() => {
        if (periodo) {
            fetchAlumnos();
        }
    }, [periodo]);

    const fetchCursos = async () => {
        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getCursosForUsuario)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuarioId: user.id,
                cicloLectivoId: cicloLectivo.id,
            })
        });
        const data = await response.json();
        setCursos(Array.isArray(data) ? data : []);
    };

    const fetchPeriodos = async () => {
        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getPeriodosByCicloElectivo)}${cicloLectivo.id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const data = await response.json();
        setPeriodos(data);
    };

    const fetchAsignaturas = async (cursoId: string) => {
        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getAsignaturaForCursoByProfesor)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                usuarioId: user.id,
                institucionId: params.id,
                cursoId: Number(cursoId),
            })
        });
        const data = await response.json();
        setAsignaturas(Array.isArray(data) ? data : []);
    };

    const fetchAlumnos = async () => {
        try {
            const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getNotasByAsignatura)}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    asignaturaId: Number(asignatura),
                    cursoId: Number(cursoSeleccionado),
                    cicloLectivoId: Number(cicloLectivo.id),
                })
            });
            const data = await response.json();
            setAlumnos(Array.isArray(data) ? data.map(a => a.usuario) : []);
        } catch (error) {
            console.error('Error fetching alumnos:', error);
            setAlumnos([]);  // Ensure alumnos is an array in case of error
        }
    };

    const handleAddNota = async (alumnoId: number | string) => {
        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.createNota)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                asignaturaId: Number(asignatura),
                alumnoId: Number(alumnoId),
                nota: Number(nota[alumnoId]),
                periodoId: Number(periodo),
                institucionId: params.id,
            })
        });
        const data = await response.json();
        console.log(data);
        fetchAlumnos();
    };

    const calcularPromedio = (alumnoNotas: Nota[]) => {
        const total = alumnoNotas.reduce((acc, nota) => acc + (nota.nota || 0), 0);
        return (total / alumnoNotas.length).toFixed(2);
    };

    const getNotasPorPeriodo = (alumno: User) => {
        return (alumno.notas || [])
            .filter(nota => nota.periodoId === Number(periodo) && nota.asignaturaId === Number(asignatura))
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    };

    return (
        <Container>
            <Row>
                <Col md={12}>
                    <h1>Agregar Notas a Alumnos</h1>
                    <Row>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Curso</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={cursoSeleccionado}
                                    onChange={(e) => {
                                        setCursoSeleccionado(e.target.value);
                                        fetchAsignaturas(e.target.value);
                                    }}
                                >
                                    <option value="">Seleccionar curso</option>
                                    {cursos.map((curso) => (
                                        <option key={curso.id} value={curso.id}>{curso.nombre}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Asignatura</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={asignatura}
                                    onChange={(e) => setAsignatura(e.target.value)}
                                    disabled={!cursoSeleccionado}
                                >
                                    <option value="">Seleccionar asignatura</option>
                                    {asignaturas.map((asignatura) => (
                                        <option key={asignatura.id} value={asignatura.id}>{asignatura.nombre}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Periodo Lectivo</Form.Label>
                                <Form.Control
                                    as="select"
                                    value={periodo}
                                    onChange={(e) => setPeriodo(e.target.value)}
                                >
                                    <option value="">Seleccionar periodo</option>
                                    {periodos.map((p) => (
                                        <option key={p.id} value={p.id}>{p.nombre}</option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <h2>Alumnos</h2>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Apellido</th>
                                <th>Nota</th>
                                <th>Acción</th>
                                {Array.from({ length: 5 }).map((_, idx) => (
                                    <th key={idx}>{`Nota ${idx + 1}`}</th>
                                ))}
                                <th>Promedio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.isArray(alumnos) && alumnos.map(alumno => (
                                <tr key={alumno.id}>
                                    <td>{alumno.nombre}</td>
                                    <td>{alumno.apellido}</td>
                                    <td>
                                        <Form.Control
                                            type="number"
                                            min="0"
                                            max="10"
                                            value={nota[alumno.id] || ''}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '' || (Number(value) >= 0 && Number(value) <= 10)) {
                                                    setNota({ ...nota, [alumno.id]: value });
                                                }
                                            }}
                                        />
                                    </td>
                                    <td>
                                        <Button
                                            onClick={() => handleAddNota(alumno.id)}
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
                                            Agregar Nota
                                        </Button>
                                    </td>
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                        <td key={idx}>
                                            {getNotasPorPeriodo(alumno)[idx] ? getNotasPorPeriodo(alumno)[idx].nota : ''}
                                        </td>
                                    ))}
                                    <td>
                                        {calcularPromedio(getNotasPorPeriodo(alumno))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Container>
    );
};

export default AddNotasAlumno;
