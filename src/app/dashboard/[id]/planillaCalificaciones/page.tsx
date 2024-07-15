'use client';
import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table, Image } from 'react-bootstrap';
import { Curso, User, Nota, Periodo } from 'model/types';
import { Environment } from 'utils/EnviromenManager';
import { useUserContext } from 'context/userContext';
import { useCicloLectivo } from 'context/CicloLectivoContext';
import { useInstitucionSelectedContext } from 'context/userContext';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PlanillaCalificaciones = ({ params }: { params: { id: string } }) => {
    const [cursoSeleccionado, setCursoSeleccionado] = useState<string>('');
    const [asignatura, setAsignatura] = useState<string>('');
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [asignaturas, setAsignaturas] = useState<Curso[]>([]);
    const [alumnos, setAlumnos] = useState<User[]>([]);
    const [nota, setNota] = useState<{ [key: string]: string }>({});
    const [user, setUser] = useUserContext();
    const [cicloLectivo] = useCicloLectivo();
    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [institucionSelected] = useInstitucionSelectedContext();

    useEffect(() => {
        fetchCursos();
        fetchPeriodos();
    }, []);

    useEffect(() => {
        if (asignatura && cursoSeleccionado) {
            fetchAlumnos();
        }
    }, [asignatura, cursoSeleccionado]);

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

    const handleAddNota = async (alumnoId: number | string, periodoId: number | string, nota: string) => {
        const response = await fetch(`${Environment.getEndPoint(Environment.endPoint.createNota)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                asignaturaId: Number(asignatura),
                alumnoId: Number(alumnoId),
                nota: Number(nota),
                periodoId: Number(periodoId),
                institucionId: params.id,
            })
        });
        await response.json();
        fetchAlumnos();
    };

    const calcularPromedio = (alumnoNotas: Nota[]) => {
        const total = alumnoNotas.reduce((acc, nota) => acc + (nota.nota || 0), 0);
        return (total / alumnoNotas.length).toFixed(2);
    };

    const getNotasPorPeriodo = (alumno: User, periodoId: number | string) => {
        return (alumno.notas || [])
            .filter(nota => nota.periodoId === periodoId)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    };

    const printPDF = () => {
        const input = document.getElementById('calificaciones-table');
        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF();
            pdf.addImage(imgData, 'JPEG', 0, 0);
            pdf.save('calificaciones.pdf');
        });
    };

    return (
        <Container fluid>
            {/* Fila 1: Nombre de la Escuela y Logo */}
            <Row className="align-items-center mb-3">
                <Col>
                    <h1>{institucionSelected.nombre}</h1>
                </Col>
                <Col xs="auto">
                    <Image
                        src={institucionSelected.logo || '/Logo.png'}
                        alt='logo'
                        width={50}
                        height={50}
                        className='d-inline-block align-top'
                        style={{ borderRadius: '50%' }}
                    />
                </Col>
            </Row>

            {/* Fila 2: Título de la Planilla */}
            <Row className="text-center mb-3">
                <Col>
                    <h2>Planilla de Calificaciones</h2>
                </Col>
            </Row>

            {/* Fila 3: Información del Curso */}
            <Row className="mb-3">
                <Col md={4}>
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
                <Col md={4}>Ciclo Lectivo: {cicloLectivo.nombre}</Col>
                <Col md={4}>Turno: {/* Agregar lógica para obtener el turno */}</Col>
            </Row>

            {/* Fila 4: Espacio Curricular y Docente */}
            <Row className="mb-3">
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
                <Col md={6}>Docente Responsable: {user.nombre} {user.apellido}</Col>
            </Row>

            {/* Tabla de Calificaciones */}
            <div className="table-responsive" id="calificaciones-table">
                <Table bordered hover>
                    <thead>
                        <tr>
                            <th rowSpan={2}>Orden N°</th>
                            <th rowSpan={2}>Nombre y Apellido</th>
                            {periodos.map((periodo) => (
                                <th key={periodo.id} colSpan={8}>{periodo.nombre}</th>
                            ))}
                            <th rowSpan={2}>Calificación Final</th>
                            <th rowSpan={2}>Recuperación Extraordinaria DIC</th>
                            <th rowSpan={2}>Examen Regular FEB</th>
                            <th rowSpan={2}>Calificación Definitiva</th>
                        </tr>
                        <tr>
                            {periodos.map((periodo) => (
                                <React.Fragment key={periodo.id}>
                                    <th>Calificación 1</th>
                                    <th>Calificación 2</th>
                                    <th>Calificación 3</th>
                                    <th>Calificación 4</th>
                                    <th>Calificación 5</th>
                                    <th>Promedio</th>
                                    <th>Periodo de Recuperación</th>
                                    <th>Calificación Parcial</th>
                                </React.Fragment>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {alumnos
                            .sort((a, b) => a.apellido.localeCompare(b.apellido))
                            .map((alumno, index) => (
                                <tr key={alumno.id}>
                                    <td>{index + 1}</td>
                                    <td>{alumno.nombre} {alumno.apellido}</td>
                                    {periodos.map((periodo) => (
                                        <React.Fragment key={periodo.id}>
                                            {[1, 2, 3, 4, 5].map((notaIndex) => (
                                                <td key={`${alumno.id}-${periodo.id}-${notaIndex}`}>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        value={nota[`${alumno.id}-${periodo.id}-${notaIndex}`] || ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (value === '' || (Number(value) >= 0 && Number(value) <= 10)) {
                                                                setNota({ ...nota, [`${alumno.id}-${periodo.id}-${notaIndex}`]: value });
                                                            }
                                                        }}
                                                    />
                                                </td>
                                            ))}
                                            <td>{calcularPromedio(getNotasPorPeriodo(alumno, periodo.id))}</td>
                                            <td>{/* Periodo de Recuperación */}</td>
                                            <td>{/* Calificación Parcial */}</td>
                                        </React.Fragment>
                                    ))}
                                    <td>{calcularPromedio(alumno.notas || [])}</td>
                                    <td>{/* Recuperación Extraordinaria DIC */}</td>
                                    <td>{/* Examen Regular FEB */}</td>
                                    <td>{/* Calificación Definitiva */}</td>
                                </tr>
                            ))}
                    </tbody>
                </Table>
            </div>
            <Button className='btn-info m-1'
                onClick={() => {
                    // Lógica para guardar todas las notas
                    Object.entries(nota).forEach(([key, value]) => {
                        const [alumnoId, periodoId, notaIndex] = key.split('-');
                        handleAddNota(alumnoId, periodoId, value);
                    });
                }}
            >
                Guardar Todas las Notas
            </Button>
            <br />
            <Button onClick={printPDF} className='btn-warning m-1'>
                Imprimir en PDF
            </Button>
            <br />
            <h1>OBSERVACIONES</h1>
            <hr />
            <h3>* Para corregir una calificación en caso de error, por favor, presente una nota escrita en persona. La solicitud debe incluir el nombre del alumno, DNI, curso y materia para la cual se solicita la corrección (una nota escrita por alumno).</h3>
            <br />
        </Container>
    );
};

export default PlanillaCalificaciones;
