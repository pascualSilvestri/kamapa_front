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
    const [notas, setNotas] = useState<{ [key: string]: Nota[] }>({});
    const [nota, setNota] = useState<{ [key: string]: string }>({});
    const [ user, setUser ] = useUserContext();
    const [cicloLectivo, setCicloLectivo] = useCicloLectivo();
    const [periodos, setPeriodos] = useState<Periodo[]>([]);

    useEffect(() => {
        fetchCursos();
        fetchAlumnos();
        fetchPeriodos();
    }, []);

    const fetchCursos = async () => {
        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getCursosForUsuario)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({

                usuarioId: user.id,
                institucionId: params.id,
                

            })
        });
        const data = await response.json();
        console.log(data);
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
        console.log(data);
        setPeriodo(data);
    };

    const fetchAsignaturas = async (cursoId: string) => {
        // Reemplaza esta URL con la correcta para obtener las asignaturas por curso
        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getAsignaturaForCursoByProfesor)}`,{
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
        console.log(data);
        setAsignaturas(Array.isArray(data) ? data : []);
    };

    const fetchAlumnos = async () => {
        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.getUsuarioWhereRolIsAlumnoByInstitucion)}${params.id}`);
        const data = await response.json();
        setAlumnos(data.usuarios);
    };

    const handleAddNota = (alumnoId: number | string) => {
        const nuevaNota = parseFloat(nota[alumnoId] || '0');
        if (!isNaN(nuevaNota)) {
            const nuevaNotaObj: Nota = {
                id: Date.now(),  // Genera un ID temporal para la nota
                nota: nuevaNota,
                fecha: new Date().toISOString(),
                usuarioId: Number(alumnoId),
                asignaturaId: Number(asignatura),
                periodoId: Number(periodo),
            };

            setNotas(prevNotas => ({
                ...prevNotas,
                [alumnoId]: [
                    ...(prevNotas[alumnoId] || []),
                    nuevaNotaObj
                ]
            }));
            setNota({ ...nota, [alumnoId]: '' });
        }
    };

    const calcularPromedio = (alumnoNotas: Nota[]) => {
        const total = alumnoNotas.reduce((acc, nota) => acc + (nota.nota || 0), 0);
        return (total / alumnoNotas.length).toFixed(2);
    };

    const getNotasPorPeriodo = (alumnoId: number | string, periodoId: number | string) => {
        return (notas[alumnoId] || []).filter(nota => nota.periodoId === periodoId);
    };

    const getPeriodos = (alumnoId: number | string) => {
        const periodosSet = new Set((notas[alumnoId] || []).map(nota => nota.periodoId));
        return Array.from(periodosSet);
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
                                    {/* Aquí se deben cargar los periodos lectivos */}
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
                                <th>Notas Agregadas (por Periodo)</th>
                                <th>Promedio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {alumnos.map(alumno => (
                                <tr key={alumno.id}>
                                    <td>{alumno.nombre}</td>
                                    <td>{alumno.apellido}</td>
                                    <td>
                                        <Form.Control
                                            type="number"
                                            value={nota[alumno.id] || ''}
                                            onChange={(e) => setNota({ ...nota, [alumno.id]: e.target.value })}
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
                                    <td>
                                        <Table bordered>
                                            <thead>
                                                <tr>
                                                    {getPeriodos(alumno.id).map((periodoId, index) => (
                                                        <th key={index}>{`Periodo ${periodoId}`}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    {getPeriodos(alumno.id).map((periodoId, index) => (
                                                        <td key={index}>
                                                            <Table bordered>
                                                                <thead>
                                                                    <tr>
                                                                        {(getNotasPorPeriodo(alumno.id, periodoId) || []).map((_, idx) => (
                                                                            <th key={idx}>{`Nota ${idx + 1}`}</th>
                                                                        ))}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    <tr>
                                                                        {(getNotasPorPeriodo(alumno.id, periodoId) || []).map((nota, idx) => (
                                                                            <td key={idx}>{nota.nota}</td>
                                                                        ))}
                                                                    </tr>
                                                                </tbody>
                                                            </Table>
                                                        </td>
                                                    ))}
                                                </tr>
                                            </tbody>
                                        </Table>
                                    </td>
                                    <td>
                                        {calcularPromedio(notas[alumno.id] || [])}
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
