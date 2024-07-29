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
    const [extraordinariaNota, setExtraordinariaNota] = useState<{ [key: string]: { dic: string, feb: string } }>({});

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
                `${Environment.getEndPoint(Environment.endPoint.getNotasByAsignaturaByCiclo)}`,
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
            console.log(data);
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

    const getNotaExtraordinaria = (notas: Nota[], tipoNotaId: number) => {
        const nota = notas.find((n) => n.tipoNotaId === tipoNotaId);
        return nota ? nota.nota : null;
    };

    const getPromedioNotasPorPeriodo = (notas: Nota[]) => {
        return periodos.map((periodo) => {
            const notasPeriodo = notas.filter((nota) => nota.periodoId === periodo.id);
            const recuperatorio = notasPeriodo.find(nota => nota.tipoNotaId === 2); // recuperatorio
            const promedioNotas = recuperatorio ? recuperatorio.nota.toFixed(2) : 
                notasPeriodo.length
                ? (notasPeriodo.reduce((acc, nota) => acc + (nota.nota || 0), 0) / notasPeriodo.length).toFixed(2)
                : "";
            return { periodoId: periodo.id, promedioNotas };
        });
    };

    const handleAddNotaExtraordinaria = async (alumnoId: number | string, tipoNotaId: number) => {
        const notaValor = tipoNotaId === 3 ? extraordinariaNota[alumnoId]?.dic : extraordinariaNota[alumnoId]?.feb;

        const response = await fetch(
            `${Environment.getEndPoint(Environment.endPoint.createNotaRecuperacion)}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    asignaturaId: Number(asignatura),
                    alumnoId: Number(alumnoId),
                    nota: notaValor,
                    cicloLectivoId: Number(cicloLectivo.id),
                    tipoNotaId: tipoNotaId,
                }),
            }
        );
        const data = await response.json();
        console.log(data);
        fetchAlumnos();
    };

    const canAddExtraordinariaDic = (notasPorPeriodo: { periodoId: number, promedioNotas: string }[]) => {
        const periodo1 = notasPorPeriodo.find(n => n.periodoId === 5); // periodo 1
        const periodo2 = notasPorPeriodo.find(n => n.periodoId === 6); // periodo 2

        if (!periodo1 || !periodo2) return false;

        const promedio1 = Number(periodo1.promedioNotas);
        const promedio2 = Number(periodo2.promedioNotas);

        return (promedio1 < 6 || promedio2 < 6);
    };

    const canAddExtraordinariaFeb = (notasPorPeriodo: { periodoId: number, promedioNotas: string }[], extraordinariaDic: number) => {
        const periodo1 = notasPorPeriodo.find(n => n.periodoId === 5); // periodo 1
        const periodo2 = notasPorPeriodo.find(n => n.periodoId === 6); // periodo 2

        if (!periodo1 || !periodo2) return false;

        const promedio1 = Number(periodo1.promedioNotas);
        const promedio2 = Number(periodo2.promedioNotas);

        return (promedio1 < 6 && promedio2 < 6) || extraordinariaDic < 6;
    };

    const getCalificacionDefinitiva = (notasPorPeriodo: { periodoId: number, promedioNotas: string }[], extraordinariaDic: number, extraordinariaFeb: number) => {
        if (extraordinariaFeb != null) {
            return extraordinariaFeb;
        }
        if (extraordinariaDic != null && extraordinariaDic >= 6) {
            const promedio1 = Number(notasPorPeriodo.find(n => n.periodoId === 5)?.promedioNotas || 0);
            const promedio2 = Number(notasPorPeriodo.find(n => n.periodoId === 6)?.promedioNotas || 0);
            return (extraordinariaDic + Math.max(promedio1, promedio2)) / 2;
        }
        return null;
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
                                    {periodos.map((periodo) => (
                                        <th key={periodo.id}>Periodo {periodo.nombre}</th>
                                    ))}
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
                                        const notasPorPeriodo = getPromedioNotasPorPeriodo(alumno.notas);
                                        const extraordinariaDic = getNotaExtraordinaria(alumno.notas, 3); // reDiciembre
                                        const extraordinariaFeb = getNotaExtraordinaria(alumno.notas, 4); // reFebrero
                                        const calificacionDefinitiva = getCalificacionDefinitiva(notasPorPeriodo, extraordinariaDic, extraordinariaFeb);

                                        return (
                                            <tr key={alumno.id}>
                                                <td>{`${alumno.apellido}, ${alumno.nombre}`}</td>
                                                {notasPorPeriodo.map(({ periodoId, promedioNotas }) => (
                                                    <td key={periodoId}>{promedioNotas}</td>
                                                ))}
                                                <td>{calificacionFinal.toFixed(2)}</td>
                                                <td>
                                                    {extraordinariaDic != null ? (
                                                        extraordinariaDic
                                                    ) : canAddExtraordinariaDic(notasPorPeriodo) ? (
                                                        <>
                                                            <Form.Control
                                                                type="number"
                                                                min="0"
                                                                max="10"
                                                                value={extraordinariaNota[alumno.id]?.dic || ""}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (value === "" || (Number(value) >= 0 && Number(value) <= 10)) {
                                                                        setExtraordinariaNota({
                                                                            ...extraordinariaNota,
                                                                            [alumno.id]: {
                                                                                ...extraordinariaNota[alumno.id],
                                                                                dic: value,
                                                                            },
                                                                        });
                                                                    }
                                                                }}
                                                            />
                                                            <Button
                                                                onClick={() => handleAddNotaExtraordinaria(alumno.id, 3)}
                                                            >
                                                                Agregar Nota
                                                            </Button>
                                                        </>
                                                    ) : ""}
                                                </td>
                                                <td>
                                                    {extraordinariaFeb != null ? (
                                                        extraordinariaFeb
                                                    ) : canAddExtraordinariaFeb(notasPorPeriodo, extraordinariaDic) ? (
                                                        <>
                                                            <Form.Control
                                                                type="number"
                                                                min="0"
                                                                max="10"
                                                                value={extraordinariaNota[alumno.id]?.feb || ""}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (value === "" || (Number(value) >= 0 && Number(value) <= 10)) {
                                                                        setExtraordinariaNota({
                                                                            ...extraordinariaNota,
                                                                            [alumno.id]: {
                                                                                ...extraordinariaNota[alumno.id],
                                                                                feb: value,
                                                                            },
                                                                        });
                                                                    }
                                                                }}
                                                            />
                                                            <Button
                                                                onClick={() => handleAddNotaExtraordinaria(alumno.id, 4)}
                                                            >
                                                                Agregar Nota
                                                            </Button>
                                                        </>
                                                    ) : ""}
                                                </td>
                                                <td>
                                                    {typeof calificacionDefinitiva === "number"
                                                        ? calificacionDefinitiva.toFixed(2)
                                                        : ""}
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
