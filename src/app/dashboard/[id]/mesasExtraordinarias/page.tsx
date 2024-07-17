'use client';
import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Table } from "react-bootstrap";
import { Curso, User, Nota, Periodo } from "model/types";
import { Environment } from "utils/EnviromenManager";
import { useUserContext } from "context/userContext";
import { useCicloLectivo } from "context/CicloLectivoContext";

const MesasExtraordinarias = ({ params }: { params: { id: string } }) => {
    const [cursoSeleccionado, setCursoSeleccionado] = useState<string>("");
    const [asignatura, setAsignatura] = useState<string>("");
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [asignaturas, setAsignaturas] = useState<Curso[]>([]);
    const [alumnos, setAlumnos] = useState<User[]>([]);
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

    const fetchCursos = async () => {
        const response = await fetch(
            `${Environment.getEndPoint(Environment.endPoint.getCursosForUsuario)}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    usuarioId: user.id,
                    cicloLectivoId: cicloLectivo.id,
                }),
            }
        );
        const data = await response.json();
        setCursos(Array.isArray(data) ? data : []);
    };

    const fetchPeriodos = async () => {
        const response = await fetch(
            `${Environment.getEndPoint(Environment.endPoint.getPeriodosByCicloElectivo)}${cicloLectivo.id}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const data = await response.json();
        setPeriodos(data);
    };

    const fetchAsignaturas = async (cursoId: string) => {
        const response = await fetch(
            `${Environment.getEndPoint(Environment.endPoint.getAsignaturaForCursoByProfesor)}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    usuarioId: user.id,
                    institucionId: params.id,
                    cursoId: Number(cursoId),
                }),
            }
        );
        const data = await response.json();
        setAsignaturas(Array.isArray(data) ? data : []);
    };

    const fetchAlumnos = async () => {
        try {
            const response = await fetch(
                `${Environment.getEndPoint(Environment.endPoint.getNotasByAsignatura)}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        asignaturaId: Number(asignatura),
                        cursoId: Number(cursoSeleccionado),
                        cicloLectivoId: Number(cicloLectivo.id),
                    }),
                }
            );
            const data = await response.json();
            const alumnosConNotasBajas = Array.isArray(data)
                ? data
                    .filter((a) => getCalificacionParcialPromedio(a.usuario.notas) < 6)
                    .map((a) => a.usuario)
                    .sort((a, b) => a.apellido.localeCompare(b.apellido))
                : [];
            setAlumnos(alumnosConNotasBajas);
        } catch (error) {
            console.error("Error fetching alumnos:", error);
            setAlumnos([]);
        }
    };

    const getCalificacionParcialPromedio = (notas: Nota[]) => {
        const notasPorPeriodo = periodos.map((periodo) =>
            notas.filter((nota) => nota.periodoId === periodo.id)
        );
        const promedios = notasPorPeriodo.map(
            (notasPeriodo) =>
                notasPeriodo.reduce((acc, nota) => acc + (nota.nota || 0), 0) /
                (notasPeriodo.length || 1)
        );
        const promedioFinal =
            promedios.reduce((acc, promedio) => acc + promedio, 0) / promedios.length;
        return promedioFinal;
    };

    return (
        <Container>
            <Row>
                <Col md={12}>
                    <h1>Mesas Extraordinarias</h1>
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
                                        <option key={curso.id} value={curso.id}>
                                            {curso.nombre}
                                        </option>
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
                                        <option key={asignatura.id} value={asignatura.id}>
                                            {asignatura.nombre}
                                        </option>
                                    ))}
                                </Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <h2>Alumnos</h2>
                    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", width: "100%" }}>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Apellido y Nombre</th>
                                    <th>Calificación Final</th>
                                    <th>Extraordinaria de DIC</th>
                                    <th>Extraordinaria de FEB</th>
                                    <th>Calificación Definitiva</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(alumnos) &&
                                    alumnos.map((alumno) => {
                                        const calificacionFinal = getCalificacionParcialPromedio(alumno.notas);
                                        return (
                                            <tr key={alumno.id}>
                                                <td>{`${alumno.apellido}, ${alumno.nombre}`}</td>
                                                <td>{calificacionFinal.toFixed(2)}</td>
                                                <td>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        value={alumno.extraordinariaDic || ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (value === "" || (Number(value) >= 0 && Number(value) <= 10)) {
                                                                alumno.extraordinariaDic = Number(value);
                                                            }
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        value={alumno.extraordinariaFeb || ""}
                                                        onChange={(e) => {
                                                            const value = e.target.value;
                                                            if (value === "" || (Number(value) >= 0 && Number(value) <= 10)) {
                                                                alumno.extraordinariaFeb = Number(value);
                                                            }
                                                        }}
                                                    />
                                                </td>
                                                <td>
                                                    {(
                                                        (Number(alumno.extraordinariaDic) + Number(alumno.extraordinariaFeb)) /
                                                        2
                                                    ).toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </Table>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

export default MesasExtraordinarias;
