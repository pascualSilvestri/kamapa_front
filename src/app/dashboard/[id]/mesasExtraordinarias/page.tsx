'use client';
import { useEffect, useState } from "react";
import { Container, Row, Col, Form, Button, Table } from "react-bootstrap";
import { Curso, User, Nota, Periodo } from "model/types";
import { Environment } from "utils/EnviromenManager";
import { useUserContext } from "context/userContext";
import { useCicloLectivo } from "context/CicloLectivoContext";

type UserWithGrades = User & {
    calificacionFinal: number;
    notasPorPeriodo: { periodoId: number; promedioNotas: string }[];
};

const MesasExtraordinarias = ({ params }: { params: { id: string } }) => {
    const [cursoSeleccionado, setCursoSeleccionado] = useState<string>("");
    const [asignatura, setAsignatura] = useState<string>("");
    const [cursos, setCursos] = useState<Curso[]>([]);
    const [asignaturas, setAsignaturas] = useState<Curso[]>([]);
    const [alumnos, setAlumnos] = useState<UserWithGrades[]>([]);
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
            const alumnosConNotasBajas: UserWithGrades[] = Array.isArray(data)
                ? data
                    .map((a) => {
                        const notasPorPeriodo = getPromedioNotasPorPeriodo(a.usuario.notas);
                        const calificacionFinal = getCalificacionFinal(notasPorPeriodo);
                        return {
                            ...a.usuario,
                            calificacionFinal,
                            notasPorPeriodo,
                        };
                    })
                    .filter((alumno) => alumno.calificacionFinal < 6)
                    .sort((a, b) => a.apellido.localeCompare(b.apellido))
                : [];
            setAlumnos(alumnosConNotasBajas);
        } catch (error) {
            console.error("Error fetching alumnos:", error);
            setAlumnos([]);
        }
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
        fetchAlumnos();
    };

    const canAddExtraordinariaDic = (calificacionFinal: number) => {
        return calificacionFinal < 6;
    };

    const canAddExtraordinariaFeb = (extraordinariaDic: number) => {
        return extraordinariaDic < 6;
    };

    const getCalificacionDefinitiva = (notasPorPeriodo: { periodoId: number, promedioNotas: string }[], extraordinariaDic: number, extraordinariaFeb: number) => {
        if (extraordinariaFeb != null) {
            return extraordinariaFeb;
        }
        if (extraordinariaDic != null && extraordinariaDic >= 6) {
            const promedio1 = Number(notasPorPeriodo.find(n => n.periodoId === 1)?.promedioNotas || 0);
            const promedio2 = Number(notasPorPeriodo.find(n => n.periodoId === 2)?.promedioNotas || 0);
            return (extraordinariaDic + Math.max(promedio1, promedio2)) / 2;
        }
        return null;
    };

    const getCalificacionFinal = (notasPorPeriodo: { periodoId: number, promedioNotas: string }[]) => {
        const promedio1 = Number(notasPorPeriodo.find(n => n.periodoId === 1)?.promedioNotas || 0);
        const promedio2 = Number(notasPorPeriodo.find(n => n.periodoId === 2)?.promedioNotas || 0);
        return (promedio1 + promedio2) / 2;
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
                                {alumnos.map((alumno) => {
                                    const extraordinariaDic = getNotaExtraordinaria(alumno.notas, 3); // reDiciembre
                                    const extraordinariaFeb = getNotaExtraordinaria(alumno.notas, 4); // reFebrero
                                    const calificacionDefinitiva = getCalificacionDefinitiva(alumno.notasPorPeriodo, extraordinariaDic, extraordinariaFeb);

                                    return (
                                        <tr key={alumno.id}>
                                            <td>{`${alumno.apellido}, ${alumno.nombre}`}</td>
                                            {alumno.notasPorPeriodo.map(({ periodoId, promedioNotas }) => (
                                                <td key={periodoId}>{promedioNotas}</td>
                                            ))}
                                            <td>{alumno.calificacionFinal.toFixed(2)}</td>
                                            <td>
                                                {extraordinariaDic != null ? (
                                                    extraordinariaDic
                                                ) : canAddExtraordinariaDic(alumno.calificacionFinal) ? (
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
                                                ) : canAddExtraordinariaFeb(extraordinariaDic) ? (
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
