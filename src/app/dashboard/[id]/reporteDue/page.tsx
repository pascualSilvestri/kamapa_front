"use client";

import React, { useEffect, useState, useRef } from "react";
import {
    Container,
    Row,
    Col,
    Form,
    Button,
} from "react-bootstrap";
import {
    Asignatura,
    Nota,
    Periodo,
    CicloLectivo,
    Curso,
    Alumno,
} from "model/types";
import {
    useUserContext,
    useInstitucionSelectedContext,
} from "context/userContext";
import { useCicloLectivo } from "context/CicloLectivoContext";
import styled from "styled-components";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Environment } from "utils/EnviromenManager";

interface PDFContentProps {
    user: Alumno;
    institucionSelected: any;
    asignaturas: Asignatura[];
    periodos: Periodo[];
}

const reporteDue = ({ params }: { params: { id: string } }) => {
    const [asignaturas, setAsignaturas] = useState<Asignatura[]>([]);
    const [periodos, setPeriodos] = useState<Periodo[]>([]);
    const [ciclosLectivos, setCiclosLectivos] = useState<CicloLectivo[]>([]);
    const [cursos, setCursos] = useState<any[]>([]);
    const [alumnos, setAlumnos] = useState<Alumno[]>([]);
    const [selectedCurso, setSelectedCurso] = useState<string>("");
    const [selectedAlumno, setSelectedAlumno] = useState<string>("");
    const [user, setUser] = useState<Alumno | null>(null);
    const [institucionSelected] = useInstitucionSelectedContext();
    const [cicloLectivo, setCicloLectivo] = useCicloLectivo();
    const [selectedCicloLectivo, setSelectedCicloLectivo] = useState<string>(
        cicloLectivo ? cicloLectivo.id.toString() : ""
    );
    const pdfRef = useRef(null);

    useEffect(() => {
        fetchCiclosLectivos();
    }, []);

    useEffect(() => {
        if (selectedCicloLectivo) {
            fetchCursosYAlumnos();
        }
    }, [selectedCicloLectivo]);

    useEffect(() => {
        if (selectedAlumno) {
            fetchAsignaturasYNotas();
        }
    }, [selectedAlumno]);

    const fetchCiclosLectivos = async () => {
        try {
            const response = await fetch(
                `${Environment.getEndPoint(Environment.endPoint.getAllCicloLectivo)}${params.id}`
            );
            const data = await response.json();
            setCiclosLectivos(data);
            const activeCiclo = data.find((ciclo: CicloLectivo) => ciclo.isActive);
            if (activeCiclo) {
                setSelectedCicloLectivo(activeCiclo.id.toString());
            }
        } catch (error) {
            console.error("Error fetching ciclos lectivos:", error);
        }
    };

    const fetchCursosYAlumnos = async () => {
        try {
            const response = await fetch(
                `${Environment.getEndPoint(Environment.endPoint.getNotasByCurso)}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        cicloLectivoId: selectedCicloLectivo,
                    }),
                }
            );
            const data = await response.json();
            console.log(data);
            setCursos(data.ciclosLectivo.cursos);
            setAlumnos(data.ciclosLectivo.cursos.flatMap((curso: Curso) => curso.alumnos));
        } catch (error) {
            console.error("Error fetching cursos y alumnos:", error);
        }
    };

    const fetchAsignaturasYNotas = async () => {
        try {
            const response = await fetch(
                `${Environment.getEndPoint(Environment.endPoint.getNotasByAlumnoForCicloElectivo)}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        alumnoId: selectedAlumno,
                        cicloLectivoId: selectedCicloLectivo,
                    }),
                }
            );
            const data = await response.json();
            console.log("Fetched data:", data);

            const periodosUnicos: Periodo[] = [];
            data.forEach((item: { asignatura: Asignatura; notas: Nota[] }) => {
                item.notas.forEach((nota: Nota) => {
                    if (
                        nota.periodo &&
                        !periodosUnicos.find((periodo) => periodo.id === nota.periodo.id)
                    ) {
                        periodosUnicos.push(nota.periodo);
                    }
                });
            });

            periodosUnicos.sort(
                (a, b) =>
                    new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()
            );

            setPeriodos(periodosUnicos);

            const asignaturasConNotas = data.map(
                (item: { asignatura: Asignatura; notas: Nota[] }) => {
                    const notasPorPeriodo: { [key: number]: Nota[] } = {};
                    const notasExtraordinarias: Nota[] = [];
                    periodosUnicos.forEach((periodo) => {
                        notasPorPeriodo[periodo.id] = item.notas.filter(
                            (nota) => nota.periodo?.id === periodo.id
                        );
                    });
                    item.notas.forEach((nota) => {
                        if (nota.tipoNota?.id === 3 || nota.tipoNota?.id === 4) {
                            notasExtraordinarias.push(nota);
                        }
                    });
                    return { ...item.asignatura, notasPorPeriodo, notasExtraordinarias };
                }
            );

            setAsignaturas(asignaturasConNotas);
            const selectedUser = alumnos.find(alumno => alumno.id.toString() === selectedAlumno);
            setUser(selectedUser || null);
        } catch (error) {
            console.error("Error fetching asignaturas y notas:", error);
        }
    };

    const calcularPromedioPorPeriodo = (notas: Nota[]) => {
        const evaluaciones = notas.filter((nota) => nota.tipoNota?.id === 1);
        if (evaluaciones.length === 0) return "-";
        const total = evaluaciones.reduce((acc, nota) => acc + nota.nota, 0);
        return (total / evaluaciones.length).toFixed(2);
    };

    const calcularPromedioGeneral = (notasPorPeriodo: { [key: number]: Nota[] }) => {
        const todasLasNotas = Object.values(notasPorPeriodo).flat();
        const evaluaciones = todasLasNotas.filter((nota) => nota.tipoNota?.id === 1);
        if (evaluaciones.length === 0) return "-";
        const total = evaluaciones.reduce((acc, nota) => acc + nota.nota, 0);
        return (total / evaluaciones.length).toFixed(2);
    };

    const getNotaExtraordinaria = (notasExtraordinarias: Nota[], tipoNotaId: number) => {
        const nota = notasExtraordinarias.find((n) => n.tipoNota.id === tipoNotaId);
        return nota ? nota.nota : null;
    };

    const calcularCalificacionFinal = (
        notasPorPeriodo: { [key: number]: Nota[] },
        reDiciembre: number | null,
        reFebrero: number | null
    ) => {
        if (reFebrero !== null) {
            return reFebrero.toFixed(2);
        } else if (reDiciembre !== null) {
            const promedios = Object.values(notasPorPeriodo)
                .map((notas) => calcularPromedioPorPeriodo(notas))
                .filter((promedio) => promedio !== "-")
                .map(Number);

            const maxPromedio = promedios.length > 0 ? Math.max(...promedios) : 0;
            const final = (reDiciembre + maxPromedio) / 2;
            return final.toFixed(2);
        } else {
            return "-";
        }
    };

    const PDFContent = React.forwardRef<HTMLDivElement, PDFContentProps>(
        ({ user, institucionSelected, asignaturas, periodos }, ref) => (
            <div ref={ref} style={{ padding: "20px", border: "1px solid #000" }}>
                {/* Header Section */}
                <div style={{ textAlign: "center" }}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <div>
                            <img
                                src={institucionSelected.logo || "/Logo.png"}
                                alt="Logo"
                                style={{ maxWidth: "100px", height: "auto" }}
                            />
                        </div>
                        <div>
                            <h1
                                style={{
                                    textAlign: "start",
                                    fontWeight: "bold",
                                    fontSize: "20px",
                                    padding: "5px",
                                }}
                            >
                                Educación Secundaria
                            </h1>
                        </div>
                        <div
                            style={{
                                textAlign: "end",
                                fontSize: "14px",
                                padding: "5px",
                            }}
                        >
                            <p>La Carlota</p>
                            <p>{institucionSelected.direccion}</p>
                            <p>{institucionSelected.telefono}</p>
                        </div>
                    </div>
                    <h2
                        style={{
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "18px",
                            padding: "10px",
                        }}
                    >
                        REPORTE DEL ESTUDIANTE
                    </h2>
                    <h3
                        style={{
                            textAlign: "center",
                            fontWeight: "bold",
                            fontSize: "16px",
                            padding: "10px",
                        }}
                    >
                        {user?.nombre} {user?.apellido}
                    </h3>
                </div>

                {/* Table Section */}
                <div>
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            border: "1px solid #000",
                        }}
                    >
                        <thead>
                            <tr>
                                <th
                                    style={{
                                        border: "1px solid #000",
                                        padding: "5px",
                                        textAlign: "center",
                                    }}
                                >
                                    ASIGNATURAS
                                </th>
                                {periodos.map((periodo) => (
                                    <th
                                        key={periodo.id}
                                        style={{
                                            border: "1px solid #000",
                                            padding: "5px",
                                            textAlign: "center",
                                        }}
                                    >
                                        {periodo.nombre}
                                    </th>
                                ))}
                                <th
                                    style={{
                                        border: "1px solid #000",
                                        padding: "5px",
                                        textAlign: "center",
                                    }}
                                >
                                    PROMEDIO
                                </th>
                                <th
                                    style={{
                                        border: "1px solid #000",
                                        padding: "5px",
                                        textAlign: "center",
                                    }}
                                >
                                    DICIEMBRE
                                </th>
                                <th
                                    style={{
                                        border: "1px solid #000",
                                        padding: "5px",
                                        textAlign: "center",
                                    }}
                                >
                                    FEBRERO
                                </th>
                                <th
                                    style={{
                                        border: "1px solid #000",
                                        padding: "5px",
                                        textAlign: "center",
                                    }}
                                >
                                    CALIFICACIÓN
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {asignaturas.map((asignatura) => (
                                <tr key={asignatura.id}>
                                    <td
                                        style={{
                                            border: "1px solid #000",
                                            padding: "5px",
                                            textAlign: "center",
                                        }}
                                    >
                                        {asignatura.nombre}
                                    </td>
                                    {periodos.map((periodo) => (
                                        <td
                                            key={periodo.id}
                                            style={{
                                                border: "1px solid #000",
                                                padding: "5px",
                                                textAlign: "center",
                                            }}
                                        >
                                            {calcularPromedioPorPeriodo(
                                                asignatura.notasPorPeriodo[periodo.id] || []
                                            )}
                                        </td>
                                    ))}
                                    <td
                                        style={{
                                            border: "1px solid #000",
                                            padding: "5px",
                                            textAlign: "center",
                                        }}
                                    >
                                        {calcularPromedioGeneral(
                                            asignatura.notasPorPeriodo
                                        )}
                                    </td>
                                    <td
                                        style={{
                                            border: "1px solid #000",
                                            padding: "5px",
                                            textAlign: "center",
                                        }}
                                    >
                                        {getNotaExtraordinaria(
                                            asignatura.notasExtraordinarias,
                                            3
                                        )}
                                    </td>
                                    <td
                                        style={{
                                            border: "1px solid #000",
                                            padding: "5px",
                                            textAlign: "center",
                                        }}
                                    >
                                        {getNotaExtraordinaria(
                                            asignatura.notasExtraordinarias,
                                            4
                                        )}
                                    </td>
                                    <td
                                        style={{
                                            border: "1px solid #000",
                                            padding: "5px",
                                            textAlign: "center",
                                        }}
                                    >
                                        {calcularCalificacionFinal(
                                            asignatura.notasPorPeriodo,
                                            getNotaExtraordinaria(
                                                asignatura.notasExtraordinarias,
                                                3
                                            ),
                                            getNotaExtraordinaria(
                                                asignatura.notasExtraordinarias,
                                                4
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    );

    const handleGeneratePDF = () => {
        const input = pdfRef.current;
        if (!input) return;

        html2canvas(input, { scale: 3 }).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const imgWidth = 210;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
            pdf.save("reporte.pdf");
        });
    };

    return (
        <Container>
            <Row>
                <Col>
                    <h1>Generar Reporte del Estudiante</h1>
                    <Form>
                        <Form.Group controlId="formCicloLectivo">
                            <Form.Label>Ciclo Lectivo</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedCicloLectivo}
                                onChange={(e) =>
                                    setSelectedCicloLectivo(e.target.value)
                                }
                            >
                                {ciclosLectivos.map((ciclo) => (
                                    <option key={ciclo.id} value={ciclo.id}>
                                        {ciclo.nombre}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formCurso">
                            <Form.Label>Curso</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedCurso}
                                onChange={(e) => setSelectedCurso(e.target.value)}
                            >
                                <option value="">Seleccione un curso</option>
                                {cursos.map((curso) => (
                                    <option key={curso.id} value={curso.id}>
                                        {curso.nombre}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="formAlumno">
                            <Form.Label>Alumno</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedAlumno}
                                onChange={(e) => setSelectedAlumno(e.target.value)}
                            >
                                <option value="">Seleccione un alumno</option>
                                {alumnos
                                    .filter((alumno) => alumno.curso.id === selectedCurso)
                                    .map((alumno) => (
                                        <option key={alumno.id} value={alumno.id}>
                                            {alumno.nombre} {alumno.apellido}
                                        </option>
                                    ))}
                            </Form.Control>
                        </Form.Group>
                    </Form>
                    <Button onClick={handleGeneratePDF} className="mt-3">
                        Generar PDF
                    </Button>
                    {user && (
                        <div ref={pdfRef}>
                            <PDFContent
                                user={user}
                                institucionSelected={institucionSelected}
                                asignaturas={asignaturas}
                                periodos={periodos}
                            />
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default reporteDue;
