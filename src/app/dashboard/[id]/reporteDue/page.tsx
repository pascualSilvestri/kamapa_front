"use client";

import React, { useEffect, useState, useRef } from "react";
import {
    Container,
    Row,
    Col,
    Form,
    Button,
    ButtonProps,
} from "react-bootstrap";
import { Asignatura, Nota, Periodo, CicloLectivo, Curso, Alumno } from "model/types";
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
    const [cursos, setCursos] = useState<Curso[]>([]);
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
            setCursos(data.ciclosLectivo.cursos);
        } catch (error) {
            console.error("Error fetching cursos y alumnos:", error);
        }
    };

    const fetchAsignaturasYNotas = async () => {
        try {
            const response = await fetch(
                `${Environment.getEndPoint(
                    Environment.endPoint.getNotasByAlumnoForCicloElectivo
                )}`,
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

            // Ordenar periodos por fecha de creación
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

    const calcularPromedioGeneral = (notasPorPeriodo: {
        [key: number]: Nota[];
    }) => {
        const todasLasNotas = Object.values(notasPorPeriodo).flat();
        const evaluaciones = todasLasNotas.filter(
            (nota) => nota.tipoNota?.id === 1
        );
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
                            <p>Ministerio de Educación de Tucumán</p>
                            <p>República Argentina</p>
                        </div>
                    </div>
                </div>
                <hr style={{ border: "1px solid #000", marginBottom: "20px" }} />
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <h2 style={{ textTransform: "uppercase", fontSize: "20px" }}>
                        {institucionSelected.nombre}
                    </h2>
                    <p style={{ fontSize: "16px" }}>{institucionSelected.direccion}</p>
                    <p style={{ fontSize: "16px" }}>{institucionSelected.telefono}</p>
                    <p style={{ fontSize: "16px" }}>
                        Ciclo Lectivo: {selectedCicloLectivo}
                    </p>
                </div>
                <hr style={{ border: "1px solid #000", marginBottom: "20px" }} />
                <div style={{ marginBottom: "20px" }}>
                    <p style={{ fontSize: "16px" }}>Nombre del Alumno: {user?.nombre}</p>
                    <p style={{ fontSize: "16px" }}>Curso: {user?.curso?.nombre}</p>
                </div>

                <h3 style={{ textAlign: "center", marginBottom: "20px", fontSize: "18px" }}>
                    INFORME DE CALIFICACIONES
                </h3>

                {/* Tabla de Notas */}
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={{ border: "1px solid #000", padding: "8px" }}>
                                Asignaturas
                            </th>
                            {periodos.map((periodo) => (
                                <th
                                    key={periodo.id}
                                    style={{ border: "1px solid #000", padding: "8px" }}
                                >
                                    {periodo.nombre}
                                </th>
                            ))}
                            <th style={{ border: "1px solid #000", padding: "8px" }}>
                                Promedio
                            </th>
                            <th style={{ border: "1px solid #000", padding: "8px" }}>
                                Recupera Diciembre
                            </th>
                            <th style={{ border: "1px solid #000", padding: "8px" }}>
                                Recupera Febrero
                            </th>
                            <th style={{ border: "1px solid #000", padding: "8px" }}>
                                Calificación Final
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {asignaturas.map((asignatura) => {
                            const notasPorPeriodo = asignatura.notasPorPeriodo;
                            const notasExtraordinarias = asignatura.notasExtraordinarias;

                            const reDiciembre = getNotaExtraordinaria(notasExtraordinarias, 3);
                            const reFebrero = getNotaExtraordinaria(notasExtraordinarias, 4);
                            const calificacionFinal = calcularCalificacionFinal(
                                notasPorPeriodo,
                                reDiciembre,
                                reFebrero
                            );

                            return (
                                <tr key={asignatura.id}>
                                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                                        {asignatura.nombre}
                                    </td>
                                    {periodos.map((periodo) => (
                                        <td
                                            key={periodo.id}
                                            style={{ border: "1px solid #000", padding: "8px" }}
                                        >
                                            {calcularPromedioPorPeriodo(notasPorPeriodo[periodo.id])}
                                        </td>
                                    ))}
                                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                                        {calcularPromedioGeneral(notasPorPeriodo)}
                                    </td>
                                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                                        {reDiciembre !== null ? reDiciembre.toFixed(2) : "-"}
                                    </td>
                                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                                        {reFebrero !== null ? reFebrero.toFixed(2) : "-"}
                                    </td>
                                    <td style={{ border: "1px solid #000", padding: "8px" }}>
                                        {calificacionFinal}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        )
    );

    PDFContent.displayName = "PDFContent";

    const generatePDF = () => {
        const input = pdfRef.current;
        if (!input) return;

        html2canvas(input).then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF();
            const imgProperties = pdf.getImageProperties(imgData);
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight =
                (imgProperties.height * pdfWidth) / imgProperties.width;
            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Informe_Calificaciones_${user?.nombre}.pdf`);
        });
    };

    return (
        <Container>
            <h1>Reporte de Calificaciones</h1>
            <Form>
                <Row>
                    <Col>
                        <Form.Group controlId="formCicloLectivo">
                            <Form.Label>Ciclo Lectivo</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedCicloLectivo}
                                onChange={(e) => setSelectedCicloLectivo(e.target.value)}
                            >
                                {ciclosLectivos.map((ciclo) => (
                                    <option key={ciclo.id} value={ciclo.id}>
                                        {ciclo.anio}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group controlId="formCurso">
                            <Form.Label>Curso</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedCurso}
                                onChange={(e) => setSelectedCurso(e.target.value)}
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
                    <Col>
                        <Form.Group controlId="formAlumno">
                            <Form.Label>Alumno</Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedAlumno}
                                onChange={(e) => setSelectedAlumno(e.target.value)}
                                disabled={!selectedCurso}
                            >
                                <option value="">Seleccionar alumno</option>
                                {alumnos.map((alumno) => (
                                    <option key={alumno.id} value={alumno.id}>
                                        {alumno.nombre}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
            <PDFContent
                ref={pdfRef}
                user={user}
                institucionSelected={institucionSelected}
                asignaturas={asignaturas}
                periodos={periodos}
            />
            <Button variant="primary" onClick={generatePDF}>
                Generar PDF
            </Button>
        </Container>
    );
};

export default reporteDue;
